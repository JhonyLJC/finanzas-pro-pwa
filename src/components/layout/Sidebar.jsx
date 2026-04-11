import React, { useState } from 'react';
import { Home, Calendar, List, ClipboardList, Crown, ShieldCheck, X, TrendingUp, Settings, ChevronLeft, ChevronRight, ListChecks, Users } from 'lucide-react';

export default function Sidebar({ isOpen, setIsOpen, view, setView, isAdmin, setIsSettingsOpen }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Inicio', icon: <Home size={20} /> },
    { id: 'calendar', label: 'Calendario', icon: <Calendar size={20} /> },
    { id: 'paymentList', label: 'Pagos Pendientes', icon: <List size={20} /> },
    { id: 'receivableList', label: 'Cobros Pendientes', icon: <ListChecks size={20} /> },
    { id: 'records', label: 'Registros', icon: <ClipboardList size={20} /> },
    { id: 'subscription', label: 'Planes Premium', icon: <Crown size={20} /> }
  ];

  if (isAdmin) {
    menuItems.push({ id: 'team', label: 'Mi Equipo', icon: <Users size={20} /> });
  }

  const handleNav = (id) => {
    setView(id);
    if(window.innerWidth < 768) {
       setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/10
        flex flex-col h-full transform transition-all duration-300 ease-in-out shadow-2xl md:shadow-none
        md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}>
        {/* Header */}
        <div className={`h-[65px] flex items-center px-4 border-b border-slate-200 dark:border-white/5 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
           <div className={`flex items-center gap-2 ${isCollapsed ? 'hidden text-transparent' : 'w-auto'}`}>
            <div className="bg-blue-600 dark:bg-blue-500 p-1.5 rounded-lg text-white shrink-0">
                <TrendingUp size={18} />
            </div>
            <span className="font-black text-lg tracking-tight dark:text-white truncate">FinanzasPro</span>
           </div>
           
           {/* Collapse button (only desktop) */}
           <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden md:flex p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
           </button>

           {/* Close button (only mobile) */}
           <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400 hover:text-slate-600 dark:hover:text-white">
             <X size={24} />
           </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
           {menuItems.map(item => (
             <button
               key={item.id}
               onClick={() => handleNav(item.id)}
               title={isCollapsed ? item.label : ''}
               className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-bold text-sm
                 ${isCollapsed ? 'justify-center w-full' : 'w-full'}
                 ${view === item.id 
                   ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' 
                   : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                 }
               `}
             >
               <span className={`${view === item.id ? 'opacity-100' : 'opacity-70'} shrink-0`}>{item.icon}</span>
               {!isCollapsed && <span className="truncate">{item.label}</span>}
             </button>
           ))}
        </nav>
        
        {/* Settings button and Footer info */}
        <div className="p-3 border-t border-slate-200 dark:border-white/5 flex flex-col items-center">
            <button 
                onClick={() => { setIsSettingsOpen(true); if(window.innerWidth < 768) setIsOpen(false); }}
                title={isCollapsed ? 'Ajustes' : ''}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-bold text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 mb-2 w-full
                    ${isCollapsed ? 'justify-center' : ''}`}
            >
                <Settings size={20} className="shrink-0 opacity-70" />
                {!isCollapsed && <span>Ajustes</span>}
            </button>
            {!isCollapsed && <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest mt-4">FinanzasPro PWA v2.0</p>}
        </div>
      </aside>
    </>
  );
}
