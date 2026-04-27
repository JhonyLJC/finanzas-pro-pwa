import React, { useState } from 'react';
import { Plus, Settings, Trash2, User, LogOut, Moon, Sun, Crown, ChevronRight, Mail, MessageCircle } from 'lucide-react';
import { isMock } from '../../lib/firebase';

export default function SettingsModal({
    isSettingsOpen, setIsSettingsOpen,
    categories, setCategories,
    isDarkMode, setIsDarkMode,
    user, role, subscription,
    onLogout, setView
}) {
    const [newCategory, setNewCategory] = useState('');

    if (!isSettingsOpen) return null;

    const handleNavigateToSubscription = () => {
        setView('subscription');
        setIsSettingsOpen(false);
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

                    {/* 2. Preferencias */}
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
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Soporte y Sugerencias</h4>
                        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl p-4 space-y-4">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                ¿Tienes alguna idea para mejorar o necesitas ayuda? Contáctanos de acuerdo a tu plan.
                            </p>

                            <div className="flex flex-col gap-3">
                                <a
                                    href={`mailto:soporte@finanzaspro.com?subject=Soporte/Sugerencia - ${user?.email}`}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-all text-sm border border-slate-200 dark:border-white/5"
                                >
                                    <Mail size={18} />
                                    Soporte por Correo
                                </a>

                                {['negocio', 'empresa'].includes(subscription?.plan?.toLowerCase()) ? (
                                    <button
                                        onClick={() => {
                                            const phone = '51964173218';
                                            const msj = `Hola equipo FINANZASPRO, necesito soporte/tengo una sugerencia.\nUsuario: ${user?.email}`;
                                            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msj)}`, '_blank');
                                        }}
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl font-bold transition-all text-sm shadow-md"
                                    >
                                        <MessageCircle size={18} />
                                        WhatsApp Prioritario
                                    </button>
                                ) : (
                                    <button
                                        disabled
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-slate-800/30 text-slate-400 dark:text-slate-600 rounded-xl font-bold text-sm cursor-not-allowed border border-slate-100 dark:border-white/5"
                                        title="Exclusivo para planes Negocio y Empresa"
                                    >
                                        <MessageCircle size={18} />
                                        WhatsApp Prioritario (Sube de plan)
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}
