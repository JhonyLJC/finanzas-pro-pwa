import React, { useState, useEffect } from 'react';
import { Wallet, Plus } from 'lucide-react';
import { usePayments } from './hooks/usePayments';
import { useAuth } from './hooks/useAuth';
import { useRole } from './hooks/useRole';

import TopHeader from './components/layout/TopHeader';
import BottomNav from './components/layout/BottomNav';
import StatCard from './components/ui/StatCard';
import Toast from './components/ui/Toast';
import Nivel1Zone from './components/views/Nivel1Zone';
import CalendarView from './components/views/CalendarView';
import ListView from './components/views/ListView';
import RecordsView from './components/views/RecordsView';
import ProtectedRoute from './components/ProtectedRoute';

import PaymentFormModal from './components/modals/PaymentFormModal';
import PaymentConfirmModal from './components/modals/PaymentConfirmModal';
import SettingsModal from './components/modals/SettingsModal';

export default function App() {
  const { user, role, authError, authLoading, login, logout } = useAuth();
  const permissions = useRole(role);

  const [view, setView] = useState('calendar');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [paymentModalTarget, setPaymentModalTarget] = useState(null);
  const [paymentModalAmount, setPaymentModalAmount] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    title: '', amount: '', category: 'Varios',
    recurrenceMode: 'none', recurrenceDays: 30, dueDate: todayStr
  });

  const {
    payments, categories, setCategories, loading,
    todayOnlyPayments, overduePayments, stats,
    addPayment, deletePayment, togglePaid, addPartialPayment, attachVoucher
  } = usePayments(user);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    await addPayment(formData);
    setIsModalOpen(false);
    setFormData({ title: '', amount: '', category: 'Varios', recurrenceMode: 'none', recurrenceDays: 30, dueDate: todayStr });
    showToast(`Pago "${formData.title}" registrado correctamente.`);
  };

  const handleOpenPaymentModal = (payment) => {
    if (payment.isPaid) {
      togglePaid(payment);
      showToast(`Pago desmarcado exitosamente.`);
      return;
    }
    setPaymentModalTarget(payment);
    setPaymentModalAmount(payment.amount.toString());
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    const payment = paymentModalTarget;
    const inputAmount = Number(paymentModalAmount);
    if (!payment || isNaN(inputAmount) || inputAmount <= 0) return;

    if (inputAmount >= payment.amount) {
      await togglePaid(payment);
      showToast(`S/ ${inputAmount.toLocaleString()} pagados totalmente a "${payment.title}"`);
    } else {
      await addPartialPayment(payment, inputAmount);
      showToast(`Abono de S/ ${inputAmount.toLocaleString()} registrado. Deuda pendiente actualizada.`, 'success');
    }
    setPaymentModalTarget(null);
    setPaymentModalAmount('');
  };

  const handleDelete = async (id) => {
     await deletePayment(id);
     showToast("Registro eliminado permanentemente.", "error");
  };

  const handleAttachVoucher = async (payment) => {
    const defaultUrl = isMock ? 'https://ejemplo.com/voucher.pdf' : '';
    const voucherUrl = window.prompt("Ingresa la URL del comprobante o número de recibo:", defaultUrl);
    await attachVoucher(payment, voucherUrl);
    if (voucherUrl) showToast("Comprobante adjuntado con éxito.");
  };

  const exportToCSV = () => {
    const headers = "ID,Concepto,Monto,Vencimiento,Estado,CreadoPor\n";
    const rows = payments.map(p =>
      `${p.id},"${p.title}",${p.amount},${p.dueDate},${p.isPaid ? 'Pagado' : 'Pendiente'},${p.createdBy}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `reporte_pagos_${todayStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
    </div>
  );

  return (
    <ProtectedRoute user={user} onLogin={login} authError={authError} authLoading={authLoading}>
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans pb-24 md:pb-6 transition-colors selection:bg-blue-200 dark:selection:bg-blue-900">
      
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      
      <TopHeader 
        role={permissions.roleLabel} 
        user={user} 
        isDarkMode={isDarkMode} 
        setIsDarkMode={setIsDarkMode} 
        view={view} 
        setView={setView} 
        setIsSettingsOpen={setIsSettingsOpen}
        onLogout={logout}
        canManageCategories={permissions.canManageCategories}
      />

      <main className="max-w-5xl mx-auto p-4 space-y-6 animate-fade-in relative z-10">
        <Nivel1Zone 
          todayOnlyPayments={todayOnlyPayments} 
          overduePayments={overduePayments} 
          handleOpenPaymentModal={handleOpenPaymentModal} 
        />

        <section className="bg-white dark:bg-slate-900/60 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden transition-colors backdrop-blur-md">
            <div className="p-4 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-slate-50/50 dark:bg-black/20">
                <h3 className="font-bold text-slate-700 dark:text-slate-200">
                    {view === 'calendar' ? 'Calendario de Pagos' : view === 'list' ? 'Pendientes' : 'Registros'}
                </h3>
                <div className="flex w-full md:w-auto items-center gap-2">
                    {/* Pestañas de Vista */}
                    {['calendar', 'list', 'records'].map(v => (
                      <button key={v} onClick={() => setView(v)}
                          className={`flex-1 md:flex-none text-center px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border
                            ${view === v
                              ? 'bg-blue-600 text-white border-blue-600 dark:border-blue-500 shadow-sm'
                              : 'bg-transparent text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}>
                          {v === 'calendar' ? '📅 Mes' : v === 'list' ? '📋 Pendientes' : '📚 Registros'}
                      </button>
                    ))}
                    <button onClick={exportToCSV}
                        className="hidden md:flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition-colors shadow-sm"
                        >
                        Exportar
                    </button>
                </div>
            </div>

            <div className="p-4">
                {view === 'calendar' && (
                  <CalendarView 
                    payments={payments} selectedDate={selectedDate} setSelectedDate={setSelectedDate} 
                    onCheck={handleOpenPaymentModal} onDelete={handleDelete} onAttach={handleAttachVoucher} permissions={permissions} 
                  />
                )}
                {view === 'list' && (
                  <ListView 
                    payments={payments} onCheck={handleOpenPaymentModal} onDelete={handleDelete} onAttach={handleAttachVoucher} permissions={permissions} 
                  />
                )}
                {view === 'records' && (
                  <RecordsView payments={payments} />
                )}
            </div>
        </section>

        <section className="grid grid-cols-1 gap-4">
            <StatCard 
              title="Total Pagos Mensuales (PEN)" 
              symbol="S/" 
              data={stats.PEN} 
              color="amber" 
              icon={<Wallet className="text-amber-600 dark:text-amber-400" size={28} />}
            />
        </section>
      </main>

      <BottomNav 
        view={view} setView={setView} 
        setIsModalOpen={setIsModalOpen} 
        setIsSettingsOpen={setIsSettingsOpen} 
        canCreate={permissions.canCreate} 
      />

      {/* FAB Desktop — solo visible si tiene permisos */}
      {permissions.canCreate && (
        <button onClick={() => setIsModalOpen(true)}
            className="hidden md:flex fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg items-center justify-center hover:scale-105 active:scale-95 transition-all z-40 border border-blue-500 shadow-blue-500/40"
            >
            <Plus size={28} />
        </button>
      )}

      <PaymentFormModal 
        isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} 
        formData={formData} setFormData={setFormData} 
        handleAddPayment={handleCreatePayment} categories={categories} 
      />

      <PaymentConfirmModal 
        paymentModalTarget={paymentModalTarget} setPaymentModalTarget={setPaymentModalTarget} 
        paymentModalAmount={paymentModalAmount} setPaymentModalAmount={setPaymentModalAmount} 
        handleConfirmPayment={handleConfirmPayment} 
      />

      <SettingsModal 
        isSettingsOpen={isSettingsOpen} setIsSettingsOpen={setIsSettingsOpen} 
        categories={categories} setCategories={setCategories} 
      />

    </div>
    </ProtectedRoute>
  );
}