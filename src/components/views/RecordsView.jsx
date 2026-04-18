import React, { useMemo, useState } from 'react';
import { CheckCircle2, AlertCircle, User, Clock, FileSpreadsheet, Lock, ChevronDown } from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDate(raw) {
  if (!raw) return null;
  if (typeof raw.toDate === 'function') return raw.toDate();
  if (typeof raw === 'string') return new Date(raw);
  if (raw._seconds) return new Date(raw._seconds * 1000);
  return null;
}

function normalizeDate(raw) {
  const d = toDate(raw);
  return d ? d.toLocaleDateString('en-CA') : null;
}

function normalizeTs(raw) {
  const d = toDate(raw);
  return d ? d.getTime() : 0;
}

function formatTime(raw) {
  const d = toDate(raw);
  if (!d) return '';
  try { return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }); }
  catch { return ''; }
}

function formatDate(dateStr) {
  if (!dateStr) return 'Sin fecha';
  const today = new Date().toLocaleDateString('en-CA');
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-CA');
  if (dateStr === today) return 'Hoy';
  if (dateStr === yesterday) return 'Ayer';
  try {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });
  } catch { return dateStr; }
}

function groupByDate(records) {
  const groups = {};
  records.forEach(r => {
    const dateKey = normalizeDate(r.completedAt) || normalizeDate(r.createdAt) || normalizeDate(r.dueDate) || 'sin-fecha';
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(r);
  });
  // Sort within each group by timestamp DESC (newest first)
  Object.values(groups).forEach(arr => arr.sort((a, b) => normalizeTs(b.completedAt || b.createdAt) - normalizeTs(a.completedAt || a.createdAt)));
  return groups;
}

// ─── Excel Export ─────────────────────────────────────────────────────────────

