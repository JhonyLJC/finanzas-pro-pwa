import React from 'react';
import { Settings, Sun, Moon, LogOut, ShieldCheck } from 'lucide-react';
import { isMock } from '../../lib/firebase';
import logoImg from '../../assets/logo.png';

export default function TopHeader({ role, user, onOpenSidebar }) {
  return (
    <header className="bg-white/90 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200 dark:border-white/5 sticky top-0 z-30 px-4 py-3 flex items-center justify-between transition-colors shadow-sm dark:shadow-none">
        <div className="flex items-center gap-3">
            {/* Hamburger Button (Mobile Only) */}
            <button onClick={onOpenSidebar} className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </button>
            <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center overflow-hidden p-1 shrink-0">
                <img src={logoImg} alt="FinanzasPro" className="w-full h-full object-contain" />
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
        </div>
    </header>
  );
}
