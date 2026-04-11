import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Trash2, Paperclip, Edit3, TrendingUp, Wallet } from 'lucide-react';

export default function CalendarView({
  payments, receivables = [],
  selectedDate, setSelectedDate,
  onCheckPayment, onDeletePayment, onEditPayment,
  onCheckReceivable, onDeleteReceivable, onEditReceivable,
  permissions
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth(currentMonth) }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth(currentMonth) }, (_, i) => i);
  const monthName = currentMonth.toLocaleString('es-PE', { month: 'long', year: 'numeric' });

  const getDayPayments = (day) => {
    const dStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toLocaleDateString('en-CA');
    return payments.filter(p => p.dueDate === dStr);
  };

  const getDayReceivables = (day) => {
    const dStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toLocaleDateString('en-CA');
    return receivables.filter(r => r.dueDate === dStr);
  };

  const changeMonth = (offset) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const selectedDateStr = selectedDate.toLocaleDateString('en-CA');
  const activePayments = payments.filter(p => p.dueDate === selectedDateStr);
  const activeReceivables = receivables.filter(r => r.dueDate === selectedDateStr);

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
      {/* Calendar Grid */}
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
          {emptyDays.map(d => <div key={`e-${d}`} className="aspect-square" />)}
          {days.map(d => {
            const dayPayments = getDayPayments(d);
            const dayReceivables = getDayReceivables(d);
            const hasPendingPayments = dayPayments.some(p => !p.isPaid);
            const hasPendingReceivables = dayReceivables.some(r => !r.isCollected);
            const allPaid = dayPayments.length > 0 && dayPayments.every(p => p.isPaid);
            const allCollected = dayReceivables.length > 0 && dayReceivables.every(r => r.isCollected);
            const dStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d).toLocaleDateString('en-CA');
            const isToday = dStr === new Date().toLocaleDateString('en-CA');
            const isSelected = dStr === selectedDateStr;
            return (
              <button key={d} onClick={() => setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d))}
                className={`aspect-square rounded-xl border flex flex-col items-center justify-center relative transition-all
                  ${isSelected ? 'bg-blue-600 border-blue-600 text-white shadow-[0_4px_15px_rgba(59,130,246,0.3)]' : 'bg-white dark:bg-slate-800/50 border-slate-100 dark:border-white/5 hover:border-blue-200 dark:hover:border-blue-500/50 dark:text-slate-300'}
                  ${isToday && !isSelected ? 'ring-2 ring-blue-100 dark:ring-blue-500/30 border-blue-200 dark:border-blue-500/50 font-bold' : ''}`}>
                <span className="text-sm">{d}</span>
                <div className="flex gap-0.5 mt-1">
                  {hasPendingPayments && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-amber-500'}`} />}
                  {hasPendingReceivables && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/70' : 'bg-emerald-500'}`} />}
                  {allPaid && !hasPendingPayments && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/60' : 'bg-slate-300 dark:bg-slate-600'}`} />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 px-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500"><div className="w-2 h-2 rounded-full bg-amber-500" />Pago pendiente</div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500"><div className="w-2 h-2 rounded-full bg-emerald-500" />Cobro pendiente</div>
        </div>
      </div>

      {/* Day Detail Panel */}
      <div className="md:col-span-3 lg:col-span-2">
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm mb-3">
            {selectedDate.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', weekday: 'short' })}
          </h4>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">

            {activePayments.length === 0 && activeReceivables.length === 0 && (
              <p className="text-xs text-slate-400 italic text-center py-4">Sin movimientos para este día.</p>
            )}

            {/* PAGOS */}
            {activePayments.map(p => (
              <div key={p.id} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-1.5">
                    <Wallet size={11} className="text-amber-500 shrink-0" />
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${p.isPaid ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>
                      {p.isPaid ? 'PAGADO' : 'PENDIENTE'}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {permissions?.canEdit && (
                      <button onClick={() => onEditPayment(p)} className="text-slate-400 hover:text-blue-500 transition-colors" title="Editar">
                        <Edit3 size={13} />
                      </button>
                    )}
                    {permissions?.canDelete && (
                      <button onClick={() => onDeletePayment(p.id)} className="text-slate-300 dark:text-slate-500 hover:text-red-500 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="font-bold text-slate-800 dark:text-slate-100 text-xs">{p.title}</p>
                <p className="text-amber-600 dark:text-amber-500 font-bold text-sm mt-1">S/ {Number(p.amount).toLocaleString()}</p>
                {permissions?.canMarkPaid && (
                  <button onClick={() => onCheckPayment(p)}
                    className={`mt-2 w-full py-1.5 text-xs font-bold rounded-lg border transition-colors flex items-center justify-center gap-1
                      ${p.isPaid ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400' : 'bg-green-600 border-green-600 text-white'}`}>
                    {p.isPaid ? 'Desmarcar' : <><CheckCircle2 size={13} /> Marcar Pagado</>}
                  </button>
                )}
              </div>
            ))}

            {/* COBROS */}
            {activeReceivables.map(r => (
              <div key={r.id} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-emerald-200 dark:border-emerald-700/30 shadow-sm">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={11} className="text-emerald-500 shrink-0" />
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${r.isCollected ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'}`}>
                      {r.isCollected ? 'COBRADO' : 'PENDIENTE'}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {permissions?.canEdit && (
                      <button onClick={() => onEditReceivable(r)} className="text-slate-400 hover:text-blue-500 transition-colors" title="Editar">
                        <Edit3 size={13} />
                      </button>
                    )}
                    {permissions?.canDelete && (
                      <button onClick={() => onDeleteReceivable(r.id)} className="text-slate-300 dark:text-slate-500 hover:text-red-500 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="font-bold text-slate-800 dark:text-slate-100 text-xs">{r.title}</p>
                {r.client && <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">{r.client}</p>}
                <p className="text-emerald-600 dark:text-emerald-500 font-bold text-sm mt-1">S/ {Number(r.amount).toLocaleString()}</p>
                {permissions?.canMarkCollected && (
                  <button onClick={() => onCheckReceivable(r)}
                    className={`mt-2 w-full py-1.5 text-xs font-bold rounded-lg border transition-colors flex items-center justify-center gap-1
                      ${r.isCollected ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400' : 'bg-emerald-600 border-emerald-600 text-white'}`}>
                    {r.isCollected ? 'Desmarcar' : <><CheckCircle2 size={13} /> Registrar Cobro</>}
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
