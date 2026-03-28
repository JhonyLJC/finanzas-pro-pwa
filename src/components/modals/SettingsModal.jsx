import React, { useState } from 'react';
import { Plus, Settings, Trash2 } from 'lucide-react';

export default function SettingsModal({ isSettingsOpen, setIsSettingsOpen, categories, setCategories }) {
  const [newCategory, setNewCategory] = useState('');

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all">
        <div className="bg-white dark:bg-slate-900/80 w-full max-w-md rounded-2xl overflow-hidden animate-slide-up border border-slate-200 dark:border-white/10 shadow-2xl dark:shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-white/50 dark:bg-black/20">
                <h3 className="text-xl font-bold dark:text-white flex items-center gap-2"><Settings size={20} /> Ajustes & Categorías</h3>
                <button onClick={()=> setIsSettingsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors">
                    <Plus size={24} className="rotate-45" />
                </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4">
                <div className="flex gap-2">
                    <input type="text" placeholder="Nueva Categoría"
                        className="flex-1 p-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-colors dark:placeholder-slate-500 shadow-inner"
                        value={newCategory} onChange={e => setNewCategory(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && newCategory.trim()) {
                                e.preventDefault();
                                setCategories(prev => [...prev.filter(c => c !== newCategory.trim()), newCategory.trim()]);
                                setNewCategory('');
                            }
                        }}
                    />
                    <button type="button" onClick={() => {
                        if (newCategory.trim()) {
                            setCategories(prev => [...prev.filter(c => c !== newCategory.trim()), newCategory.trim()]);
                            setNewCategory('');
                        }
                    }} className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                        <Plus size={20} />
                    </button>
                </div>

                <div className="mt-4 space-y-2">
                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Tus Categorías</label>
                    {categories.map(c => (
                        <div key={c} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-white/5">
                            <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">{c}</span>
                            {c !== 'Varios' && (
                            <button type="button" onClick={() => setCategories(prev => prev.filter(cat => cat !== c))}
                                className="text-red-400 hover:text-red-600 transition-colors bg-red-50 dark:bg-red-500/10 p-1.5 rounded-lg">
                                <Trash2 size={16} />
                            </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
}
