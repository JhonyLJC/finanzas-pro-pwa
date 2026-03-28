import React from 'react';
import { TrendingUp, Settings, Sun, Moon, LogOut } from 'lucide-react';
import { isMock } from '../../lib/firebase';

export default function TopHeader({ role, user, isDarkMode, setIsDarkMode, setIsSettingsOpen, onLogout, canManageCategories }) {
  return (
    <header className="bg-white/90 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200 dark:border-white/5 sticky top-0 z-30 px-4 py-3 flex items-center justify-between transition-colors shadow-sm dark:shadow-none">
        <div className="flex items-center gap-2">
            <div className="bg-blue-600 dark:bg-blue-500 p-2 rounded-lg text-white">
                <TrendingUp size={20} />
            </div>
            <h1 className="font-bold text-lg tracking-tight">FinanzasPro <span className="text-blue-600 dark:text-blue-400">PWA</span></h1>
        </div>

        <div className="flex items-center gap-2">
            {/* Info de usuario — solo escritorio */}
            <div className="hidden md:flex flex-col items-end mr-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{role}</span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[160px]">
                  {user?.email || 'Usuario'}
                </span>
            </div>

            {/* Modo oscuro */}
            <button onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-600 dark:text-slate-300"
                title={isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
                >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Configuración — solo admin */}
            {canManageCategories && (
              <button onClick={() => setIsSettingsOpen(true)}
                  className="hidden md:flex p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-600 dark:text-slate-300"
                  title="Configuración de Categorías"
                  >
                  <Settings size={20} />
              </button>
            )}

            {/* Cerrar sesión — solo si no es Mock */}
            {!isMock && onLogout && (
              <button
                onClick={onLogout}
                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400"
                title="Cerrar sesión"
              >
                <LogOut size={20} />
              </button>
            )}
        </div>
    </header>
  );
}
