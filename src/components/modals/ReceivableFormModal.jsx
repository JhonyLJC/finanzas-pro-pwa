import React, { useState } from 'react';
import { Plus, CheckCircle2, UserPlus, X, ChevronDown } from 'lucide-react';

export default function ReceivableFormModal({
  isModalOpen, setIsModalOpen,
  formData, setFormData,
  handleAddReceivable,
  clients = [],
  savedClients = [],
  onAddClient,
  onRemoveClient
}) {
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [newClientInput, setNewClientInput] = useState('');
  const [showAddClient, setShowAddClient] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isModalOpen) return null;

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await handleAddReceivable(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectClient = (clientName) => {
    setFormData({ ...formData, client: clientName });
    setShowClientDropdown(false);
  };

  const handleAddNewClient = () => {
    const name = newClientInput.trim();
    if (!name) return;
    if (onAddClient) onAddClient(name);
    setFormData({ ...formData, client: name });
    setNewClientInput('');
    setShowAddClient(false);
    setShowClientDropdown(false);
  };

  // Merge saved clients with clients from receivables history
  const allClients = [...new Set([...savedClients, ...clients])].sort();
  const filteredClients = formData.client
    ? allClients.filter(c => c.toLowerCase().includes(formData.client.toLowerCase()))
    : allClients;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-end md:items-center justify-center p-0 md:p-4 transition-all">
      <div className="bg-white dark:bg-slate-900/80 w-full max-w-md rounded-t-3xl md:rounded-2xl overflow-hidden animate-slide-up border border-slate-200 dark:border-white/10 shadow-2xl dark:shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl max-h-[95dvh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-white/50 dark:bg-black/20 shrink-0">
          <h3 className="text-xl font-bold dark:text-white">Nuevo Cobro</h3>
          <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors">
            <Plus size={24} className="rotate-45" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Concepto */}
          <div>
            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Concepto</label>
            <input required type="text" placeholder="Ej. Servicio de Consultoría"
              className="w-full p-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white transition-colors dark:placeholder-slate-500 shadow-inner"
              value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Monto (S/)</label>
            <input required type="number" step="0.01" placeholder="0.00"
              className="w-full p-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white transition-colors dark:placeholder-slate-500 shadow-inner"
              value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>

          {/* Cliente con lista desplegable */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Cliente</label>
              <button type="button" onClick={() => setShowAddClient(!showAddClient)}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 hover:underline">
                <UserPlus size={13} /> Añadir a lista
              </button>
            </div>

            {/* Agregar nuevo cliente a la lista permanente */}
            {showAddClient && (
              <div className="flex gap-2 mb-2">
                <input type="text" placeholder="Nombre del cliente"
                  className="flex-1 p-2.5 text-sm bg-slate-50 dark:bg-black/30 border border-emerald-300 dark:border-emerald-500/30 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                  value={newClientInput} onChange={e => setNewClientInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddNewClient())}
                />
                <button type="button" onClick={handleAddNewClient}
                  className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors">
                  Guardar
                </button>
                <button type="button" onClick={() => setShowAddClient(false)}
                  className="px-2 py-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={18} />
                </button>
              </div>
            )}

            {/* Campo de texto + menú desplegable */}
            <div className="relative">
              <div className="flex gap-2">
                <input type="text" placeholder="Escribe o selecciona un cliente..."
                  className="flex-1 p-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white transition-colors dark:placeholder-slate-500 shadow-inner"
                  value={formData.client}
                  onChange={e => { setFormData({ ...formData, client: e.target.value }); setShowClientDropdown(true); }}
                  onFocus={() => setShowClientDropdown(true)}
                />
                <button type="button" onClick={() => setShowClientDropdown(!showClientDropdown)}
                  className="px-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <ChevronDown size={18} className={`transition-transform ${showClientDropdown ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Dropdown list */}
              {showClientDropdown && allClients.length > 0 && (
                <div className="absolute z-10 left-0 right-10 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden max-h-40 overflow-y-auto">
                  {filteredClients.length > 0 ? filteredClients.map(c => (
                    <button key={c} type="button" onClick={() => handleSelectClient(c)}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 flex items-center justify-between group transition-colors">
                      {c}
                      {onRemoveClient && (
                        <span onClick={e => { e.stopPropagation(); onRemoveClient(c); }}
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all ml-2">
                          <X size={14} />
                        </span>
                      )}
                    </button>
                  )) : (
                    <p className="px-4 py-3 text-sm text-slate-400 italic">Sin coincidencias. Escribe libremente ↑</p>
                  )}
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Puedes escribir un nombre nuevo sin añadirlo a la lista.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Día de Cobro</label>
              <input required type="date"
                className="w-full p-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white transition-colors [color-scheme:light] dark:[color-scheme:dark] shadow-inner"
                value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Prioridad</label>
              <select
                className="w-full p-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white transition-colors shadow-inner"
                value={formData.priority || 'NORMAL'} onChange={e => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="NORMAL">Normal</option>
                <option value="PRIORITARIO">Prioritario</option>
                <option value="URGENTE">Urgente</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Nota</label>
            <textarea placeholder="Detalles, motivo, notas..."
              className="w-full p-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white transition-colors dark:placeholder-slate-500 shadow-inner resize-none h-20"
              value={formData.note || ''} onChange={e => setFormData({ ...formData, note: e.target.value })}
            />
          </div>

          {/* Recurrencia */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">¿Se repite?</label>
              <select
                className="w-full p-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white transition-colors shadow-inner"
                value={formData.recurrenceMode} onChange={e => setFormData({ ...formData, recurrenceMode: e.target.value })}>
                <option value="none">No se repite</option>
                <option value="weekly">Semanal (7 días)</option>
                <option value="biweekly">Quincenal (15 días)</option>
                <option value="monthly">Mensual (Mismo día sgt mes)</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>
            {formData.recurrenceMode === 'custom' && (
              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Días de salto</label>
                <input required type="number" min="1" placeholder="Ej. 45"
                  className="w-full p-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white transition-colors dark:placeholder-slate-500 shadow-inner"
                  value={formData.recurrenceDays} onChange={e => setFormData({ ...formData, recurrenceDays: e.target.value })}
                />
              </div>
            )}
          </div>

          <button type="submit" disabled={loading}
            className="w-full mt-4 bg-emerald-600 text-white font-bold p-4 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-[0_4px_15px_rgba(16,185,129,0.3)] dark:shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-70 disabled:cursor-not-allowed">
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <><CheckCircle2 size={20} /> Guardar Cobro</>
            )}
          </button>
        </form>
      </div>

      {/* Click outside to close dropdown */}
      {showClientDropdown && (
        <div className="fixed inset-0 z-0" onClick={() => setShowClientDropdown(false)} />
      )}
    </div>
  );
}
