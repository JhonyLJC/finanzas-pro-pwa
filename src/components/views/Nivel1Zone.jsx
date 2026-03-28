import React from 'react';
import { AlertCircle, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';

export default function Nivel1Zone({ overduePayments, todayOnlyPayments, handleOpenPaymentModal }) {
  if (overduePayments.length === 0 && todayOnlyPayments.length === 0) {
    return (
      <section className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-r-xl shadow-sm dark:shadow-[0_0_20px_rgba(34,197,94,0.15)] backdrop-blur-md">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle2 size={18} className="dark:drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
              <h2 className="font-bold dark:drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]">Prioridad Inmediata: ¡Al día! No tienes pagos pendientes para hoy ni atrasados.</h2>
          </div>
      </section>
    );
  }

  return (
    <section className="bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 dark:border-red-500 p-4 rounded-r-xl shadow-sm dark:shadow-[0_0_20px_rgba(220,38,38,0.15)] animate-pulse-slow backdrop-blur-md">
        <div className="flex items-center gap-2 mb-3 text-red-700 dark:text-red-400">
            <AlertCircle size={18} className="dark:drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]" />
            <h2 className="font-bold dark:drop-shadow-[0_0_10px_rgba(248,113,113,0.5)]">Prioridad Inmediata</h2>
        </div>
        
        <div className="flex flex-col gap-4">
            {overduePayments.length > 0 && (
            <div className="space-y-2">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-500 flex items-center gap-1 opacity-80">
                    <AlertCircle size={12} /> Pagos Atrasados
                </h3>
                <div className="grid gap-2">
                    {overduePayments.map(p => (
                    <div key={p.id}
                        className="bg-white dark:bg-slate-900/60 p-3 rounded-lg shadow-sm flex flex-col sm:flex-row gap-3 sm:gap-0 justify-between items-start sm:items-center border border-red-300 dark:border-red-500/40 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                        <div className="pl-3">
                            <p className="font-bold text-slate-800 dark:text-slate-100 leading-tight">{p.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm text-red-600 dark:text-red-400 font-black drop-shadow-sm">
                                    S/ {p.amount.toLocaleString()}
                                </p>
                                {p.originalAmount > p.amount && (
                                    <span className="text-[9px] font-bold bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 px-1.5 py-0.5 rounded-full inline-block">De S/ {p.originalAmount.toLocaleString()}</span>
                                )}
                                <span className="text-[9px] font-bold bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 px-1.5 py-0.5 rounded-full inline-block">Venció: {p.dueDate}</span>
                            </div>
                        </div>
                        <button onClick={()=> handleOpenPaymentModal(p)}
                            className="w-full sm:w-auto bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border border-transparent dark:border-red-500/30 py-2 px-6 rounded-lg font-bold hover:bg-red-200 dark:hover:bg-red-500/50 transition-all dark:hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] flex items-center justify-center gap-2"
                            >
                            <CheckCircle2 size={16} /> Pagar
                        </button>
                    </div>
                    ))}
                </div>
            </div>
            )}

            {todayOnlyPayments.length > 0 && (
            <div className="space-y-2">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-500 flex items-center gap-1 border-t border-red-200/50 dark:border-red-500/20 pt-3 opacity-80">
                    <CalendarIcon size={12} /> Vencen Hoy
                </h3>
                <div className="grid gap-2">
                    {todayOnlyPayments.map(p => (
                    <div key={p.id}
                        className="bg-white dark:bg-slate-900/60 p-3 rounded-lg shadow-sm flex flex-col sm:flex-row gap-3 sm:gap-0 justify-between items-start sm:items-center border border-orange-200 dark:border-orange-500/30">
                        <div>
                            <p className="font-bold text-slate-800 dark:text-slate-100">{p.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm text-orange-600 dark:text-orange-400 font-bold drop-shadow-sm">
                                    S/ {p.amount.toLocaleString()}
                                </p>
                                {p.originalAmount > p.amount && (
                                    <span className="text-[9px] font-bold bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300 px-1.5 py-0.5 rounded-full inline-block">De S/ {p.originalAmount.toLocaleString()}</span>
                                )}
                            </div>
                        </div>
                        <button onClick={()=> handleOpenPaymentModal(p)}
                            className="w-full sm:w-auto bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-transparent dark:border-orange-500/20 py-2 px-6 rounded-lg font-bold hover:bg-orange-200 dark:hover:bg-orange-500/30 transition-all dark:hover:shadow-[0_0_15px_rgba(249,115,22,0.3)] flex items-center justify-center gap-2"
                            >
                            <CheckCircle2 size={16} /> Pagar
                        </button>
                    </div>
                    ))}
                </div>
            </div>
            )}
        </div>
    </section>
  );
}
