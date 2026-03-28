import React from 'react';
import { User, Paperclip, CheckCircle2, Trash2, AlertCircle } from 'lucide-react';

export default function ListView({ payments, onCheck, onDelete, onAttach, permissions }) {
  const pendingPayments = [...payments]
    .filter(p => !p.isPaid)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const todayStr = new Date().toISOString().split('T')[0];

  if (pendingPayments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
          <CheckCircle2 size={32} className="text-green-400 dark:text-green-500" />
        </div>
        <div>
          <p className="font-bold text-green-600 dark:text-green-400">¡Todo al día!</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">No tienes pagos pendientes. ¡Excelente gestión!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {pendingPayments.map(p => {
        const isOverdue = p.dueDate < todayStr;
        const isToday = p.dueDate === todayStr;

        return (
          <div key={p.id}
            className={`relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border bg-white dark:bg-slate-900/60 transition-all hover:shadow-sm
              ${isOverdue ? 'border-red-200 dark:border-red-500/30' : isToday ? 'border-orange-200 dark:border-orange-500/30' : 'border-slate-100 dark:border-white/5'}`}>

            <div className={`absolute left-0 top-0 w-1 h-full rounded-l-xl
              ${isOverdue ? 'bg-red-500' : isToday ? 'bg-orange-400' : 'bg-slate-200 dark:bg-slate-700'}`} />

            <div className="pl-3 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {isOverdue && (
                  <span className="text-[9px] font-black uppercase bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                    <AlertCircle size={9} /> ATRASADO
                  </span>
                )}
                {isToday && <span className="text-[9px] font-black uppercase bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 px-1.5 py-0.5 rounded-full">HOY</span>}
                {p.recurrenceMode && p.recurrenceMode !== 'none' && (
                  <span className="text-[9px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full">AUTO</span>
                )}
              </div>
              <p className="font-bold text-slate-800 dark:text-slate-100 leading-tight mt-1">{p.title}</p>
              <div className="flex items-center gap-3 mt-1">
                <p className={`text-sm font-black ${isOverdue ? 'text-red-600 dark:text-red-400' : isToday ? 'text-orange-600 dark:text-orange-400' : 'text-amber-600 dark:text-amber-500'}`}>
                  S/ {Number(p.amount).toLocaleString()}
                </p>
                {p.originalAmount > p.amount && (
                  <span className="text-[9px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded font-bold">
                    De S/ {p.originalAmount.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                <span className="flex items-center gap-1"><User size={10} /> {p.createdBy || 'Sistema'}</span>
                <span className={`font-medium ${isOverdue ? 'text-red-500 font-bold' : ''}`}>Vence: {p.dueDate}</span>
                {p.category && <span>{p.category}</span>}
              </div>
            </div>

            <div className="pl-3 sm:pl-0 flex items-center gap-1.5 shrink-0">
              {/* Marcar pagado: admin y empleado */}
              {permissions?.canMarkPaid && (
                <button onClick={() => onCheck(p)}
                  className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-800 transition-colors border border-green-200 dark:border-green-700 flex items-center gap-1.5 text-xs font-bold"
                >
                  <CheckCircle2 size={16} /> Pagar
                </button>
              )}
              {/* Comprobante adjunto: solo admin */}
              {p.voucherUrl && permissions?.canAttachVoucher && (
                <button onClick={() => onAttach(p)}
                  className="p-2 rounded-lg text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 transition-colors border border-blue-200 dark:border-blue-700"
                  title="Ver Comprobante">
                  <Paperclip size={16} />
                </button>
              )}
              {/* Eliminar: solo admin */}
              {permissions?.canDelete && (
                <button onClick={() => onDelete(p.id)}
                  className="p-2 rounded-lg text-slate-300 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
