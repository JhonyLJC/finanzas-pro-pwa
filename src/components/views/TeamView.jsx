import React, { useState } from 'react';
import { Users, Plus, Mail, Lock, UserPlus, Trash2, AlertCircle } from 'lucide-react';

export default function TeamView({ teamApi }) {
  const { team, loading, createEmployee, deleteEmployee } = teamApi;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const MAX_EMPLOYEES = 4;
  const limitsReached = team.length >= MAX_EMPLOYEES;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setErrorMsg('');
    setIsCreating(true);
    
    try {
      await createEmployee(email, password);
      setEmail('');
      setPassword('');
      alert("Empleado creado exitosamente");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <section className="bg-white dark:bg-slate-900/40 rounded-3xl md:rounded-[2rem] shadow-xl md:shadow-2xl shadow-slate-200/50 dark:shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-slate-200 dark:border-slate-800/80 overflow-hidden backdrop-blur-xl p-4 md:p-8">
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
           <Users size={24} />
        </div>
        <div>
           <h2 className="text-xl md:text-2xl font-bold dark:text-white leading-tight">Mi Equipo</h2>
           <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Gestiona a tus empleados ({team.length}/{MAX_EMPLOYEES})
           </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Formulario de Invitar Empleado */}
        <div className="bg-slate-50 dark:bg-black/20 rounded-2xl p-6 border border-slate-100 dark:border-white/5 space-y-4">
           <h3 className="font-bold flex items-center gap-2 dark:text-white">
              <UserPlus size={18} className="text-blue-500" /> Nuevo Empleado
           </h3>
           
           {limitsReached ? (
              <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 p-4 rounded-xl flex items-start gap-3 border border-amber-200/50 dark:border-amber-700/30 text-sm font-medium">
                  <AlertCircle className="shrink-0" size={18} />
                  Has alcanzado el límite máximo de {MAX_EMPLOYEES} empleados permitidos por negocio.
              </div>
           ) : (
              <form onSubmit={handleCreate} className="space-y-4">
                  {errorMsg && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm font-medium">
                       {errorMsg}
                    </div>
                  )}
                  <div>
                      <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Correo (Email único)</label>
                      <div className="relative">
                          <input type="email" required placeholder="empleado@miempresa.com"
                              className="w-full p-3 pl-10 bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                              value={email} onChange={e=> setEmail(e.target.value)} />
                          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                  </div>
                  <div>
                      <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Contraseña (Mín. 6 caracteres)</label>
                      <div className="relative">
                          <input type="text" required placeholder="Contraseña Temporal" minLength={6}
                              className="w-full p-3 pl-10 bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                              value={password} onChange={e=> setPassword(e.target.value)} />
                          <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                  </div>
                  <button type="submit" disabled={isCreating}
                      className="w-full bg-blue-600 disabled:bg-slate-400 dark:disabled:bg-slate-700 text-white font-bold p-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition"
                  >
                      {isCreating ? 'Creando Empleado...' : <><Plus size={18} /> Autorizar Ingreso</>}
                  </button>
              </form>
           )}
        </div>

        {/* Lista de Empleados */}
        <div className="space-y-4">
           <h3 className="font-bold flex items-center gap-2 dark:text-white px-2">
               Activos en tu red
           </h3>
           
           {loading ? (
               <p className="text-slate-500 text-sm px-2">Cargando equipo...</p>
           ) : team.length === 0 ? (
               <div className="text-center py-10 bg-slate-50 dark:bg-black/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Aún no tienes empleados creados.</p>
               </div>
           ) : (
             <div className="space-y-3">
               {team.map((emp, i) => (
                 <div key={emp.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-white/5">
                     <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex justify-center items-center font-bold text-blue-600 dark:text-blue-400">
                             E{i+1}
                         </div>
                         <div>
                             <p className="font-bold dark:text-white">{emp.email}</p>
                             <p className="text-xs text-slate-500">Rol: {emp.role}</p>
                         </div>
                     </div>
                     <button type="button" onClick={async () => {
                         if (window.confirm(`¿Estás seguro de que deseas eliminar al empleado ${emp.email}?`)) {
                             try {
                                 await deleteEmployee(emp.id);
                                 alert('Empleado eliminado.');
                             } catch (err) {
                                 alert(err.message);
                             }
                         }
                     }} className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                     </button>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>
    </section>
  );
}
