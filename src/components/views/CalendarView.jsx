import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Trash2, Paperclip } from 'lucide-react';

export default function CalendarView({ payments, selectedDate, setSelectedDate, onCheck, onDelete, onAttach, permissions }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth(currentMonth) }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth(currentMonth) }, (_, i) => i);
  const monthName = currentMonth.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

  const getDayPayments = (day) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dStr = d.toISOString().split('T')[0];
    return payments.filter(p => p.dueDate === dStr);
  };

  const changeMonth = (offset) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const activePayments = payments.filter(p => p.dueDate === selectedDateStr);

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
        <div className="md:col-span-4 lg:col-span-5">
            <div className="flex items-center justify-between mb-4 px-2">
                <h4 className="capitalize font-bold text-slate-800 dark:text-slate-100">{monthName}</h4>
                <div className="flex gap-1">
                    <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 transition-colors">
                        <ChevronLeft size={18} />
                    </button>
                    <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 transition-colors">
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
                <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase py-2">{d}</div>
                ))}
                {emptyDays.map(d => <div key={`e-${d}`} className="aspect-square"></div>)}
                {days.map(d => {
                const dayPayments = getDayPayments(d);
                const hasPending = dayPayments.some(p => !p.isPaid);
                const allPaid = dayPayments.length > 0 && dayPayments.every(p => p.isPaid);
                const isToday = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d).toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
                const isSelected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d).toISOString().split('T')[0] === selectedDateStr;
                return (
                    <button key={d} onClick={() => setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d))}
                        className={`aspect-square rounded-xl border flex flex-col items-center justify-center relative transition-all
                        ${isSelected ? 'bg-blue-600 border-blue-600 text-white shadow-[0_4px_15px_rgba(59,130,246,0.3)] dark:shadow-[0_0_20px_rgba(59,130,246,0.4)]' : 'bg-white dark:bg-slate-800/50 border-slate-100 dark:border-white/5 hover:border-blue-200 dark:hover:border-blue-500/50 dark:text-slate-300'}
                        ${isToday && !isSelected ? 'ring-2 ring-blue-100 dark:ring-blue-500/30 border-blue-200 dark:border-blue-500/50 font-bold' : ''}
                        `}>
                        <span className="text-sm">{d}</span>
                        <div className="flex gap-0.5 mt-1">
                            {hasPending && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-amber-500 dark:bg-amber-400'}`}></div>}
                            {allPaid && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/60' : 'bg-green-500 dark:bg-green-400'}`}></div>}
                        </div>
                    </button>
                );
                })}
            </div>
        </div>

        <div className="md:col-span-3 lg:col-span-2">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm mb-3">
                    Pagos del {selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                </h4>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {activePayments.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-4">Sin pagos para este día.</p>
                    ) : (
                    activePayments.map(p => (
                    <div key={p.id} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${p.isPaid ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>
                                {p.isPaid ? 'REALIZADO' : 'PENDIENTE'}
                            </span>
                            {/* Eliminar: solo admin */}
                            {permissions?.canDelete && (
                            <button onClick={() => onDelete(p.id)} className="text-slate-300 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                                <Trash2 size={14} />
                            </button>
                            )}
                        </div>
                        <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{p.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-amber-600 dark:text-amber-500 font-bold text-sm">S/ {p.amount.toLocaleString()}</p>
                            {p.originalAmount > p.amount && (
                                <span className="text-[9px] bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded font-bold">
                                    De S/ {p.originalAmount.toLocaleString()}
                                </span>
                            )}
                        </div>
                        <div className="mt-3 flex gap-2">
                            {/* Marcar pagado: admin y empleado */}
                            {permissions?.canMarkPaid && (
                            <button onClick={() => onCheck(p)}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-colors flex items-center justify-center gap-1
                                ${p.isPaid ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400' : 'bg-green-600 border-green-600 text-white'}`}>
                                {p.isPaid ? 'Desmarcar' : <><CheckCircle2 size={14} /> Marcar Pagado</>}
                            </button>
                            )}
                            {/* Comprobante: solo admin */}
                            {p.isPaid && permissions?.canAttachVoucher && (
                            <button onClick={() => onAttach(p)}
                                className="px-3 py-1.5 text-xs font-bold rounded-lg border bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 transition-colors flex items-center justify-center"
                                title="Adjuntar Comprobante">
                                <Paperclip size={14} />
                            </button>
                            )}
                        </div>
                        {p.voucherUrl && (
                            <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1 bg-slate-50 dark:bg-slate-900/80 p-1.5 rounded border border-slate-100 dark:border-white/5">
                                <Paperclip size={10} /> Recibo: {p.voucherUrl.substring(0,25)}
                            </div>
                        )}
                    </div>
                    ))
                    )}
                </div>
            </div>
        </div>
    </div>
  );
}
