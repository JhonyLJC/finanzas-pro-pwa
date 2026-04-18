import React, { useState } from 'react';
import { Plus, TrendingUp, AlertCircle, FileText } from 'lucide-react';

export default function ReceivableConfirmModal({
  receivableTarget, setReceivableTarget,
  receivableModalAmount, setReceivableModalAmount,
  handleConfirmReceivable
}) {
  const [loading, setLoading] = useState(false);
  
  if (!receivableTarget) return null;

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await handleConfirmReceivable(e);
    } finally {
      setLoading(false);
    }
  };

  const amount = Number(receivableModalAmount);
  const total = receivableTarget.amount;
  const remaining = total - amount;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.8)] border border-slate-200 dark:border-white/10 animate-slide-up">

        <div className="p-5 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-black/20 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-600" /> Registrar Cobro
          </h3>
          <button onClick={() => setReceivableTarget(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <Plus size={20} className="rotate-45" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <div className="bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase mb-1 tracking-wider">
              Cliente — Cobro Seleccionado
            </p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {receivableTarget.client || 'Sin cliente'} — {receivableTarget.title}
            </p>
            <div className="flex justify-between items-end mt-2">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Deuda pendiente:</span>
              <span className="font-black text-lg text-slate-800 dark:text-white">S/ {total.toLocaleString()}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Monto a cobrar ahora</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">S/</span>
              <input required type="number" step="0.01" min="0.01" max={total}
                className="w-full pl-9 p-3 text-xl font-black bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-emerald-700 dark:text-white transition-colors shadow-inner"
                value={receivableModalAmount} onChange={e => setReceivableModalAmount(e.target.value)} />
            </div>
            {amount > 0 && amount < total && (
              <div className="mt-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-2.5 rounded-lg flex gap-2">
                <AlertCircle size={14} className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 dark:text-amber-400 font-medium leading-tight">
                  Se registrará un abono. El saldo de <strong>{receivableTarget.client || 'este cliente'}</strong> bajará a <strong>S/ {remaining.toLocaleString()}</strong> y seguirá pendiente.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setReceivableTarget(null)}
              className="flex-1 py-3 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                amount >= total ? 'Cobro Completo' : 'Registrar Abono'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