function exportToExcel(records, selectedMonth) {
  const [year, month] = selectedMonth.split('-').map(Number);
  const monthRecords = records.filter(r => {
    const d = toDate(r.completedAt) || toDate(r.createdAt) || toDate(r.dueDate);
    if (!d) return false;
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  });

  if (monthRecords.length === 0) {
    alert('No hay registros para el mes seleccionado.');
    return;
  }

  const BOM = '\uFEFF';
  const headers = 'Tipo,Concepto,Cliente/Proveedor,Monto,Fecha Vencimiento,Registro,Estado,Creado Por\n';
  const rows = monthRecords.map(r => {
    const type = r._type === 'receivable' ? 'Cobro' : (r.title?.startsWith('[Abono]') ? 'Abono' : 'Pago');
    const status = r._type === 'receivable' ? (r.isCollected ? 'Cobrado' : 'Pendiente') : (r.isPaid ? 'Pagado' : 'Pendiente');
    const dateD = toDate(r.completedAt) || toDate(r.createdAt) || toDate(r.dueDate);
    const dateStr = dateD ? dateD.toLocaleDateString('es-PE') : '';
    return [
      type,
      `"${(r.title || '').replace(/"/g, '""')}"`,
      `"${(r.client || r.createdBy || '').replace(/"/g, '""')}"`,
      Number(r.amount || 0).toFixed(2),
      r.dueDate || '',
      dateStr,
      status,
      `"${(r.createdBy || 'Sistema').replace(/"/g, '""')}"`
    ].join(',');
  }).join('\n');

  const blob = new Blob([BOM + headers + rows], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  const monthName = new Date(year, month - 1, 1).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
  link.download = `FinanzasPro_${monthName.replace(' ', '-')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ─── Timeline Entry ───────────────────────────────────────────────────────────

function TimelineEntry({ record }) {
  const isReceivable = record._type === 'receivable';
  const isAbono = record.title?.startsWith('[Abono]');
  const isAutomatic = record.createdBy?.includes('Sistema (Auto)');
  const cleanTitle = isAbono ? record.title.replace('[Abono] ', '') : record.title;
  const time = formatTime(record.completedAt || record.createdAt);

  const nodeColor = isAbono
    ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-500/60 text-amber-600'
    : isReceivable
    ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-500/60 text-emerald-600'
    : isAutomatic
    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-500/60 text-blue-600'
    : 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-500/60 text-green-600';

  const cardColor = isAbono
    ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-500/20'
    : isReceivable
    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-500/20'
    : isAutomatic
    ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-200 dark:border-blue-500/20'
    : 'bg-green-50/40 dark:bg-green-950/20 border-green-200 dark:border-green-500/20';

  const amountColor = isAbono
    ? 'text-amber-700 dark:text-amber-400'
    : isReceivable
    ? 'text-emerald-700 dark:text-emerald-400'
    : 'text-green-700 dark:text-green-400';

  const badge = isAbono ? { label: 'ABONO', color: 'bg-amber-200 dark:bg-amber-800/60 text-amber-800 dark:text-amber-300' }
    : isReceivable ? { label: 'COBRO', color: 'bg-emerald-200 dark:bg-emerald-800/60 text-emerald-800 dark:text-emerald-300' }
    : isAutomatic ? { label: 'AUTO', color: 'bg-blue-200 dark:bg-blue-800/60 text-blue-800 dark:text-blue-300' }
    : { label: 'PAGADO', color: 'bg-green-200 dark:bg-green-800/60 text-green-800 dark:text-green-300' };

  return (
    <div className="relative flex gap-4 group">
      <div className="flex flex-col items-center">
        <div className={`z-10 flex items-center justify-center w-9 h-9 rounded-full shrink-0 shadow-sm border-2 ${nodeColor}`}>
          {isAbono ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
        </div>
        <div className="w-0.5 flex-1 bg-slate-100 dark:bg-slate-800 mt-1" />
      </div>

      <div className="pb-5 flex-1 min-w-0">
        <div className={`p-3.5 rounded-xl border transition-all group-hover:shadow-sm ${cardColor}`}>
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0 ${badge.color}`}>{badge.label}</span>
              {record.priority === 'URGENTE' && <span className="text-[9px] font-black uppercase bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 px-1.5 py-0.5 rounded-full shrink-0">URGENTE</span>}
              {record.priority === 'PRIORITARIO' && <span className="text-[9px] font-black uppercase bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full shrink-0">PRIORITARIO</span>}
              {record.priority === 'NORMAL' && <span className="text-[9px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 px-1.5 py-0.5 rounded-full shrink-0 border border-slate-200 dark:border-slate-700">NORMAL</span>}
              <p className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{cleanTitle}</p>
            </div>
            <p className={`text-sm font-black shrink-0 ${amountColor}`}>
              {isReceivable ? '+' : '-'} S/ {Number(record.amount || 0).toLocaleString()}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
            {isReceivable && record.client && <span className="font-medium text-emerald-600 dark:text-emerald-400">{record.client}</span>}
            {time && <span className="flex items-center gap-1"><Clock size={10} /> {time}</span>}
            <span className="flex items-center gap-1"><User size={10} /> {record.createdBy || 'Sistema'}</span>
            {record.category && <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{record.category}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Error Boundary ───────────────────────────────────────────────────────────

class RecordsErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <AlertCircle size={32} className="text-red-400" />
        <button onClick={() => this.setState({ hasError: false })} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">Reintentar</button>
      </div>
    );
    return this.props.children;
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RecordsView({ payments, receivables = [], permissions }) {
  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const allRecords = useMemo(() => {
    const completedPayments = Array.isArray(payments) ? payments.filter(p => p.isPaid).map(p => ({ ...p, _type: 'payment' })) : [];
    const completedReceivables = Array.isArray(receivables) ? receivables.filter(r => r.isCollected).map(r => ({ ...r, _type: 'receivable' })) : [];
    // Sort: newest first (by completedAt or createdAt timestamp DESC)
    return [...completedPayments, ...completedReceivables].sort((a, b) => normalizeTs(b.completedAt || b.createdAt) - normalizeTs(a.completedAt || a.createdAt));
  }, [payments, receivables]);

  const grouped = useMemo(() => groupByDate(allRecords), [allRecords]);
  // Sort date keys newest first
  const dateKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  // Generate last 12 months for month selector
  const monthOptions = useMemo(() => {
    const opts = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const val = d.toISOString().slice(0, 7);
      const label = d.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
      opts.push({ val, label });
    }
    return opts;
  }, []);

  if (allRecords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Clock size={32} className="text-slate-300 dark:text-slate-600" />
        </div>
        <div>
          <p className="font-bold text-slate-500 dark:text-slate-400">Sin historial todavía</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Cuando registres pagos o cobros completados, aparecerán aquí en orden cronológico.
          </p>
        </div>
      </div>
    );
  }

  return (
    <RecordsErrorBoundary>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{allRecords.length} registros completados</p>
          <p className="text-xs text-slate-400 mt-0.5">Ordenados del más reciente al más antiguo</p>
        </div>

        {/* Export button — empresa plan only */}
        <div className="flex items-center gap-2">
          {permissions?.canExportExcel ? (
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer">
                  {monthOptions.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              <button onClick={() => exportToExcel(allRecords, selectedMonth)}
                className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
                <FileSpreadsheet size={14} /> Exportar Excel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-2 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-400 cursor-not-allowed"
              title="Disponible en Plan Empresa">
              <Lock size={11} /> <FileSpreadsheet size={13} /> Exportar Excel (Plan Empresa)
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {dateKeys.map(dateKey => (
          <div key={dateKey}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 capitalize whitespace-nowrap">{formatDate(dateKey)}</span>
              <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
              <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full whitespace-nowrap">
                {grouped[dateKey].length} {grouped[dateKey].length === 1 ? 'registro' : 'registros'}
              </span>
            </div>
            <div>
              {grouped[dateKey].map(r => <TimelineEntry key={r.id + r._type} record={r} />)}
            </div>
          </div>
        ))}
      </div>
    </RecordsErrorBoundary>
  );
}
