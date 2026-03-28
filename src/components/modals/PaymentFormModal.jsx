import React from 'react';
import { Plus, CheckCircle2 } from 'lucide-react';

export default function PaymentFormModal({ isModalOpen, setIsModalOpen, formData, setFormData, handleAddPayment, categories }) {
  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-end md:items-center justify-center p-0 md:p-4 transition-all">
        <div className="bg-white dark:bg-slate-900/80 w-full max-w-md rounded-t-3xl md:rounded-2xl overflow-hidden animate-slide-up border border-slate-200 dark:border-white/10 shadow-2xl dark:shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl">
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-white/50 dark:bg-black/20">
                <h3 className="text-xl font-bold dark:text-white">Nuevo Pago</h3>
                <button onClick={()=> setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors">
                    <Plus size={24} className="rotate-45" />
                </button>
            </div>
            <form onSubmit={handleAddPayment} className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Concepto</label>
                    <input required type="text" placeholder="Ej. Alquiler Local"
                        className="w-full p-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-colors dark:placeholder-slate-500 shadow-inner"
                        value={formData.title} onChange={e=> setFormData({...formData, title: e.target.value})}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Monto (S/)</label>
                        <input required type="number" step="0.01" placeholder="0.00"
                            className="w-full p-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-colors dark:placeholder-slate-500 shadow-inner"
                            value={formData.amount} onChange={e=> setFormData({...formData, amount: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Categoría</label>
                        <select
                            className="w-full p-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-colors shadow-inner"
                            value={formData.category} onChange={e=> setFormData({...formData, category: e.target.value})}
                            >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Fecha de Vencimiento</label>
                    <input required type="date"
                        className="w-full p-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-colors [color-scheme:light] dark:[color-scheme:dark] shadow-inner"
                        value={formData.dueDate} onChange={e=> setFormData({...formData, dueDate: e.target.value})}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">¿Se repite?</label>
                        <select
                            className="w-full p-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-colors shadow-inner"
                            value={formData.recurrenceMode} onChange={e=> setFormData({...formData, recurrenceMode: e.target.value})}
                            >
                            <option value="none">No se repite</option>
                            <option value="weekly">Semanal (7 días)</option>
                            <option value="biweekly">Quincenal (15 días)</option>
                            <option value="monthly">Mensual (30 días)</option>
                            <option value="custom">Personalizado</option>
                        </select>
                    </div>
                    {formData.recurrenceMode === 'custom' && (
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Días de salto</label>
                        <input required type="number" min="1" placeholder="Ej. 45"
                            className="w-full p-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-colors dark:placeholder-slate-500 shadow-inner"
                            value={formData.recurrenceDays} onChange={e=> setFormData({...formData, recurrenceDays: e.target.value})}
                        />
                    </div>
                    )}
                </div>
                <button type="submit"
                    className="w-full mt-4 bg-blue-600 text-white font-bold p-4 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-[0_4px_15px_rgba(59,130,246,0.3)] dark:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                    >
                    <CheckCircle2 size={20} /> Guardar Registro
                </button>
            </form>
        </div>
    </div>
  );
}
