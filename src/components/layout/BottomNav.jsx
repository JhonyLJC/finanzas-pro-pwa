import React from 'react';
import { Calendar as CalendarIcon, Settings, Home, List } from 'lucide-react';

export default function BottomNav({ view, setView, setIsSettingsOpen }) {
  return (
    <div className="md:hidden fixed bottom-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/10 z-30 px-2 py-2 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
        <div className="flex w-full items-center relative max-w-sm mx-auto">
            <div className="flex-1 flex justify-around items-center">
                <button onClick={() => setView('home')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${view === 'home' ? 'text-blue-600 dark:text-blue-500' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                    <Home size={22} />
                    <span className="text-[10px] font-bold">Inicio</span>
                </button>
                <button onClick={() => setView('calendar')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${view === 'calendar' ? 'text-blue-600 dark:text-blue-500' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                    <CalendarIcon size={22} />
                    <span className="text-[10px] font-bold">Calendario</span>
                </button>
            </div>

            <div className="w-16 pointer-events-none"></div>

            <div className="flex-1 flex justify-around items-center">
                <button onClick={() => setView('records')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${view === 'records' ? 'text-blue-600 dark:text-blue-500' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                    <List size={22} />
                    <span className="text-[10px] font-bold">Registros</span>
                </button>
                <button onClick={() => setIsSettingsOpen(true)}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl transition-colors text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                    <Settings size={22} />
                    <span className="text-[10px] font-bold">Ajustes</span>
                </button>
            </div>
        </div>
    </div>
  );
}
