import React, { useState, useMemo } from 'react';
import { User, Paperclip, CheckCircle2, Trash2, AlertCircle, Edit3, ArrowUpDown, ArrowDownAZ, CalendarArrowUp, Lock, TrendingDown } from 'lucide-react';

const WEEKDAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS_ES   = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function parseDateParts(dueDateStr) {
  if (!dueDateStr) return null;
  // Parse as local date (avoid UTC-shift)
  const [y, m, d] = dueDateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return {
    weekday: WEEKDAYS_ES[dt.getDay()],
    day:     d,
    month:   MONTHS_ES[m - 1],
    year:    y,
    iso:     dueDateStr,
  };
}

export default function ListView({ payments, onCheck, onDelete, onAttach, onEdit, permissions, isReceivable = false }) {
  const [sortMode, setSortMode] = useState('date'); // 'date' | 'alpha'
  const [sortDir, setSortDir] = useState('asc'); // 'asc' | 'desc'
  const todayStr = new Date().toLocaleDateString('en-CA');

  const pending = useMemo(() => {
    return [...payments].filter(p => isReceivable ? !p.isCollected : !p.isPaid);
  }, [payments, isReceivable]);

  const sorted = useMemo(() => {
    return [...pending].sort((a, b) => {
      let cmp = 0;
      if (sortMode === 'alpha') {
        cmp = (a.title || '').localeCompare(b.title || '', 'es');
      } else {
        cmp = new Date(a.dueDate) - new Date(b.dueDate);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [pending, sortMode, sortDir]);

  const toggleSort = (mode) => {
    if (sortMode === mode) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortMode(mode); setSortDir('asc'); }
  };

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
          <CheckCircle2 size={32} className="text-green-400 dark:text-green-500" />
        </div>
        <div>
          <p className="font-bold text-green-600 dark:text-green-400">¡Todo al día!</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            No tienes {isReceivable ? 'cobros' : 'pagos'} pendientes. ¡Excelente gestión!
          </p>
        </div>
      </div>
    );
  }

  const accentColor = isReceivable ? 'emerald' : 'amber';

  return (
    <div className="space-y-3">
      {/* Sort Controls — only for empresa plan */}
      <div className="flex items-center justify-between gap-2 pb-1">
        <p className="text-xs text-slate-400 font-medium">{sorted.length} {isReceivable ? 'cobros' : 'pagos'} pendientes</p>
        <div className="flex items-center gap-1">
          {permissions?.canFilterList ? (
            <>
              <button onClick={() => toggleSort('alpha')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border
                  ${sortMode === 'alpha'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-300'}`}>
                <ArrowDownAZ size={13} />
                A–Z {sortMode === 'alpha' && (sortDir === 'asc' ? '↑' : '↓')}
              </button>
              <button onClick={() => toggleSort('date')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border
                  ${sortMode === 'date'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-300'}`}>
                <CalendarArrowUp size={13} />
                Fecha {sortMode === 'date' && (sortDir === 'asc' ? '↑' : '↓')}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 cursor-not-allowed"
              title="Filtros disponibles en Plan Empresa">
              <Lock size={11} /> <ArrowUpDown size={11} /> Filtros (Plan Empresa)
            </div>
          )}
        </div>
      </div>

      {/* List items */}
      {sorted.map(p => {
        const isOverdue = p.dueDate < todayStr;
        const isToday = p.dueDate === todayStr;

        const dateParts = parseDateParts(p.dueDate);
        const dateAccent = isOverdue
          ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400'
          : isToday
          ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-500/30 text-orange-600 dark:text-orange-400'
          : isReceivable
          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-500'
          : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-500';

        return (
          <div key={p.id}
            className={`relative flex flex-row items-stretch gap-0 rounded-xl border bg-white dark:bg-slate-900/60 transition-all hover:shadow-md overflow-hidden
              ${isOverdue ? 'border-red-200 dark:border-red-500/30' : isToday ? 'border-orange-200 dark:border-orange-500/30' : isReceivable ? 'border-emerald-100 dark:border-emerald-500/10' : 'border-slate-100 dark:border-white/5'}`}>

            {/* ── Fecha prominente lateral ── */}
            <div className={`shrink-0 w-16 flex flex-col items-center justify-center gap-0 border-r px-1 py-3 ${dateAccent}`}>
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">{dateParts?.weekday}</span>
              <span className="text-3xl font-black leading-none mt-0.5">{dateParts?.day}</span>
              <span className="text-[10px] font-bold uppercase tracking-wide leading-none mt-0.5">{dateParts?.month}</span>
              {dateParts?.year !== new Date().getFullYear() && (
                <span className="text-[8px] font-semibold mt-0.5 opacity-70">{dateParts?.year}</span>
              )}
            </div>

            {/* ── Contenido principal ── */}
            <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 min-w-0">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
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
                <p className="font-bold text-slate-800 dark:text-slate-100 leading-tight">{p.title}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <p className={`text-sm font-black ${
                    isOverdue ? 'text-red-600 dark:text-red-400'
                    : isToday ? 'text-orange-600 dark:text-orange-400'
                    : isReceivable ? 'text-emerald-600 dark:text-emerald-500'
                    : 'text-amber-600 dark:text-amber-500'}`}>
                    S/ {Number(p.amount).toLocaleString()}
                  </p>
                  {p.originalAmount > p.amount && (
                    <span className="text-[9px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded font-bold">
                      <TrendingDown size={9} className="inline mr-0.5" />
                      de S/ {Number(p.originalAmount).toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap text-[10px] text-slate-400 dark:text-slate-500">
                  {isReceivable && p.client && <span className="font-semibold text-emerald-600 dark:text-emerald-400">{p.client}</span>}
                  <span className="flex items-center gap-1"><User size={10} /> {p.createdBy || 'Sistema'}</span>
                  {p.category && <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{p.category}</span>}
                </div>
              </div>
            </div>

            {/* ── Botones de acción ── */}
            <div className="flex flex-col items-center justify-center gap-1 px-2 py-3 shrink-0">
              {/* Marcar pagado/cobrado — abre modal de abono */}
              {permissions?.canMarkPaid && (
                <button onClick={() => onCheck(p)}
                  className={`p-2 rounded-lg flex items-center gap-1.5 text-xs font-bold border transition-colors
                    ${isReceivable
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-800 border-emerald-200 dark:border-emerald-700'
                      : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-800 border-green-200 dark:border-green-700'}`}>
                  <CheckCircle2 size={15} /> {isReceivable ? 'Cobrar' : 'Pagar'}
                </button>
              )}
              <div className="flex items-center gap-1">
                {permissions?.canEdit && onEdit && (
                  <button onClick={() => onEdit(p)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    title="Editar">
                    <Edit3 size={14} />
                  </button>
                )}
                {p.voucherUrl && permissions?.canAttachVoucher && (
                  <button onClick={() => onAttach(p)}
                    className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    title="Ver Comprobante">
                    <Paperclip size={14} />
                  </button>
                )}
                {permissions?.canDelete && (
                  <button onClick={() => onDelete(p.id)}
                    className="p-1.5 rounded-lg text-slate-300 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
