import React, { useState } from 'react';
import { Plus, Settings, User, LogOut, Moon, Sun, Crown, ChevronRight, Mail, MessageCircle, HelpCircle, Lightbulb, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { isMock } from '../../lib/firebase';

export default function SettingsModal({
    isSettingsOpen, setIsSettingsOpen,
    categories, setCategories,
    isDarkMode, setIsDarkMode,
    user, role, subscription,
    onLogout, setView,
    changePassword
}) {
    const [newCategory, setNewCategory] = useState('');
    const [currentPwd, setCurrentPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [showCurrentPwd, setShowCurrentPwd] = useState(false);
    const [showNewPwd, setShowNewPwd] = useState(false);
    const [pwdLoading, setPwdLoading] = useState(false);
    const [pwdError, setPwdError] = useState('');
    const [pwdSuccess, setPwdSuccess] = useState(false);

    if (!isSettingsOpen) return null;

    const handleNavigateToSubscription = () => {
        setView('subscription');
        setIsSettingsOpen(false);
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPwdError('');
        setPwdSuccess(false);
        if (newPwd.length < 6) { setPwdError('La nueva contraseña debe tener al menos 6 caracteres.'); return; }
        if (newPwd !== confirmPwd) { setPwdError('Las contraseñas nuevas no coinciden.'); return; }
        setPwdLoading(true);
        try {
            await changePassword(currentPwd, newPwd);
            setPwdSuccess(true);
            setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
            setTimeout(() => setPwdSuccess(false), 4000);
        } catch (err) {
            const msgs = {
                'auth/wrong-password': 'La contraseña actual es incorrecta.',
                'auth/invalid-credential': 'La contraseña actual es incorrecta.',
                'auth/requires-recent-login': 'Sesión caducada. Cierra sesión e ingresa de nuevo.',
                'auth/weak-password': 'La nueva contraseña es muy débil.',
            };
            setPwdError(msgs[err.code] || err.message || 'Error al cambiar la contraseña.');
        } finally {
            setPwdLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-end md:items-center justify-center p-0 md:p-4 transition-all">
            <div className="bg-slate-50 dark:bg-slate-900/90 w-full max-w-md rounded-t-3xl md:rounded-2xl overflow-hidden animate-slide-up border border-slate-200 dark:border-white/10 shadow-2xl dark:shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl flex flex-col md:max-h-[85vh] h-[90vh] md:h-auto">
                <div className="p-6 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-white/50 dark:bg-black/20 sticky top-0 z-10">
                    <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                        <Settings size={22} className="text-slate-500" /> Ajustes
                    </h3>
                    <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-slate-800 dark:text-slate-500 dark:hover:text-white transition-colors bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                        <Plus size={20} className="rotate-45" />
                    </button>
                </div>

                <div className="p-4 md:p-6 overflow-y-auto space-y-6">

                    {/* 1. Módulo de Perfil y Sesión */}
                    <section className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Tu Cuenta</h4>
                        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden">
                            <div className="p-4 flex items-center gap-3 border-b border-slate-100 dark:border-white/5">
                                <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 p-3 rounded-full">
                                    <User size={20} />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">{user?.email || 'Usuario Local'}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">{role || 'Propietario'}</p>
                                </div>
                            </div>

                            <div className="p-4 flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Plan actual</span>
                                    {(() => {
                                        const planLabels = { personal: 'Personal (S/ 9.90/mes)', negocio: 'Negocio (S/ 19.90/mes)', empresa: 'Empresa (S/ 29.90/mes)', trial: 'Prueba Gratuita' };
                                        const label = planLabels[subscription?.plan] || 'Sin plan';
                                        const daysLeft = subscription?.currentPeriodEnd
                                            ? Math.max(0, Math.ceil((new Date(subscription.currentPeriodEnd) - new Date()) / 86400000))
                                            : 0;
                                        return (
                                            <>
                                                <span className={`text-xs font-bold ${subscription?.isExpired ? 'text-red-500' : 'text-emerald-500'}`}>
                                                    {subscription?.isExpired ? '⛔ Expirado' : `✅ ${label}`}
                                                </span>
                                                {!subscription?.isExpired && (
                                                    <span className="text-[10px] text-slate-400 mt-0.5">{daysLeft} días restantes</span>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                                <button onClick={handleNavigateToSubscription} className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-3 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors">
                                    <Crown size={14} /> Mejorar Plan
                                </button>
                            </div>

                            {!isMock && onLogout && (
                                <button onClick={onLogout} className="w-full p-4 flex items-center justify-between text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-slate-100 dark:border-white/5 font-bold text-sm">
                                    <div className="flex items-center gap-2"><LogOut size={18} /> Cerrar Sesión</div>
                                    <ChevronRight size={16} />
                                </button>
                            )}
                        </div>
                    </section>

                    {/* 2b. Cambiar Contraseña (solo si no es mock y tiene changePassword) */}
                    {!isMock && changePassword && (
                    <section className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Seguridad</h4>
                        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl p-4 space-y-3">
                            <div className="flex items-center gap-2 mb-1">
                                <Lock size={16} className="text-slate-500" />
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Cambiar contraseña</span>
                            </div>
                            {pwdSuccess && (
                                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl text-sm font-semibold">
                                    <CheckCircle2 size={16} /> Contraseña actualizada correctamente.
                                </div>
                            )}
                            {pwdError && (
                                <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg font-medium">{pwdError}</p>
                            )}
                            <form onSubmit={handleChangePassword} className="space-y-2.5">
                                {/* Contraseña actual */}
                                <div className="relative">
                                    <input
                                        type={showCurrentPwd ? 'text' : 'password'}
                                        placeholder="Contraseña actual"
                                        value={currentPwd} onChange={e => setCurrentPwd(e.target.value)}
                                        required
                                        className="w-full pr-10 pl-3 py-2.5 text-sm bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-colors"
                                    />
                                    <button type="button" onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        {showCurrentPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                                {/* Nueva contraseña */}
                                <div className="relative">
                                    <input
                                        type={showNewPwd ? 'text' : 'password'}
                                        placeholder="Nueva contraseña (mín. 6 car.)"
                                        value={newPwd} onChange={e => setNewPwd(e.target.value)}
                                        required
                                        className="w-full pr-10 pl-3 py-2.5 text-sm bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-colors"
                                    />
                                    <button type="button" onClick={() => setShowNewPwd(!showNewPwd)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        {showNewPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                                {/* Confirmar contraseña */}
                                <input
                                    type="password"
                                    placeholder="Confirmar nueva contraseña"
                                    value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)}
                                    required
                                    className="w-full pl-3 py-2.5 text-sm bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-colors"
                                />
                                <button type="submit" disabled={pwdLoading}
                                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60 shadow-[0_4px_12px_rgba(59,130,246,0.3)]">
                                    {pwdLoading
                                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        : <><Lock size={14} /> Actualizar contraseña</>}
                                </button>
                            </form>
                        </div>
                    </section>
                    )}

                    {/* 3. Preferencias */}
                    <section className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Preferencias</h4>
                        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden">
                            <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-bold text-slate-700 dark:text-slate-200">
                                <div className="flex items-center gap-3">
                                    {isDarkMode ? <Moon size={18} className="text-indigo-400" /> : <Sun size={18} className="text-amber-500" />}
                                    Apariencia
                                </div>
                                <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-md">
                                    {isDarkMode ? 'Oscuro' : 'Claro'}
                                </span>
                            </button>
                        </div>
                    </section>

                    {/* 4. Soporte y Sugerencias */}
                    <section className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Contacto</h4>
                        
                        <div className="grid grid-cols-1 gap-3">
                            {/* Bloque Soporte */}
                            <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl p-4">
                                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold mb-1">
                                    <HelpCircle size={18} />
                                    Soporte Técnico
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">¿Problemas o dudas? Contáctanos.</p>
                                
                                <div className="grid grid-cols-2 gap-2">
                                    <a
                                        href={`mailto:soporte@finanzaspro.com?subject=Soporte Técnico - ${user?.email}&body=Hola equipo FINANZASPRO,%0A%0ATengo el siguiente problema/duda:%0A[Describe aquí tu problema]%0A%0AUsuario: ${user?.email}`}
                                        className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-all text-xs border border-slate-200 dark:border-white/5"
                                    >
                                        <Mail size={16} /> Correo
                                    </a>
                                    {['negocio', 'empresa'].includes(subscription?.plan?.toLowerCase()) ? (
                                        <button
                                            onClick={() => {
                                                const phone = '51964173218';
                                                const msj = `Hola equipo FINANZASPRO, necesito Soporte Técnico.\n\nMi problema/duda es:\n[Describe aquí]\n\nUsuario: ${user?.email}`;
                                                window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msj)}`, '_blank');
                                            }}
                                            className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl font-bold transition-all text-xs shadow-md"
                                        >
                                            <MessageCircle size={16} /> WhatsApp
                                        </button>
                                    ) : (
                                        <button disabled className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-slate-50 dark:bg-slate-800/30 text-slate-400 dark:text-slate-600 rounded-xl font-bold text-xs cursor-not-allowed border border-slate-100 dark:border-white/5" title="Sube de plan">
                                            <MessageCircle size={16} /> WA (Pro)
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Bloque Sugerencias */}
                            <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl p-4">
                                <div className="flex items-center gap-2 text-amber-500 font-bold mb-1">
                                    <Lightbulb size={18} />
                                    Sugerencias
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">¿Ideas de mejora? Queremos escucharte.</p>
                                
                                <div className="grid grid-cols-2 gap-2">
                                    <a
                                        href={`mailto:soporte@finanzaspro.com?subject=Sugerencia de Mejora - ${user?.email}&body=Hola equipo FINANZASPRO,%0A%0AMe gustaría sugerir lo siguiente:%0A[Describe aquí tu sugerencia]%0A%0AUsuario: ${user?.email}`}
                                        className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-all text-xs border border-slate-200 dark:border-white/5"
                                    >
                                        <Mail size={16} /> Correo
                                    </a>
                                    {['negocio', 'empresa'].includes(subscription?.plan?.toLowerCase()) ? (
                                        <button
                                            onClick={() => {
                                                const phone = '51964173218';
                                                const msj = `Hola equipo FINANZASPRO, tengo una Sugerencia de mejora.\n\nMi idea es:\n[Describe aquí]\n\nUsuario: ${user?.email}`;
                                                window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msj)}`, '_blank');
                                            }}
                                            className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl font-bold transition-all text-xs shadow-md"
                                        >
                                            <MessageCircle size={16} /> WhatsApp
                                        </button>
                                    ) : (
                                        <button disabled className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-slate-50 dark:bg-slate-800/30 text-slate-400 dark:text-slate-600 rounded-xl font-bold text-xs cursor-not-allowed border border-slate-100 dark:border-white/5" title="Sube de plan">
                                            <MessageCircle size={16} /> WA (Pro)
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}
