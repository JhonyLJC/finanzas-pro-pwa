import React from 'react';
import { Calendar as CalendarIcon, List, Plus, Settings, ClipboardList, Home } from 'lucide-react';

export default function BottomNav({ view, setView, setIsSettingsOpen }) {
  return (
    <div className="md:hidden fixed bottom-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/10 z-30 px-6 py-2 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
        <div className="flex justify-between items-center relative">
            <button onClick={() => setView('home')}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${view === 'home' ? 'text-blue-600 dark:text-blue-500' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}>
                <Home size={24} />
                <span className="text-[10px] font-bold">Inicio</span>
            </button>

            {/* Spacer reservado para el botón FAB que flota encima */}
            <div className="w-16"></div>

            <button onClick={() => setIsSettingsOpen(true)}
                className="flex flex-col items-center gap-1 p-2 rounded-xl transition-colors text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                <Settings size={24} />
                <span className="text-[10px] font-bold">Ajustes</span>
            </button>
        </div>
    </div>
  );
}
