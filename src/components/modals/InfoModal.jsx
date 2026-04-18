import React from 'react';
import { Info, Plus, CalendarClock, User, Wallet, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function InfoModal({ infoTarget, setInfoTarget, isReceivable = false }) {
  if (!infoTarget) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.8)] border border-slate-200 dark:border-white/10 animate-slide-up">
        
        <div className="p-5 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-black/20 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Info size={18} className="text-blue-600 dark:text-blue-500" />
            Detalles del {isReceivable ? 'Cobro' : 'Pago'}
          </h3>
          <button onClick={() => setInfoTarget(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <Plus size={20} className="rotate-45" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          
          <div className="space-y-1">
            <p className="text-xl font-black text-slate-800 dark:text-slate-100 leading-tight">{infoTarget.title}</p>
            {isReceivable && infoTarget.client && (
               <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-500">{infoTarget.client}</p>
            )}
            {!isReceivable && infoTarget.category && (
               <p className="text-sm font-semibold text-blue-600 dark:text-blue-500">{infoTarget.category}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
             <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Monto Actual</p>
                <p className="text-lg font-black text-slate-800 dark:text-slate-200">S/ {Number(infoTarget.amount).toLocaleString()}</p>
             </div>
             {infoTarget.originalAmount > infoTarget.amount && (
               <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Original</p>
                  <p className="text-lg font-black text-slate-400 line-through">S/ {Number(infoTarget.originalAmount).toLocaleString()}</p>
               </div>
             )}
          </div>

          <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 text-sm">
             <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium"><CalendarClock size={14} /> Vencimiento</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{infoTarget.dueDate}</span>
             </div>
             <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium"><User size={14} /> Creado por</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{infoTarget.createdBy?.split('@')[0] || 'Sistema'}</span>
             </div>
             <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium"><AlertCircle size={14} /> Prioridad</span>
                <span className={`font-black text-[10px] tracking-wider px-2 py-0.5 rounded-md uppercase
                   ${infoTarget.priority === 'URGENTE' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' : 
                     infoTarget.priority === 'PRIORITARIO' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' : 
                     'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
                   {infoTarget.priority || 'NORMAL'}
                </span>
             </div>
          </div>

          {infoTarget.note && (
             <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800/30">
                <p className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 mb-1">
                   <FileText size={12} /> Nota
                </p>
                <p className="text-sm text-blue-900 dark:text-blue-100 italic">"{infoTarget.note}"</p>
             </div>
          )}

          <button type="button" onClick={() => setInfoTarget(null)}
            className="w-full py-3 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
