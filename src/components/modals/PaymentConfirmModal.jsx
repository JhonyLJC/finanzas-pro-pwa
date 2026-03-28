import React from 'react';
import { Plus, CheckCircle2, AlertCircle } from 'lucide-react';

export default function PaymentConfirmModal({ paymentModalTarget, setPaymentModalTarget, paymentModalAmount, setPaymentModalAmount, handleConfirmPayment }) {
  if (!paymentModalTarget) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all">
        <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.8)] border border-slate-200 dark:border-white/10 animate-slide-up">
            <div className="p-5 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-black/20 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-blue-600 dark:text-blue-500" /> Confirmar Pago
                </h3>
                <button onClick={() => setPaymentModalTarget(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                    <Plus size={20} className="rotate-45" />
                </button>
            </div>
            
            <form onSubmit={handleConfirmPayment} className="p-5 space-y-4">
                <div className="bg-blue-50 dark:bg-blue-500/10 p-3 rounded-xl border border-blue-100 dark:border-blue-500/20">
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase mb-1 tracking-wider">Concepto Seleccionado</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{paymentModalTarget.title}</p>
                    <div className="flex justify-between items-end mt-2">
                        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Deuda Original:</span>
                        <span className="font-black text-lg text-slate-800 dark:text-white">S/ {paymentModalTarget.amount.toLocaleString()}</span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Monto a abonar hoy</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">S/</span>
                        <input required type="number" step="0.01" min="0.01" max={paymentModalTarget.amount}
                            className="w-full pl-9 p-3 text-xl font-black bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-blue-700 dark:text-white transition-colors shadow-inner"
                            value={paymentModalAmount} onChange={e => setPaymentModalAmount(e.target.value)}
                        />
                    </div>
                    {Number(paymentModalAmount) > 0 && Number(paymentModalAmount) < paymentModalTarget.amount && (
                        <div className="mt-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-2.5 rounded-lg flex gap-2">
                            <AlertCircle size={14} className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-800 dark:text-amber-400 font-medium leading-tight">
                                Se registrará un abono. El saldo de esta cuenta bajará a <strong className="font-black break-words">S/ {(paymentModalTarget.amount - Number(paymentModalAmount)).toLocaleString()}</strong> y seguirá pendiente.
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setPaymentModalTarget(null)}
                        className="flex-1 py-3 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        Cancelar
                    </button>
                    <button type="submit"
                        className="flex-1 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all">
                        {Number(paymentModalAmount) >= paymentModalTarget.amount ? 'Pago Completo' : 'Registrar Abono'}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
}
