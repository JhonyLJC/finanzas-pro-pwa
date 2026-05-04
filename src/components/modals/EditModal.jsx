import React, { useState, useEffect } from 'react';
import { Edit3, Plus, CalendarDays, DollarSign, Save } from 'lucide-react';

export default function EditModal({ record, onSave, onClose, isReceivable = false, categories = [] }) {
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (record) {
      setAmount(record.amount?.toString() || '');
      setDueDate(record.dueDate || '');
      setTitle(record.title || '');
      setCategory(record.category || (isReceivable ? 'Otros' : 'Varios'));
      setPriority(record.priority || 'NORMAL');
      setNote(record.note || '');
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
      priority,
      note,
      category,
    });
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4 transition-all overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm md:max-w-md rounded-t-3xl md:rounded-2xl overflow-hidden shadow-2xl dark:shadow-[0_10px_40px_rgba(0,0,0,0.8)] border border-slate-200 dark:border-white/10 animate-slide-up mt-10 md:mt-0 mb-auto md:mb-0">
        
        <div className="p-5 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-black/20 sticky top-0 z-10">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Edit3 size={18} className="text-blue-500" />
            Editar {isReceivable ? 'Cobro' : 'Pago'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <Plus size={20} className="rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
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

          <div className="grid grid-cols-2 gap-3">
            {/* Categoría */}
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Categoría</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-colors"
              >
                <option value={isReceivable ? 'Otros' : 'Varios'}>{isReceivable ? 'Otros' : 'Varios'}</option>
                {categories.filter(c => c !== 'Varios' && c !== 'Otros').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
                {category && category !== 'Varios' && category !== 'Otros' && !categories.includes(category) && (
                  <option value={category}>{category}</option>
                )}
              </select>
            </div>

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
                  className="w-full pl-9 p-3 font-bold bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-colors"
                />
              </div>
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Vencimiento</label>
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

            {/* Prioridad */}
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Prioridad</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-colors"
              >
                <option value="NORMAL">Normal</option>
                <option value="PRIORITARIO">Prioritario</option>
                <option value="URGENTE">Urgente</option>
              </select>
            </div>

            {/* Notas */}
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nota</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Detalles, motivo, notas..."
                className="w-full p-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-colors h-20 resize-none"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2 sticky bottom-0 bg-white dark:bg-slate-900 pb-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isSaving}
              className="flex-1 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-blue-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <><Save size={16} /> Guardar</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
