import React, { useState, useEffect } from 'react';
import { Edit3, Plus, CalendarDays, DollarSign, Save } from 'lucide-react';

export default function EditModal({ record, onSave, onClose, isReceivable = false }) {
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [title, setTitle] = useState('');
  const [client, setClient] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (record) {
      setAmount(record.amount?.toString() || '');
      setDueDate(record.dueDate || '');
      setTitle(record.title || '');
      setClient(record.client || '');
    }
  }, [record]);

  if (!record) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !dueDate) return;
    setIsSaving(true);
    await onSave(record.id, {
      amount: Number(amount),
      dueDate,
      title: title || record.title,
      ...(isReceivable ? { client: client || record.client } : {}),
    });
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4 transition-all">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-t-3xl md:rounded-2xl overflow-hidden shadow-2xl dark:shadow-[0_10px_40px_rgba(0,0,0,0.8)] border border-slate-200 dark:border-white/10 animate-slide-up">
        
        <div className="p-5 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-black/20">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Edit3 size={18} className="text-blue-500" />
            Editar {isReceivable ? 'Cobro' : 'Pago'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <Plus size={20} className="rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Info del concepto */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-white/5 text-xs text-slate-500 dark:text-slate-400">
            Editando: <span className="font-bold text-slate-700 dark:text-slate-200">{record.title}</span>
          </div>

          {/* Concepto */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Concepto</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-colors"
              placeholder={record.title}
            />
          </div>

          {/* Cliente (solo cobros) */}
          {isReceivable && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Cliente</label>
              <input
                type="text"
                value={client}
                onChange={e => setClient(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-colors"
              />
            </div>
          )}

          {/* Monto */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Monto (S/)</label>
            <div className="relative">
              <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full pl-9 p-3 text-lg font-black bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-colors"
              />
            </div>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Fecha de Vencimiento</label>
            <div className="relative">
              <CalendarDays size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full pl-9 p-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white [color-scheme:light] dark:[color-scheme:dark] transition-colors"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isSaving}
              className="flex-1 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-blue-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              <Save size={16} />
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
