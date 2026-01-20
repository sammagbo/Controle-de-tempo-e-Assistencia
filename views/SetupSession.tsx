import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import {
  DEFAULT_MEETING_TEMPLATE,
  MEETING_SECTIONS,
  SECTION_COLORS,
  MeetingPart,
  SectionKey,
  getTotalEstimatedMinutes
} from '../lib/meetingTemplate';
import {
  getCurrentWeekSchedule,
  getAllScheduleWeeks,
  convertScheduleToMeetingParts,
  isCurrentWeek,
  ScheduleWeek,
} from '../lib/data/officialSchedule2026';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SetupItem extends MeetingPart {
  customTitle?: string;
  assignedNames?: string;
}

// Sortable Item Component
interface SortableItemProps {
  item: SetupItem;
  index: number;
  onTitleChange: (id: string, title: string) => void;
  onNamesChange: (id: string, names: string) => void;
  onDurationChange: (id: string, duration: number) => void;
  onToggleAllowsComments: (id: string) => void;
  onToggleRequiresPostComment: (id: string) => void;
  onDelete: (id: string) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({
  item,
  index,
  onTitleChange,
  onNamesChange,
  onDurationChange,
  onToggleAllowsComments,
  onToggleRequiresPostComment,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 sm:gap-4 px-2 sm:px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group bg-white dark:bg-surface-dark"
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        title="Arrastar para reorganizar"
      >
        <span className="material-symbols-outlined text-lg">drag_indicator</span>
      </button>

      {/* Position */}
      <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
          {index + 1}
        </span>
      </div>

      {/* Title & Names */}
      <div className="flex-1 min-w-0">
        <input
          type="text"
          className="w-full bg-transparent border-none p-0 text-[#111318] dark:text-white text-sm font-medium focus:ring-0 placeholder-gray-400"
          placeholder="Digite o título..."
          value={item.title}
          onChange={(e) => onTitleChange(item.id, e.target.value)}
        />
        <input
          type="text"
          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1.5 text-primary text-sm focus:ring-1 focus:ring-primary focus:border-primary placeholder-gray-400 mt-2 transition-colors"
          placeholder="Nome do irmão/irmã"
          value={item.assignedNames || ''}
          onChange={(e) => onNamesChange(item.id, e.target.value)}
        />
      </div>

      {/* Duration */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <span className="material-symbols-outlined text-gray-400 text-lg">schedule</span>
        <input
          type="number"
          className="w-16 h-10 sm:h-auto sm:w-14 bg-transparent border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-center text-sm focus:border-primary focus:ring-1 focus:ring-primary"
          value={item.estimatedMinutes}
          onChange={(e) => onDurationChange(item.id, parseInt(e.target.value) || 0)}
        />
        <span className="text-xs text-gray-500">min</span>
      </div>

      {/* Comment Indicator (read-only) */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {item.requiresPostComment && (
          <span
            className="size-8 flex items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
            title="Requer comentário do presidente"
          >
            <span className="material-symbols-outlined text-lg">record_voice_over</span>
          </span>
        )}

        <button
          onClick={() => onDelete(item.id)}
          className="size-10 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          title="Remover parte"
        >
          <span className="material-symbols-outlined text-xl">delete</span>
        </button>
      </div>
    </div>
  );
};

const SetupSession: React.FC = () => {
  const navigate = useNavigate();
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<ScheduleWeek | null>(null);
  const [availableWeeks] = useState<ScheduleWeek[]>(getAllScheduleWeeks());
  const [items, setItems] = useState<SetupItem[]>([]);
  const [selectedDay, setSelectedDay] = useState('Tuesday');
  const [presidentName, setPresidentName] = useState('');

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load initial schedule data or restore from localStorage
  useEffect(() => {
    const storedMeetingId = localStorage.getItem('active_meeting_id');
    if (storedMeetingId) {
      setMeetingId(storedMeetingId);
    }

    // Try to restore from localStorage first
    const storedItems = localStorage.getItem('setup_items');
    const storedWeekId = localStorage.getItem('setup_selected_week');
    const storedPresident = localStorage.getItem('setup_president_name');

    if (storedPresident) {
      setPresidentName(storedPresident);
    }

    if (storedItems && storedWeekId) {
      // Restore from localStorage
      try {
        const parsedItems = JSON.parse(storedItems);
        setItems(parsedItems);
        const week = availableWeeks.find(w => w.id === storedWeekId);
        if (week) {
          setSelectedWeek(week);
        }
        return; // Skip default loading
      } catch (e) {
        console.error('Error parsing stored items:', e);
      }
    }

    // Load the current week schedule or default to first available
    const currentWeek = getCurrentWeekSchedule();
    if (currentWeek) {
      setSelectedWeek(currentWeek);
      const parts = convertScheduleToMeetingParts(currentWeek);
      // Auto-fill Congregation for songs
      const partsWithCongregation = parts.map(item => {
        if ((item.title.startsWith('Cântico') || item.title.includes('Cântico')) && !item.assignedNames) {
          return { ...item, assignedNames: 'Congregação' };
        }
        return item;
      }) as SetupItem[];
      setItems(partsWithCongregation);
    } else {
      // Fallback to default template if no schedule found
      setItems(DEFAULT_MEETING_TEMPLATE.map(item => ({ ...item })));
    }
  }, []);

  // Update Initial/Final Comments when President Name changes
  useEffect(() => {
    if (!presidentName) return;

    // Persist president name
    localStorage.setItem('setup_president_name', presidentName);

    setItems(currentItems =>
      currentItems.map(item => {
        // Always update Comentários Iniciais and Comentários Finais with president name
        if (item.title === 'Comentários Iniciais' || item.title === 'Comentários Finais') {
          return { ...item, assignedNames: presidentName };
        }
        return item;
      })
    );
  }, [presidentName]);

  // Persist items to localStorage whenever they change
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem('setup_items', JSON.stringify(items));
    }
  }, [items]);

