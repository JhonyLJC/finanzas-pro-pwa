import React from 'react';
import { AlertCircle, CalendarClock, User, CheckCircle2 } from 'lucide-react';

export default function PrioritySection({ type = 'payment', items = [], permissions, onAction }) {
  const isPayment = type === 'payment';
  
  if (!items || items.length === 0) {
    return (
      <div className={`p-6 text-center border-2 border-dashed rounded-xl ${isPayment ? 'border-amber-100 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-900/10' : 'border-emerald-100 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-900/10'}`}>
        <p className={`text-sm font-bold ${isPayment ? 'text-amber-600/70 dark:text-amber-500/50' : 'text-emerald-600/70 dark:text-emerald-500/50'}`}>
           No tienes {isPayment ? 'pagos' : 'cobros'} urgentes.
        </p>
      </div>
    );
  }

  const todayStr = new Date().toLocaleDateString('en-CA');
  
  const formatPeruvianDate = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  // Orden personalizado: vencidos primero (más antiguo a más reciente), luego los de hoy
  const sortedItems = [...items].sort((a, b) => {
    if (a.dueDate < todayStr && b.dueDate >= todayStr) return -1;
    if (a.dueDate >= todayStr && b.dueDate < todayStr) return 1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  return (
    <div className="space-y-3">
      {sortedItems.map(item => {
        const isOverdue = item.dueDate < todayStr;
        const mainLabel = isPayment ? item.category || 'Varios' : item.client || 'General';

        return (
          <div key={item.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border bg-white dark:bg-slate-900/60 transition-all shadow-sm
              ${isOverdue ? 'border-red-200 dark:border-red-500/30' : 'border-orange-200 dark:border-orange-500/30'}`}>
            
             <div className="min-w-0 flex-1 w-full sm:w-auto">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                   {isOverdue ? (
                      <span className="text-[10px] font-black tracking-wider uppercase bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                        <AlertCircle size={10} /> VENCIDO
                      </span>
                   ) : (
                      <span className="text-[10px] font-black tracking-wider uppercase bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                        HOY
                      </span>
                   )}
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">{mainLabel}</span>
                </div>
                
                <h4 className="font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{item.title}</h4>
                
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 whitespace-nowrap"><CalendarClock size={11} /> {formatPeruvianDate(item.dueDate)}</span>
                    {item.createdBy && <span className="flex items-center gap-1 truncate"><User size={11} /> {item.createdBy.split('@')[0]}</span>}
                </div>
             </div>

             <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-slate-100 dark:border-slate-800 sm:border-0 shrink-0">
                <p className={`font-black text-base ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-500'}`}>
                   S/ {Number(item.amount).toLocaleString()}
                </p>
                {permissions?.canMarkPaid && (
                   <button onClick={() => onAction && onAction(item)}
                     className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm border
                        ${isPayment 
                          ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-400 dark:hover:bg-amber-900/40' 
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-700/50 dark:text-emerald-400 dark:hover:bg-emerald-900/40'}`}
                   >
                     <CheckCircle2 size={14} /> {isPayment ? 'Pagar' : 'Marcar Cobrado'}
                   </button>
                )}
             </div>
          </div>
        );
      })}
    </div>
  );
}
