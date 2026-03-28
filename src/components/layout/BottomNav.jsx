import React from 'react';
import { Calendar as CalendarIcon, List, Plus, Settings, ClipboardList } from 'lucide-react';

export default function BottomNav({ view, setView, setIsModalOpen, setIsSettingsOpen, canCreate }) {
  return (
    <div className="md:hidden fixed bottom-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/10 z-50 px-2 py-2 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
        <div className="flex justify-around items-center relative">
            <button onClick={() => setView('calendar')}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${view === 'calendar' ? 'text-blue-600 dark:text-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-400 dark:text-slate-500'}`}>
                <CalendarIcon size={22} />
                <span className="text-[10px] font-bold">Mes</span>
            </button>

            <button onClick={() => setView('list')}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${view === 'list' ? 'text-blue-600 dark:text-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-400 dark:text-slate-500'}`}>
                <List size={22} />
                <span className="text-[10px] font-bold">Pendientes</span>
            </button>

            {/* Floating Action Button — solo si puede crear */}
            {canCreate && (
                <div className="relative -mt-6">
                    <button onClick={() => setIsModalOpen(true)}
                        className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-500/40 dark:shadow-[0_4px_20px_rgba(59,130,246,0.6)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all border-4 border-white dark:border-slate-900"
                    >
                        <Plus size={28} />
                    </button>
                </div>
            )}

            <button onClick={() => setView('records')}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${view === 'records' ? 'text-blue-600 dark:text-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-400 dark:text-slate-500'}`}>
                <ClipboardList size={22} />
                <span className="text-[10px] font-bold">Registros</span>
            </button>

            <button onClick={() => setIsSettingsOpen(true)}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                <Settings size={22} />
                <span className="text-[10px] font-bold">Ajustes</span>
            </button>
        </div>
    </div>
  );
}