  // Persist selected week
  useEffect(() => {
    if (selectedWeek) {
      localStorage.setItem('setup_selected_week', selectedWeek.id);
    }
  }, [selectedWeek]);

  const totalDuration = getTotalEstimatedMinutes(items);

  // Handle week selection change
  const handleWeekChange = (weekId: string) => {
    const week = availableWeeks.find(w => w.id === weekId);
    if (week) {
      setSelectedWeek(week);
      const parts = convertScheduleToMeetingParts(week);
      // Auto-fill Congregation for songs
      const partsWithCongregation = parts.map(item => {
        if ((item.title.startsWith('Cântico') || item.title.includes('Cântico')) && !item.assignedNames) {
          return { ...item, assignedNames: 'Congregação' };
        }
        return item;
      }) as SetupItem[];
      setItems(partsWithCongregation);
    }
  };

  const handleTitleChange = (id: string, newTitle: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, title: newTitle } : item
    ));
  };

  const handleDurationChange = (id: string, newDuration: number) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, estimatedMinutes: newDuration } : item
    ));
  };

  const handleToggleAllowsComments = (id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, allowsComments: !item.allowsComments } : item
    ));
  };

  const handleToggleRequiresPostComment = (id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, requiresPostComment: !item.requiresPostComment } : item
    ));
  };

  const handleNamesChange = (id: string, names: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, assignedNames: names } : item
    ));
  };

  const handleAddItem = (section: SectionKey) => {
    const newItem: SetupItem = {
      id: `custom-${Date.now()}`,
      title: 'Nova Parte',
      estimatedMinutes: 5,
      section: section,
      allowsComments: false,
      requiresPostComment: section === 'ministerio', // Ministry parts usually need instructor comment
    };
    setItems(prev => [...prev, newItem]);
  };

  // Insert a new item at a specific position within a section
  const handleInsertItem = (section: SectionKey, afterItemId: string | null) => {
    const newItem: SetupItem = {
      id: `custom-${Date.now()}`,
      title: 'Nova Parte',
      estimatedMinutes: 5,
      section: section,
      allowsComments: false,
      requiresPostComment: section === 'ministerio',
    };

    setItems(prev => {
      // Find all items in this section
      const sectionItems = prev.filter(i => i.section === section);
      const otherItems = prev.filter(i => i.section !== section);

      if (afterItemId === null) {
        // Insert at the beginning of the section
        return [...otherItems, newItem, ...sectionItems].sort((a, b) => {
          // Maintain original section order by re-sorting
          const order = ['abertura', 'tesouros', 'ministerio', 'vida_crista', 'encerramento'];
          return order.indexOf(a.section) - order.indexOf(b.section);
        });
      } else {
        // Insert after a specific item
        const insertIndex = prev.findIndex(i => i.id === afterItemId);
        if (insertIndex === -1) return [...prev, newItem];

        const newItems = [...prev];
        newItems.splice(insertIndex + 1, 0, newItem);
        return newItems;
      }
    });
  };

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // Handle drag end for reordering within sections
  const handleDragEnd = (event: DragEndEvent, sectionKey: SectionKey) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems(prev => {
        const sectionItems = prev.filter(i => i.section === sectionKey);
        const otherItems = prev.filter(i => i.section !== sectionKey);

        const oldIndex = sectionItems.findIndex(i => i.id === active.id);
        const newIndex = sectionItems.findIndex(i => i.id === over.id);

        const reorderedSection = arrayMove(sectionItems, oldIndex, newIndex);

        // Rebuild items maintaining section order
        const sectionOrder: SectionKey[] = ['abertura', 'tesouros', 'ministerio', 'vida_crista', 'encerramento'];
        const allItems = [...otherItems, ...reorderedSection];

        return allItems.sort((a, b) => {
          const sectionCompare = sectionOrder.indexOf(a.section) - sectionOrder.indexOf(b.section);
          if (sectionCompare !== 0) return sectionCompare;

          // Within same section, maintain new order
          if (a.section === sectionKey) {
            return reorderedSection.findIndex((i: SetupItem) => i.id === a.id) - reorderedSection.findIndex((i: SetupItem) => i.id === b.id);
          }
          return 0;
        });
      });
    }
  };

  const handleBeginMeeting = async () => {
    if (!meetingId) {
      alert('Nenhuma reunião ativa. Por favor, inicie uma reunião pelo Painel.');
      navigate('/');
      return;
    }

    if (items.length === 0) {
      alert('Por favor, adicione pelo menos uma parte.');
      return;
    }

    setSaving(true);
    try {
      // Salvar presidente na reunião
      if (presidentName.trim()) {
        const { error: meetingError } = await supabase
          .from('meetings')
          .update({ president: presidentName })
          .eq('id', meetingId);

        if (meetingError) {
          console.error('Error updating meeting president:', meetingError);
        }
      }

      const agendaItems = items.map((item, index) => ({
        meeting_id: meetingId,
        title: item.title,
        estimated_minutes: item.estimatedMinutes,
        position: index + 1,
        status: index === 0 ? 'active' : 'upcoming',
        actual_seconds: 0,
        section: item.section,
        allows_comments: item.allowsComments,
        requires_post_comment: item.requiresPostComment,
        assigned_names: item.assignedNames || '',
        skip_timing: item.skipTiming || false, // v3.0: Cânticos não são cronometrados
      }));

      const { error } = await supabase
        .from('agenda_items')
        .insert(agendaItems);

      if (error) {
        console.error('Error saving agenda items:', error);
        alert('Erro ao salvar agenda. Tente novamente.');
      } else {
        // Clear all timer state before starting new meeting
        localStorage.removeItem('timer_start_timestamp');
        localStorage.removeItem('timer_base_seconds');
        localStorage.removeItem('timer_active_item_id');
        localStorage.removeItem('counsel_mode');
        localStorage.removeItem('counsel_start_timestamp');
        localStorage.removeItem('counsel_base_seconds');
        localStorage.removeItem('counsel_item_title');
        localStorage.removeItem('counsel_item_id');

        navigate('/live');
      }
    } catch (err) {
      console.error('Error saving agenda items:', err);
    } finally {
      setSaving(false);
    }
  };

  // Agrupar items por seção
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {} as Record<SectionKey, SetupItem[]>);

  const sectionOrder: SectionKey[] = ['abertura', 'tesouros', 'ministerio', 'vida_crista', 'encerramento'];

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark text-[#111318] dark:text-white font-display">
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f0f2f4] dark:border-gray-800 bg-surface-light dark:bg-surface-dark px-6 lg:px-10 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-4 text-[#111318] dark:text-white">
          <div className="size-8 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl cursor-pointer" onClick={() => navigate('/')}>timer</span>
          </div>
          <h2 className="text-[#111318] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] cursor-pointer" onClick={() => navigate('/')}>Meeting Manager</h2>
        </div>
        <div className="flex items-center gap-4">
          {/* Week Selector */}
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-gray-500">calendar_month</span>
            <select
              value={selectedWeek?.id || ''}
              onChange={(e) => handleWeekChange(e.target.value)}
              className={`border-none rounded-lg px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer focus:ring-1 focus:ring-primary ${selectedWeek && isCurrentWeek(selectedWeek)
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 ring-1 ring-green-500'
                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
                }`}
            >
              {availableWeeks.map((week) => (
                <option key={week.id} value={week.id}>
                  {isCurrentWeek(week) ? `📅 ${week.dateRange} (ESTA SEMANA)` : week.dateRange}
                </option>
              ))}
            </select>
            {selectedWeek && isCurrentWeek(selectedWeek) && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
                <span className="material-symbols-outlined text-xs">event_available</span>
                ESTA SEMANA
              </span>
            )}
          </div>

          <span className="text-sm text-gray-500 dark:text-gray-400">
            Tempo Total: <span className="font-bold text-primary">{totalDuration} min</span>
          </span>
        </div>
      </header>

      <div className="flex-1 px-4 md:px-8 lg:px-16 py-8 max-w-[1200px] mx-auto w-full">
        {/* Page Header */}
        <div className="mb-8">
          <p className="text-primary text-sm font-semibold uppercase tracking-wider">Configuração</p>
          <h1 className="text-[#111318] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] mt-1">
            Preparar Reunião
          </h1>
          <p className="text-[#616f89] dark:text-gray-400 text-base font-normal leading-normal mt-2">
            Revise as partes da reunião antes de iniciar.
          </p>
        </div>

        {/* President Input */}
        <div className="mb-8">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Presidente da Reunião
          </label>
          <div className="relative">
            <input
              type="text"
              value={presidentName}
              onChange={(e) => setPresidentName(e.target.value)}
              placeholder="Nome do Presidente (ex: Rafael)"
              className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pl-10 text-[#111318] dark:text-white placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              mic
            </span>
          </div>
        </div>

        {/* Sections with Parts */}
        <div className="space-y-6">
          {sectionOrder.map((sectionKey) => {
            const sectionItems = groupedItems[sectionKey] || [];
            if (sectionItems.length === 0) return null;

            const sectionInfo = MEETING_SECTIONS[sectionKey];
            const colors = SECTION_COLORS[sectionKey];
            const sectionDuration = sectionItems.reduce((sum, item) => sum + item.estimatedMinutes, 0);

            return (
              <div key={sectionKey} className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Section Header */}
                <div className={`flex items-center justify-between px-4 py-3 ${colors.bg} border-b ${colors.border}`}>
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined ${colors.text}`}>{sectionInfo.icon}</span>
                    <h3 className={`font-bold ${colors.text}`}>{sectionInfo.label}</h3>
                  </div>
                  <span className={`text-sm font-medium ${colors.text}`}>{sectionDuration} min</span>
                </div>

                {/* Parts List with Drag and Drop */}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(event) => handleDragEnd(event, sectionKey)}
                >
                  <SortableContext
                    items={sectionItems.map(i => i.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="bg-white dark:bg-surface-dark divide-y divide-gray-100 dark:divide-gray-800">
                      {/* Insert at beginning button for ministerio and vida_crista */}
                      {(sectionKey === 'ministerio' || sectionKey === 'vida_crista') && (
                        <div className="flex justify-center py-1 bg-gray-50 dark:bg-gray-800/30">
                          <button
                            onClick={() => handleInsertItem(sectionKey, null)}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors py-1 px-2 rounded hover:bg-white dark:hover:bg-gray-700"
                            title="Inserir parte no início"
                          >
                            <span className="material-symbols-outlined text-sm">add</span>
                            <span>Inserir no início</span>
                          </button>
                        </div>
                      )}

                      {sectionItems.map((item, index) => (
                        <React.Fragment key={item.id}>
                          <SortableItem
                            item={item}
                            index={index}
                            onTitleChange={handleTitleChange}
                            onNamesChange={handleNamesChange}
                            onDurationChange={handleDurationChange}
                            onToggleAllowsComments={handleToggleAllowsComments}
                            onToggleRequiresPostComment={handleToggleRequiresPostComment}
                            onDelete={handleDeleteItem}
                          />

                          {/* Insert button between items (only for ministerio and vida_crista) */}
                          {(sectionKey === 'ministerio' || sectionKey === 'vida_crista') && index < sectionItems.length - 1 && (
                            <div className="flex justify-center py-1 bg-gray-50/50 dark:bg-gray-800/20 border-dashed border-t border-b border-gray-200 dark:border-gray-700">
                              <button
                                onClick={() => handleInsertItem(sectionKey, item.id)}
                                className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors py-0.5 px-2 rounded hover:bg-white dark:hover:bg-gray-700"
                                title="Inserir parte aqui"
                              >
                                <span className="material-symbols-outlined text-sm">add</span>
                                <span>Inserir aqui</span>
                              </button>
                            </div>
                          )}
                        </React.Fragment>
                      ))}

                      {/* Add Item Button */}
                      <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800">
                        <button
                          onClick={() => handleAddItem(sectionKey)}
                          className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors py-1 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <span className="material-symbols-outlined text-lg">add_circle</span>
                          <span>Adicionar parte em {sectionInfo.label}</span>
                        </button>
                      </div>
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            );
          })}
          {/* Legend */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500 text-lg">chat_bubble</span>
              <span className="text-gray-600 dark:text-gray-400">Permite comentários da assistência</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-500 text-lg">record_voice_over</span>
              <span className="text-gray-600 dark:text-gray-400">Requer comentário do instrutor</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-gray-500 text-lg">drag_indicator</span>
              <span className="text-gray-600 dark:text-gray-400">Arraste para reorganizar</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-4 mt-8 pt-6 border-t border-[#f0f2f4] dark:border-gray-800">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-100">
              <span className="material-symbols-outlined mt-0.5">info</span>
              <div className="text-sm">
                <p className="font-bold mb-1">Pronto para começar?</p>
                <p className="opacity-90">Revise as partes e clique em "Iniciar Reunião" para começar o cronômetro.</p>
              </div>
            </div>
            <button
              onClick={handleBeginMeeting}
              disabled={saving}
              className="flex h-14 w-full items-center justify-center rounded-xl bg-primary hover:bg-blue-600 dark:hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              <span className="text-lg font-bold tracking-tight mr-2">{saving ? 'Salvando...' : 'Iniciar Reunião'}</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupSession;