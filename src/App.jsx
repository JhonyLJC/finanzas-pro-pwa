import React, { useState, useEffect } from 'react';
import { Wallet, Plus, ListChecks } from 'lucide-react';
import { usePayments } from './hooks/usePayments';
import { useAuth } from './hooks/useAuth';
import { useRole } from './hooks/useRole';
import { useReceivables } from './hooks/useReceivables';
import { useTeam } from './hooks/useTeam';

import TopHeader from './components/layout/TopHeader';
import BottomNav from './components/layout/BottomNav';
import Sidebar from './components/layout/Sidebar';
import StatCard from './components/ui/StatCard';
import Toast from './components/ui/Toast';
import Collapsible from './components/ui/Collapsible';
import HomeView from './components/views/HomeView';
import Nivel1Zone from './components/views/Nivel1Zone';
import CalendarView from './components/views/CalendarView';
import ListView from './components/views/ListView';
import RecordsView from './components/views/RecordsView';
import SubscriptionView from './components/views/SubscriptionView';
import TeamView from './components/views/TeamView';
import ProtectedRoute from './components/ProtectedRoute';

import PaymentFormModal from './components/modals/PaymentFormModal';
import ReceivableFormModal from './components/modals/ReceivableFormModal';
import PaymentConfirmModal from './components/modals/PaymentConfirmModal';
import ReceivableConfirmModal from './components/modals/ReceivableConfirmModal';
import EditModal from './components/modals/EditModal';
import InfoModal from './components/modals/InfoModal';
import SettingsModal from './components/modals/SettingsModal';

export default function App() {
  const { user, role, authError, authLoading, subscription, login, logout, sendPasswordReset, changePassword } = useAuth();
  const permissions = useRole(role, subscription?.isExpired, subscription?.plan);

  const [view, setView] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [toast, setToast] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [paymentModalTarget, setPaymentModalTarget] = useState(null);
  const [paymentModalAmount, setPaymentModalAmount] = useState('');
  const [receivableTarget, setReceivableTarget] = useState(null);
  const [receivableModalAmount, setReceivableModalAmount] = useState('');
  const [editTarget, setEditTarget] = useState(null); // { record, isReceivable }
  const [infoTarget, setInfoTarget] = useState(null);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);

  const todayStr = new Date().toLocaleDateString('en-CA');
  const [formData, setFormData] = useState({
    title: '', amount: '', category: 'Varios',
    recurrenceMode: 'none', recurrenceDays: 30, dueDate: todayStr,
    priority: 'NORMAL', note: ''
  });
  const [isReceivableModalOpen, setIsReceivableModalOpen] = useState(false);
  const [receivableFormData, setReceivableFormData] = useState({
    title: '', amount: '', category: 'Otros', invoiceNumber: '',
    recurrenceMode: 'none', recurrenceDays: 30, dueDate: todayStr,
    priority: 'NORMAL', note: ''
  });

  const {
    payments, categories, setCategories, loading,
    todayOnlyPayments, overduePayments, stats,
    addPayment, deletePayment, togglePaid, editPayment, addPartialPayment, attachVoucher
  } = usePayments(user);

  const receivablesApi = useReceivables(user);
  const teamApi = useTeam(user, role);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    try {
      const dataToSave = { ...formData };
      if (dataToSave.category === 'Varios' && dataToSave.customCategory?.trim()) {
         dataToSave.category = dataToSave.customCategory.trim();
      }
      delete dataToSave.customCategory;

      await addPayment(dataToSave);
      setIsModalOpen(false);
      setFormData({ title: '', amount: '', category: 'Varios', recurrenceMode: 'none', recurrenceDays: 30, dueDate: todayStr, priority: 'NORMAL', note: '' });
      showToast(`Pago "${formData.title}" registrado correctamente.`);
    } catch (err) {
      console.error('Error guardando pago:', err);
      showToast(`Error al guardar: ${err.message}`, 'error');
    }
  };

  const handleCreateReceivable = async (e) => {
    e.preventDefault();
    try {
      const dataToSave = { ...receivableFormData };
      if (dataToSave.category === 'Otros' && dataToSave.customCategory?.trim()) {
         dataToSave.category = dataToSave.customCategory.trim();
      }
      delete dataToSave.customCategory;

      await receivablesApi.addReceivable(dataToSave);
      setIsReceivableModalOpen(false);
      setReceivableFormData({ title: '', amount: '', category: 'Otros', invoiceNumber: '', recurrenceMode: 'none', recurrenceDays: 30, dueDate: todayStr, priority: 'NORMAL', note: '' });
      showToast(`Cobro "${dataToSave.title}" registrado correctamente.`);
    } catch (err) {
      console.error('Error guardando cobro:', err);
      showToast(`Error al guardar: ${err.message}`, 'error');
    }
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
     if (window.confirm('¿Estás seguro de que deseas eliminar este registro de pago? Esta acción no se puede deshacer.')) {
         await deletePayment(id);
         showToast("Registro eliminado permanentemente.", "error");
     }
  };

  const handleAttachVoucher = async (payment) => {
    const defaultUrl = '';
    const voucherUrl = window.prompt("Ingresa la URL del comprobante o número de recibo:", defaultUrl);
    await attachVoucher(payment, voucherUrl);
    if (voucherUrl) showToast("Comprobante adjuntado con éxito.");
  };

  // ── Cobros handlers ──────────────────────────────────────────────────
  const handleOpenReceivableModal = (receivable) => {
    if (receivable.isCollected) {
      receivablesApi.toggleCollected(receivable);
      showToast("Cobro desmarcado.");
      return;
    }
    setReceivableTarget(receivable);
    setReceivableModalAmount(receivable.amount.toString());
  };

  const handleConfirmReceivable = async (e) => {
    e.preventDefault();
    const rec = receivableTarget;
    const inputAmount = Number(receivableModalAmount);
    if (!rec || isNaN(inputAmount) || inputAmount <= 0) return;
    if (inputAmount >= rec.amount) {
      await receivablesApi.toggleCollected(rec);
      showToast(`S/ ${inputAmount.toLocaleString()} cobrados en "${rec.category || rec.title}"`);
    } else {
      await receivablesApi.addPartialReceivable(rec, inputAmount);
      showToast(`Abono de S/ ${inputAmount.toLocaleString()} registrado.`, 'success');
    }
    setReceivableTarget(null);
    setReceivableModalAmount('');
  };

  const handleDeleteReceivable = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este cobro pendiente? Esta acción no se puede deshacer.')) {
        await receivablesApi.deleteReceivable(id);
        showToast("Cobro eliminado.", "error");
    }
  };

  // ── Edit handlers ─────────────────────────────────────────────────────
  const handleEditPayment = (payment) => setEditTarget({ record: payment, isReceivable: false });
  const handleEditReceivable = (receivable) => setEditTarget({ record: receivable, isReceivable: true });

  const handleSaveEdit = async (id, fields) => {
    try {
      if (editTarget?.isReceivable) {
        await receivablesApi.editReceivable(id, fields);
        showToast("Cobro actualizado correctamente.");
      } else {
        await editPayment(id, fields);
        showToast("Pago actualizado correctamente.");
      }
      setEditTarget(null);
    } catch (err) {
      console.error('Error al editar:', err);
      showToast(`Error al guardar cambios: ${err.message}`, 'error');
    }
  };


  if (loading || receivablesApi.loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
    </div>
  );

  return (
    <ProtectedRoute user={user} onLogin={login} authError={authError} authLoading={authLoading}>
    <div className="flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased text-sm md:text-base h-[100dvh] overflow-hidden">
      
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      
      {subscription?.isExpired && (
        <div className="bg-red-600 text-white p-3 text-center text-sm font-bold flex flex-col md:flex-row items-center justify-center gap-3 z-40 shadow-md w-full absolute top-0">
           <span>⚠️ Tu período de prueba o suscripción ha finalizado. Estás en modo de solo lectura.</span>
           <button onClick={() => setView('subscription')} className="bg-white text-red-600 px-4 py-1.5 rounded-full text-xs hover:bg-red-50 transition-colors shadow-sm">
              Renovar ahora
           </button>
        </div>
      )}

      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        view={view} 
        setView={setView} 
        isAdmin={permissions.canManageTeam} 
        setIsSettingsOpen={setIsSettingsOpen}
        permissions={permissions}
      />

      <div className="flex-1 flex flex-col relative w-full overflow-y-auto">
        <TopHeader 
          role={role} 
          user={user} 
          isDarkMode={isDarkMode} 
          setIsDarkMode={setIsDarkMode} 
          onOpenSidebar={() => setIsSidebarOpen(true)} 
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full pb-32 md:pb-8">
          {view === 'home' && (
            <HomeView 
              paymentsApi={{ payments, todayOnlyPayments, overduePayments, togglePaid, stats, onAction: handleOpenPaymentModal }}
              receivablesApi={{ ...receivablesApi, todayOnlyReceivables: receivablesApi.todayOnlyReceivables, overdueReceivables: receivablesApi.overdueReceivables, onAction: handleOpenReceivableModal }}
              permissions={permissions}
              subscription={subscription}
              onInfo={setInfoTarget}
            />
          )}

          {['calendar', 'paymentList', 'receivableList', 'records'].includes(view) && (
            <section className="bg-white dark:bg-slate-900/40 rounded-3xl md:rounded-[2rem] shadow-xl md:shadow-2xl shadow-slate-200/50 dark:shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-slate-200 dark:border-slate-800/80 overflow-hidden backdrop-blur-xl">
                <div className="p-4 md:p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-black/20">
                    <h3 className="text-lg md:text-xl font-bold dark:text-white capitalize">
                        {view === 'calendar' ? 'Calendario de Movimientos' : view === 'paymentList' ? 'Pagos Pendientes' : view === 'receivableList' ? 'Cobros Pendientes' : 'Historial de Registros'}
                    </h3>
                </div>

                <div className="p-4 md:p-6">
                    {view === 'calendar' && (
                      <CalendarView 
                        payments={payments}
                        receivables={receivablesApi.receivables}
                        selectedDate={selectedDate} setSelectedDate={setSelectedDate}
                        onCheckPayment={handleOpenPaymentModal} onDeletePayment={handleDelete} onEditPayment={handleEditPayment}
                        onCheckReceivable={handleOpenReceivableModal} onDeleteReceivable={handleDeleteReceivable} onEditReceivable={handleEditReceivable}
                        onInfo={setInfoTarget}
                        permissions={{...permissions, canMarkCollected: permissions.canMarkCollected}}
                      />
                    )}
                    {view === 'paymentList' && (
                      <ListView 
                        payments={payments} onCheck={handleOpenPaymentModal} onDelete={handleDelete}
                        onAttach={handleAttachVoucher} onEdit={handleEditPayment} onInfo={setInfoTarget} permissions={permissions}
                        isReceivable={false}
                      />
                    )}
                    {view === 'receivableList' && (
                      <ListView 
                        payments={receivablesApi.receivables} onCheck={handleOpenReceivableModal} onDelete={handleDeleteReceivable}
                        onAttach={receivablesApi.attachVoucher} onEdit={handleEditReceivable} onInfo={setInfoTarget}
                        permissions={{...permissions, canMarkPaid: permissions.canMarkCollected}}
                        isReceivable={true}
                      />
                    )}
                    {view === 'records' && (
                      <RecordsView payments={payments} receivables={receivablesApi.receivables} permissions={permissions} />
                    )}
                </div>
            </section>
          )}

          {view === 'subscription' && <SubscriptionView user={user} />}
          {view === 'team' && permissions.canManageTeam && <TeamView teamApi={teamApi} />}
          
        </main>
      </div>

      <BottomNav 
        view={view} setView={setView} 
        setIsModalOpen={setIsModalOpen} 
        setIsSettingsOpen={setIsSettingsOpen} 
        canCreate={permissions.canCreate} 
      />

      {/* FAB Multi-device — unified menu */}
      {permissions.canCreate && (
        <>
          {isFabMenuOpen && (
            <div className="fixed inset-0 bg-black/20 z-30 transition-opacity backdrop-blur-sm" onClick={() => setIsFabMenuOpen(false)}></div>
          )}
          <div className="flex fixed bottom-6 md:bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-6 flex-col items-center md:items-end gap-3 z-40">
             {isFabMenuOpen && (
               <div className="flex flex-col gap-3 mb-2 animate-slide-up origin-bottom items-center md:items-end">
                  {permissions.canCreateReceivable && (
                      <button onClick={() => { setIsReceivableModalOpen(true); setIsFabMenuOpen(false); }}
                          className="px-5 py-3 bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-between gap-3 hover:scale-105 active:scale-95 transition-all text-sm font-bold border-2 border-emerald-500 shadow-emerald-500/30"
                          title="Nuevo Cobro"
                          >
                          Nuevo Cobro <ListChecks size={18} />
                      </button>
                  )}
                  <button onClick={() => { setIsModalOpen(true); setIsFabMenuOpen(false); }}
                      className="px-5 py-3 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-between gap-3 hover:scale-105 active:scale-95 transition-all text-sm font-bold border-2 border-blue-500 shadow-blue-500/30"
                      title="Nuevo Pago"
                      >
                      Nuevo Pago <Wallet size={18} />
                  </button>
               </div>
             )}

             <button onClick={() => setIsFabMenuOpen(!isFabMenuOpen)}
                 className={`w-14 h-14 bg-slate-800 dark:bg-slate-700 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 border-4 border-white dark:border-slate-900 ${isFabMenuOpen ? 'rotate-45 shadow-slate-500/50' : 'shadow-slate-500/30'}`}
                 >
                 <Plus size={28} />
             </button>
          </div>
        </>
      )}

      <PaymentFormModal 
        isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} 
        formData={formData} setFormData={setFormData} 
        handleAddPayment={handleCreatePayment} categories={categories} 
      />

      <ReceivableFormModal 
        isModalOpen={isReceivableModalOpen} setIsModalOpen={setIsReceivableModalOpen} 
        formData={receivableFormData} setFormData={setReceivableFormData} 
        handleAddReceivable={handleCreateReceivable} 
        categories={receivablesApi.receivableCategories}
      />

      <PaymentConfirmModal 
        paymentModalTarget={paymentModalTarget} setPaymentModalTarget={setPaymentModalTarget} 
        paymentModalAmount={paymentModalAmount} setPaymentModalAmount={setPaymentModalAmount} 
        handleConfirmPayment={handleConfirmPayment} 
      />

      <ReceivableConfirmModal
        receivableTarget={receivableTarget} setReceivableTarget={setReceivableTarget}
        receivableModalAmount={receivableModalAmount} setReceivableModalAmount={setReceivableModalAmount}
        handleConfirmReceivable={handleConfirmReceivable}
      />

      <EditModal
        record={editTarget?.record}
        isReceivable={editTarget?.isReceivable}
        categories={editTarget?.isReceivable ? receivablesApi.receivableCategories : categories}
        onSave={handleSaveEdit}
        onClose={() => setEditTarget(null)}
      />

      <InfoModal 
        infoTarget={infoTarget} setInfoTarget={setInfoTarget} 
        isReceivable={infoTarget?._type === 'receivable' || infoTarget?.isCollected !== undefined}
      />

      <SettingsModal 
        isSettingsOpen={isSettingsOpen} setIsSettingsOpen={setIsSettingsOpen} 
        categories={categories} setCategories={setCategories} 
        isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}
        user={user} role={role} subscription={subscription}
        onLogout={logout} setView={setView}
        changePassword={changePassword}
      />

    </div>
    </ProtectedRoute>
  );
}