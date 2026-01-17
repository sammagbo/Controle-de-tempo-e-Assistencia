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
import { parseMeetingPDF } from '../lib/pdfParser';

interface SetupItem extends MeetingPart {
  customTitle?: string;
  assignedNames?: string;
}

const SetupSession: React.FC = () => {
  const navigate = useNavigate();
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [items, setItems] = useState<SetupItem[]>(
    DEFAULT_MEETING_TEMPLATE.map(item => ({ ...item }))
  );
  const [selectedDay, setSelectedDay] = useState('Tuesday');
  const [presidentName, setPresidentName] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedMeetingId = localStorage.getItem('active_meeting_id');
    if (storedMeetingId) {
      setMeetingId(storedMeetingId);
    }

    // Auto-fill Congregation for songs if empty
    setItems(currentItems =>
      currentItems.map(item => {
        if ((item.title.startsWith('Cântico') || item.title.includes('Cântico')) && !item.assignedNames) {
          return { ...item, assignedNames: 'Congregação' };
        }
        return item;
      })
    );
  }, []);

  // Update Initial/Final Comments when President Name changes
  useEffect(() => {
    if (!presidentName) return;

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

  const totalDuration = getTotalEstimatedMinutes(items);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const parsedParts = await parseMeetingPDF(file);

      if (parsedParts.length === 0) {
        alert('Não foi possível extrair partes do PDF. Verifique se é uma apostila válida.');
        setImporting(false);
        return;
      }

      // Merge logic:
      // Vamos manter as partes fixas que não foram encontradas e substituir/adicionar as encontradas.
      // Como o parser retorna apenas as partes variáveis identificadas (Ministério, Vida Cristã),
      // precisamos ser inteligentes.

      // Estratégia: Resetar para o template padrão e substituir as seções dinâmicas
      const baseItems = DEFAULT_MEETING_TEMPLATE.map(item => ({ ...item }));

      // Separar os novos items por seção
      const newMinisterio = parsedParts.filter(p => p.section === 'ministerio');
      const newVidaCrista = parsedParts.filter(p => p.section === 'vida_crista');

      // Se encontrou ministério, substituir TODOS os items de ministério do template
      // com os novos. (Exceto talvez o fixo se houver, mas S-38-T diz que variam)
      let finalItems = [...baseItems];

      if (newMinisterio.length > 0) {
        // Remove items de ministério padrão
        finalItems = finalItems.filter(i => i.section !== 'ministerio');
        // Adiciona novos
        const ministerioItems = newMinisterio.map((p, idx) => ({
          id: `imported-min-${idx}`,
          title: p.title || 'Parte Importada',
          estimatedMinutes: p.estimatedMinutes || 5,
          section: 'ministerio' as SectionKey,
          allowsComments: p.allowsComments || false,
          requiresPostComment: p.requiresPostComment || true
        }));
        // Inserir antes de Vida Cristã (encontrar índice)
        // Simplificação: vamos reordenar tudo no final ou inserir em posições conhecidas?
        // Vamos apenas dar append e deixar o filter no render resolver, 
        // mas a ordem do array importa para o banco.
        // Melhor reconstruir o array.
      }

      if (newVidaCrista.length > 0) {
        // Vida Cristã tem partes fixas (Cântico, Estudo). O parser ignorou essas.
        // O parser retornou apenas as partes variáveis do meio.
        // Vamos remover a parte "Necessidades / Parte Local" padrão e inserir as novas lá.

        // Identificar items vida crista padrão para manter (Cânticos, Estudo)
        // Geralmente IDs vida-crista-1 (cântico), vida-crista-3 (estudo)
        const fixedVidaCrista = finalItems.filter(i =>
          i.section === 'vida_crista' &&
          (i.title.includes('Cântico') || i.title.includes('Estudo Bíblico'))
        );

        // Remover todos de vida crista
        finalItems = finalItems.filter(i => i.section !== 'vida_crista');

        const importedVidaCrista = newVidaCrista.map((p, idx) => ({
          id: `imported-vc-${idx}`,
          title: p.title || 'Parte Vida Cristã',
          estimatedMinutes: p.estimatedMinutes || 10,
          section: 'vida_crista' as SectionKey,
          allowsComments: p.allowsComments ?? true,
          requiresPostComment: p.requiresPostComment || false
        }));

        // Reconstruir Vida Cristã: Cântico Inicial > Importados > Estudo (se houver) > Cântico Final (que está em encerramento)
        // No template, Cântico é o primeiro de vida crista.
        // Estudo é o último.

        // Adicionar de volta ao pool... mas espere.
        // O código acima ("Separar os novos items") estava apenas preparando.
        // Vamos fazer uma reconstrução limpa.
      }

      // Reconstrução Limpa baseada em Seções
      // 1. Abertura (Fixo)
      // 2. Tesouros (Fixo)
      // 3. Ministério (Substituído se houver importação)
      // 4. Vida Cristã (Híbrido)
      // 5. Encerramento (Fixo)

      const abertura = baseItems.filter(i => i.section === 'abertura');
      const tesouros = baseItems.filter(i => i.section === 'tesouros');
      const encerramento = baseItems.filter(i => i.section === 'encerramento');

      let ministerio = baseItems.filter(i => i.section === 'ministerio');
      if (newMinisterio.length > 0) {
        ministerio = newMinisterio.map((p, idx) => ({
          id: `imp-min-${idx}`,
          title: p.title!,
          estimatedMinutes: p.estimatedMinutes || 4,
          section: 'ministerio' as SectionKey,
          allowsComments: p.allowsComments || false,
          requiresPostComment: p.requiresPostComment ?? true
        }));
      }

      let vidaCrista = baseItems.filter(i => i.section === 'vida_crista');
      if (newVidaCrista.length > 0) {
        const cantico = vidaCrista.find(i => i.title.includes('Cântico')) || {
          id: 'vc-temp-song', title: 'Cântico', estimatedMinutes: 5, section: 'vida_crista', allowsComments: false, requiresPostComment: false
        };
        const estudo = vidaCrista.find(i => i.title.includes('Estudo')) || {
          id: 'vc-temp-study', title: 'Estudo Bíblico de Congregação', estimatedMinutes: 30, section: 'vida_crista', allowsComments: true, requiresPostComment: false
        };

        const middleParts = newVidaCrista.map((p, idx) => ({
          id: `imp-vc-${idx}`,
          title: p.title!,
          estimatedMinutes: p.estimatedMinutes || 10,
          section: 'vida_crista' as SectionKey,
          allowsComments: true,
          requiresPostComment: false
        }));

        vidaCrista = [cantico as SetupItem, ...middleParts, estudo as SetupItem];
      }

      setItems([
        ...abertura,
        ...tesouros,
        ...ministerio,
        ...vidaCrista,
        ...encerramento
      ]);

      alert(`Importação concluída! ${parsedParts.length} partes identificadas.`);

    } catch (error) {
      console.error(error);
      alert('Erro ao processar PDF.');
    } finally {
      setImporting(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
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
      }));

      const { error } = await supabase
        .from('agenda_items')
        .insert(agendaItems);

      if (error) {
        console.error('Error saving agenda items:', error);
        alert('Erro ao salvar agenda. Tente novamente.');
      } else {
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
          {/* Botão de Importar */}
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-sm font-medium transition-colors"
          >
            {importing ? (
              <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-sm">upload_file</span>
            )}
            {importing ? 'Lendo PDF...' : 'Importar PDF'}
          </button>

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

                {/* Parts List */}
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
                      <div className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                        {/* Position */}
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
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
                            onChange={(e) => handleTitleChange(item.id, e.target.value)}
                          />
                          <input
                            type="text"
                            className="w-full bg-transparent border-none p-0 text-primary text-xs focus:ring-0 placeholder-gray-300 mt-1"
                            placeholder="Designado(s): ex. Fulano / Ciclano"
                            value={item.assignedNames || ''}
                            onChange={(e) => handleNamesChange(item.id, e.target.value)}
                          />
                        </div>

                        {/* Duration */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="material-symbols-outlined text-gray-400 text-lg">schedule</span>
                          <input
                            type="number"
                            className="w-14 bg-transparent border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-center text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                            value={item.estimatedMinutes}
                            onChange={(e) => handleDurationChange(item.id, parseInt(e.target.value) || 0)}
                          />
                          <span className="text-xs text-gray-500">min</span>
                        </div>

                        {/* Comment Indicators (Interactive) */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleToggleAllowsComments(item.id)}
                            className={`size-8 flex items-center justify-center rounded-full transition-colors ${item.allowsComments ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            title={item.allowsComments ? "Desativar comentários da assistência" : "Ativar comentários da assistência"}
                          >
                            <span className="material-symbols-outlined text-lg">chat_bubble</span>
                          </button>

                          <button
                            onClick={() => handleToggleRequiresPostComment(item.id)}
                            className={`size-8 flex items-center justify-center rounded-full transition-colors ${item.requiresPostComment ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : 'text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            title={item.requiresPostComment ? "Desativar comentário do instrutor" : "Ativar comentário do instrutor (requerido após parte)"}
                          >
                            <span className="material-symbols-outlined text-lg">record_voice_over</span>
                          </button>

                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="size-8 flex items-center justify-center rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
                            title="Remover parte"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </div>

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
              </div>
            );
          })}
        </div>

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
  );
};

export default SetupSession;