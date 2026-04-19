import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { MEETING_SECTIONS, SECTION_COLORS, SectionKey } from '../lib/meetingTemplate';
import type { AgendaItem } from '../types';

const DisplayMode: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [currentItem, setCurrentItem] = useState<AgendaItem | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [meetingActive, setMeetingActive] = useState(false);

    // Fetch current active item
    const fetchCurrentItem = useCallback(async () => {
        const meetingId = localStorage.getItem('active_meeting_id');
        if (!meetingId) {
            setMeetingActive(false);
            setLoading(false);
            return;
        }

        setMeetingActive(true);

        const { data, error } = await supabase
            .from('agenda_items')
            .select('id, title, estimated_minutes, actual_seconds, position, status, section')
            .eq('meeting_id', meetingId)
            .eq('status', 'active')
            .single();

        if (error) {
            console.error('Error fetching active item:', error);
        } else if (data) {
            setCurrentItem(data as AgendaItem);
            setElapsedSeconds(data.actual_seconds || 0);
            setIsRunning(true);
        }

        setLoading(false);
    }, []);

    // Initial fetch and polling
    useEffect(() => {
        fetchCurrentItem();

        // Poll every 2 seconds to sync with LiveMeeting
        const interval = setInterval(fetchCurrentItem, 2000);
        return () => clearInterval(interval);
    }, [fetchCurrentItem]);

    // Timer effect
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isRunning && currentItem) {
            timer = setInterval(() => {
                setElapsedSeconds(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isRunning, currentItem]);

    // Format time display
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate progress/overtime
    const getTimeStatus = () => {
        if (!currentItem) return { isOvertime: false, difference: 0 };
        const estimatedSeconds = currentItem.estimated_minutes * 60;
        const difference = elapsedSeconds - estimatedSeconds;
        return { isOvertime: difference > 0, difference };
    };

    // Toggle fullscreen
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    // Get section styling
    const getSectionStyle = () => {
        if (!currentItem) return { bg: 'bg-gray-900', text: 'text-white', accent: 'text-gray-400' };

        const sectionKey = currentItem.section;
        const colors: Record<SectionKey, { bg: string; text: string; accent: string }> = {
            abertura: { bg: 'bg-gray-900', text: 'text-white', accent: 'text-gray-400' },
            tesouros: { bg: 'bg-amber-950', text: 'text-amber-100', accent: 'text-amber-400' },
            ministerio: { bg: 'bg-green-950', text: 'text-green-100', accent: 'text-green-400' },
            vida_crista: { bg: 'bg-purple-950', text: 'text-purple-100', accent: 'text-purple-400' },
            encerramento: { bg: 'bg-gray-900', text: 'text-white', accent: 'text-gray-400' }
        };

        return colors[sectionKey] || colors.abertura;
    };

    const styles = getSectionStyle();
    const { isOvertime, difference } = getTimeStatus();

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center">
                <span className="material-symbols-outlined animate-spin text-6xl text-white">progress_activity</span>
            </div>
        );
    }

    if (!meetingActive) {
        return (
            <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center gap-8 text-white">
                <span className="material-symbols-outlined text-8xl text-gray-600">tv_off</span>
                <h1 className="text-3xl font-bold">Nenhuma Reunião Ativa</h1>
                <p className="text-gray-400">Inicie uma reunião para usar o Modo Telão</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-primary rounded-lg font-bold hover:bg-blue-600 transition-colors"
                >
                    Ir para o Painel
                </button>
            </div>
        );
    }

    return (
        <div
            className={`fixed inset-0 ${styles.bg} flex flex-col items-center justify-center cursor-none transition-colors duration-500`}
            onClick={toggleFullscreen}
        >
            {/* Section Indicator */}
            {currentItem && (
                <div className={`absolute top-8 left-8 flex items-center gap-3 ${styles.accent}`}>
                    <span className="material-symbols-outlined text-4xl">
                        {MEETING_SECTIONS[currentItem.section]?.icon || 'timer'}
                    </span>
                    <span className="text-2xl font-bold uppercase tracking-wider">
                        {MEETING_SECTIONS[currentItem.section]?.label || 'Reunião'}
                    </span>
                </div>
            )}

            {/* Part Number */}
            {currentItem && (
                <div className="absolute top-8 right-8">
                    <span className={`text-6xl font-black ${styles.accent} opacity-50`}>
                        #{currentItem.position}
                    </span>
                </div>
            )}

            {/* Main Timer */}
            <div className="flex flex-col items-center gap-8">
                {/* Timer Display */}
                <div className={`font-mono font-black tracking-tighter ${isOvertime ? 'text-red-500' : styles.text}`}
                    style={{ fontSize: 'clamp(8rem, 25vw, 20rem)' }}>
                    {isOvertime && <span className="text-red-400">+</span>}
                    {formatTime(isOvertime ? Math.abs(difference) : elapsedSeconds)}
                </div>

                {/* Estimated Time */}
                {currentItem && (
                    <div className={`flex items-center gap-4 ${styles.accent} text-3xl`}>
                        <span className="material-symbols-outlined text-4xl">schedule</span>
                        <span>Tempo previsto: {currentItem.estimated_minutes} min</span>
                    </div>
                )}
            </div>

            {/* Part Title */}
            {currentItem && (
                <div className={`absolute bottom-20 left-0 right-0 px-16 text-center ${styles.text}`}>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                        {currentItem.title}
                    </h1>
                </div>
            )}

            {/* Instructions */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gray-500 text-sm">
                Clique para alternar tela cheia • ESC para sair
            </div>

            {/* Exit Button (visible on hover) */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    navigate('/live');
                }}
                className="absolute top-4 left-4 p-3 rounded-full bg-white/10 text-white opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
            >
                <span className="material-symbols-outlined">arrow_back</span>
            </button>
        </div>
    );
};

export default DisplayMode;
