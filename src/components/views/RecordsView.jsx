import React, { useMemo } from 'react';
import { CheckCircle2, AlertCircle, Paperclip, User, Clock } from 'lucide-react';

function groupByDate(payments) {
  const groups = {};
  [...payments]
    .sort((a, b) => new Date(b.createdAt || b.dueDate) - new Date(a.createdAt || a.dueDate))
    .forEach(p => {
      const rawDate = p.createdAt || p.dueDate;
      const dateKey = rawDate?.split('T')[0] || p.dueDate;
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(p);
    });
  return groups;
}

function formatDate(dateStr) {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (dateStr === today) return 'Hoy';
  if (dateStr === yesterday) return 'Ayer';
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
}

function formatTime(isoString) {
  if (!isoString || !isoString.includes('T')) return '';
  return new Date(isoString).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function TimelineEntry({ payment }) {
  const isAbono = payment.title?.startsWith('[Abono]');
  const isAutomatic = payment.createdBy?.includes('Sistema (Auto)');
  const cleanTitle = isAbono ? payment.title.replace('[Abono] ', '') : payment.title;
  const time = formatTime(payment.createdAt);

  return (
    <div className="relative flex gap-4 group">
      {/* Línea vertical */}
      <div className="flex flex-col items-center">
        <div className={`z-10 flex items-center justify-center w-9 h-9 rounded-full shrink-0 shadow-sm border-2
          ${isAbono
            ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-500/60 text-amber-600 dark:text-amber-400'
            : isAutomatic
            ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-500/60 text-blue-600 dark:text-blue-400'
            : 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-500/60 text-green-600 dark:text-green-400'
          }`}>
          {isAbono ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
        </div>
        <div className="w-0.5 flex-1 bg-slate-100 dark:bg-slate-800 mt-1"></div>
      </div>

      {/* Contenido */}
      <div className="pb-6 flex-1 min-w-0">
        <div className={`p-3.5 rounded-xl border transition-all group-hover:shadow-sm
          ${isAbono
            ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-500/20'
            : isAutomatic
            ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-200 dark:border-blue-500/20'
            : 'bg-green-50/40 dark:bg-green-950/20 border-green-200 dark:border-green-500/20'
          }`}>
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              {isAbono && (
                <span className="text-[9px] font-black uppercase tracking-wider bg-amber-200 dark:bg-amber-800/60 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded-full">
                  ABONO
                </span>
              )}
              {isAutomatic && (
                <span className="text-[9px] font-black uppercase tracking-wider bg-blue-200 dark:bg-blue-800/60 text-blue-800 dark:text-blue-300 px-1.5 py-0.5 rounded-full">
                  AUTO
                </span>
              )}
              {!isAbono && !isAutomatic && (
                <span className="text-[9px] font-black uppercase tracking-wider bg-green-200 dark:bg-green-800/60 text-green-800 dark:text-green-300 px-1.5 py-0.5 rounded-full">
                  PAGADO
                </span>
              )}
              <p className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">
                {cleanTitle}
              </p>
            </div>
            <p className={`text-sm font-black shrink-0
              ${isAbono ? 'text-amber-700 dark:text-amber-400' : 'text-green-700 dark:text-green-400'}`}>
              S/ {Number(payment.amount).toLocaleString()}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
            {time && (
              <span className="flex items-center gap-1">
                <Clock size={10} /> {time}
              </span>
            )}
            <span className="flex items-center gap-1">
              <User size={10} /> {payment.createdBy || 'Sistema'}
            </span>
            {payment.category && (
              <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400">
                {payment.category}
              </span>
            )}
            {payment.voucherUrl && (
              <span className="flex items-center gap-1 text-blue-500">
                <Paperclip size={10} /> {payment.voucherUrl.substring(0, 20)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecordsView({ payments }) {
  const completedPayments = useMemo(() => {
    return payments.filter(p => p.isPaid);
  }, [payments]);

  const grouped = useMemo(() => groupByDate(completedPayments), [completedPayments]);
  const dateKeys = Object.keys(grouped);

  if (completedPayments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Clock size={32} className="text-slate-300 dark:text-slate-600" />
        </div>
        <div>
          <p className="font-bold text-slate-500 dark:text-slate-400">Sin historial todavía</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Cuando registres pagos o abonos, aparecerán aquí en orden cronológico.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {dateKeys.map(dateKey => (
        <div key={dateKey}>
          {/* Encabezado de fecha */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 capitalize">
              {formatDate(dateKey)}
            </span>
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
            <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">
              {grouped[dateKey].length} {grouped[dateKey].length === 1 ? 'registro' : 'registros'}
            </span>
          </div>

          {/* Entradas de la línea de tiempo */}
          <div>
            {grouped[dateKey].map(p => (
              <TimelineEntry key={p.id} payment={p} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
