import React, { useState } from 'react';
import {
  Users, Plus, Mail, Lock, UserPlus, Trash2, AlertCircle,
  Shield, Briefcase, Calculator, ChevronDown, Crown
} from 'lucide-react';

const ROLE_OPTIONS = [
  {
    value: 'admin_secundario',
    label: 'Admin Secundario',
    description: 'Acceso completo (crear, editar, eliminar)',
    icon: Shield,
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-100 dark:bg-violet-900/30',
    badge: 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300',
  },
  {
    value: 'empleado',
    label: 'Empleado',
    description: 'Ver, crear pagos y marcar como pagado',
    icon: Briefcase,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  },
  {
    value: 'contador',
    label: 'Contador',
    description: 'Solo visualizar registros y descargar Excel',
    icon: Calculator,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  },
];

function getRoleInfo(roleValue) {
  return ROLE_OPTIONS.find(r => r.value === roleValue) || ROLE_OPTIONS[1];
}

function RoleBadge({ role }) {
  const info = getRoleInfo(role);
  const Icon = info.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full ${info.badge}`}>
      <Icon size={10} />
      {info.label}
    </span>
  );
}

export default function TeamView({ teamApi }) {
  const { team, loading, createEmployee, deleteEmployee, changeEmployeeRole, maxTeam } = teamApi;
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [memberRole,  setMemberRole]  = useState('empleado');
  const [isCreating,  setIsCreating]  = useState(false);
  const [errorMsg,    setErrorMsg]    = useState('');
  const [roleMenuId,  setRoleMenuId]  = useState(null); // member id with open role dropdown

  const MAX = maxTeam || 10;
  const limitReached = team.length >= MAX;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setErrorMsg('');
    setIsCreating(true);
    try {
      await createEmployee(email, password, memberRole);
      setEmail('');
      setPassword('');
      setMemberRole('empleado');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (emp) => {
    if (!window.confirm(`¿Eliminar a ${emp.email} del equipo?`)) return;
    try {
      await deleteEmployee(emp.id);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRoleChange = async (emp, newRole) => {
    setRoleMenuId(null);
    if (emp.role === newRole) return;
    try {
      await changeEmployeeRole(emp.id, newRole);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <section className="bg-white dark:bg-slate-900/40 rounded-3xl md:rounded-[2rem] shadow-xl md:shadow-2xl shadow-slate-200/50 dark:shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-slate-200 dark:border-slate-800/80 overflow-hidden backdrop-blur-xl p-4 md:p-8">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-xl">
          <Users size={24} />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold dark:text-white leading-tight">Mi Equipo</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
            <Crown size={12} className="text-amber-500" />
            Plan Empresa · {team.length}/{MAX} integrantes
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">

        {/* ── Formulario ─────────────────────────────────────────────────────── */}
        <div className="bg-slate-50 dark:bg-black/20 rounded-2xl p-6 border border-slate-100 dark:border-white/5 space-y-4">
          <h3 className="font-bold flex items-center gap-2 dark:text-white">
            <UserPlus size={18} className="text-violet-500" /> Agregar Integrante
          </h3>

          {limitReached ? (
            <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 p-4 rounded-xl flex items-start gap-3 border border-amber-200/50 dark:border-amber-700/30 text-sm font-medium">
              <AlertCircle className="shrink-0 mt-0.5" size={18} />
              Has alcanzado el límite máximo de <strong>{MAX} integrantes</strong> permitidos en el Plan Empresa.
            </div>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              {errorMsg && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm font-medium flex items-start gap-2">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  {errorMsg}
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Correo electrónico
                </label>
                <div className="relative">
                  <input
                    type="email" required placeholder="integrante@empresa.com"
                    className="w-full p-3 pl-10 bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none dark:text-white text-sm"
                    value={email} onChange={e => setEmail(e.target.value)}
                  />
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Contraseña temporal <span className="font-normal text-slate-400">(mín. 6 caracteres)</span>
                </label>
                <div className="relative">
                  <input
                    type="text" required placeholder="Contraseña Temporal" minLength={6}
                    className="w-full p-3 pl-10 bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none dark:text-white text-sm"
                    value={password} onChange={e => setPassword(e.target.value)}
                  />
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* Selector de Rol */}
              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">
                  Rol del integrante
                </label>
                <div className="space-y-2">
                  {ROLE_OPTIONS.map(opt => {
                    const Icon = opt.icon;
                    const selected = memberRole === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setMemberRole(opt.value)}
                        className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                          selected
                            ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                            : 'border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 bg-white dark:bg-black/20'
                        }`}
                      >
                        <div className={`mt-0.5 p-1.5 rounded-lg ${opt.bg}`}>
                          <Icon size={14} className={opt.color} />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-bold ${selected ? 'text-violet-700 dark:text-violet-300' : 'dark:text-slate-200'}`}>
                            {opt.label}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">{opt.description}</p>
                        </div>
                        {selected && (
                          <div className="ml-auto shrink-0 w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center mt-1">
                            <div className="w-2 h-2 rounded-full bg-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit" disabled={isCreating}
                className="w-full bg-violet-600 disabled:bg-slate-400 dark:disabled:bg-slate-700 text-white font-bold p-3 rounded-xl flex items-center justify-center gap-2 hover:bg-violet-700 transition"
              >
                {isCreating
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creando...</>
                  : <><Plus size={18} /> Agregar al Equipo</>
                }
              </button>
            </form>
          )}
        </div>

        {/* ── Lista de integrantes ────────────────────────────────────────────── */}
        <div className="space-y-4">
          <h3 className="font-bold flex items-center gap-2 dark:text-white px-1">
            Integrantes activos
            <span className="text-xs font-medium text-slate-400 ml-auto">{team.length}/{MAX}</span>
          </h3>

          {loading ? (
            <div className="space-y-3">
              {[1,2].map(i => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
            </div>
          ) : team.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 dark:bg-black/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
              <Users size={28} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Aún no tienes integrantes.</p>
              <p className="text-xs text-slate-400 mt-1">Agrega hasta {MAX} personas a tu equipo.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {team.map((emp, i) => {
                const roleInfo = getRoleInfo(emp.role);
                const RoleIcon = roleInfo.icon;
                return (
                  <div key={emp.id} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-white/5 group hover:border-violet-200 dark:hover:border-violet-500/20 transition-all">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-full ${roleInfo.bg} flex justify-center items-center shrink-0`}>
                        <RoleIcon size={16} className={roleInfo.color} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold dark:text-white text-sm truncate">{emp.email}</p>
                        <RoleBadge role={emp.role} />
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {/* Cambiar rol */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setRoleMenuId(roleMenuId === emp.id ? null : emp.id)}
                          className="p-2 text-slate-400 hover:text-violet-500 dark:hover:text-violet-400 transition-colors rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/20"
                          title="Cambiar rol"
                        >
                          <ChevronDown size={16} className={`transition-transform ${roleMenuId === emp.id ? 'rotate-180' : ''}`} />
                        </button>
                        {roleMenuId === emp.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setRoleMenuId(null)} />
                            <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden w-48">
                              {ROLE_OPTIONS.map(opt => {
                                const Icon = opt.icon;
                                return (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => handleRoleChange(emp, opt.value)}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors text-left ${
                                      emp.role === opt.value
                                        ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-bold'
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                    }`}
                                  >
                                    <Icon size={14} className={opt.color} />
                                    {opt.label}
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                      {/* Eliminar */}
                      <button
                        type="button"
                        onClick={() => handleDelete(emp)}
                        className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Eliminar integrante"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Info de sincronización */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-500/10 text-xs text-blue-600 dark:text-blue-400 font-medium flex items-start gap-2">
            <Shield size={13} className="shrink-0 mt-0.5" />
            <span>Los integrantes heredan el período de tu plan y tienen acceso mientras tu suscripción esté activa.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
