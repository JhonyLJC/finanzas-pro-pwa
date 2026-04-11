import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function Collapsible({ title, icon, defaultOpen = true, children, onToggle }) {
  const [isOpen, setIsOpen] = useState(() => {
    const saved = localStorage.getItem(`collapsible-${title}`);
    return saved !== null ? JSON.parse(saved) : defaultOpen;
  });

  useEffect(() => {
    localStorage.setItem(`collapsible-${title}`, JSON.stringify(isOpen));
    if (onToggle) onToggle(isOpen);
  }, [isOpen, title, onToggle]);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <div className="bg-white dark:bg-slate-900/60 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden transition-colors backdrop-blur-md mb-6">
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-center justify-between p-4 bg-slate-50/50 dark:bg-black/20 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
      >
        <div className="flex items-center gap-3">
          {icon && <div className="text-slate-500 dark:text-slate-400">{icon}</div>}
          <h3 className="font-bold text-slate-700 dark:text-slate-200">{title}</h3>
        </div>
        <ChevronDown
          size={20}
          className={`text-slate-400 dark:text-slate-500 transition-transform duration-300 ${isOpen ? '-rotate-180' : 'rotate-0'}`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-4 border-t border-slate-100 dark:border-white/5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
