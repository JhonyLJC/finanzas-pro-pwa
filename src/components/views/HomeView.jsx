import React from 'react';
import { Calendar, Wallet, ListChecks } from 'lucide-react';
import Collapsible from '../ui/Collapsible';
import CashFlowCard from '../dashboard/CashFlowCard';
import PrioritySection from '../dashboard/PrioritySection';
import { useDashboard } from '../../hooks/useDashboard';

export default function HomeView({ paymentsApi, receivablesApi, permissions, subscription, onInfo }) {
  const { today, pending, month, insights, loading } = useDashboard(paymentsApi, receivablesApi);

  const todayStr = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });
  
  // Calculate remaining days
  let daysLeft = 0;
  let daysLabel = '';
  if (subscription?.currentPeriodEnd && !subscription?.isExpired) {
    const msLeft = new Date(subscription.currentPeriodEnd).getTime() - new Date().getTime();
    daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
    if (daysLeft >= 365) {
      const years = Math.floor(daysLeft / 365);
      daysLabel = `${years} año${years > 1 ? 's' : ''} restante${years > 1 ? 's' : ''}`;
    } else if (daysLeft >= 30) {
      const months = Math.floor(daysLeft / 30);
      daysLabel = `${months} mes${months > 1 ? 'es' : ''} restante${months > 1 ? 's' : ''}`;
    } else {
      daysLabel = `${daysLeft} día${daysLeft !== 1 ? 's' : ''} restante${daysLeft !== 1 ? 's' : ''}`;
    }
  }

  if (loading) return null;

  const todayDateStr = new Date().toLocaleDateString('en-CA');
  const next3DaysDate = new Date();
  next3DaysDate.setDate(next3DaysDate.getDate() + 3);
  const next3DaysStr = next3DaysDate.toLocaleDateString('en-CA');

  const overduePayments = paymentsApi.overduePayments || [];
  const upcomingPayments = (paymentsApi.payments || []).filter(p => !p.isPaid && p.dueDate >= todayDateStr && p.dueDate <= next3DaysStr);
  const overdueReceivables = receivablesApi.overdueReceivables || [];
  const upcomingReceivables = (receivablesApi.receivables || []).filter(r => !r.isCollected && r.dueDate >= todayDateStr && r.dueDate <= next3DaysStr);

  const overduePaymentsTotal = overduePayments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
  const upcomingPaymentsTotal = upcomingPayments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
  const overdueReceivablesTotal = overdueReceivables.reduce((acc, r) => acc + Number(r.amount || 0), 0);
  const upcomingReceivablesTotal = upcomingReceivables.reduce((acc, r) => acc + Number(r.amount || 0), 0);

  return (
    <div className="space-y-2">
       <div className="flex flex-col mb-6">
          <div className="flex justify-between items-start">
             <h2 className="text-2xl font-black text-slate-800 dark:text-white capitalize">Inicio</h2>
             {subscription && !subscription.isExpired && daysLeft > 0 && (
               <div className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-xs font-bold shadow-md flex items-center gap-1.5">
                  <span className="animate-pulse w-1.5 h-1.5 bg-white rounded-full"></span>
                  {daysLabel}
               </div>
             )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 capitalize mt-1">{todayStr}</p>
       </div>

       <CashFlowCard 
          pending={pending} 
          month={month} 
       />

       <div className="mt-8 space-y-6">
           {/* 1. PAGOS VENCIDOS */}
           <Collapsible 
             title="PAGOS VENCIDOS" 
             icon={<Wallet size={18} className="text-red-500" />} 
             defaultOpen={true}
             extra={
               <span className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 font-bold px-2 py-0.5 rounded-md text-xs">
                 S/ {overduePaymentsTotal.toLocaleString()}
               </span>
             }
           >
              <PrioritySection 
                 type="payment" 
                 items={overduePayments} 
                 permissions={permissions} 
                 onAction={paymentsApi.onAction || paymentsApi.togglePaid} 
                 onInfo={onInfo}
              />
           </Collapsible>

           {/* 2. PAGOS POR VENCER */}
           <Collapsible 
             title="PAGOS POR VENCER" 
             icon={<Wallet size={18} className="text-orange-500" />} 
             defaultOpen={true}
             extra={
               <span className="bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 font-bold px-2 py-0.5 rounded-md text-xs">
                 S/ {upcomingPaymentsTotal.toLocaleString()}
               </span>
             }
           >
              <PrioritySection 
                 type="payment" 
                 items={upcomingPayments} 
                 permissions={permissions} 
                 onAction={paymentsApi.onAction || paymentsApi.togglePaid} 
                 onInfo={onInfo}
              />
           </Collapsible>

           {/* 3. COBROS VENCIDOS */}
           <Collapsible 
             title="COBROS VENCIDOS" 
             icon={<ListChecks size={18} className="text-red-500" />} 
             defaultOpen={true}
             extra={
               <span className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 font-bold px-2 py-0.5 rounded-md text-xs">
                 S/ {overdueReceivablesTotal.toLocaleString()}
               </span>
             }
           >
              <PrioritySection 
                 type="receivable" 
                 items={overdueReceivables} 
                 permissions={{ ...permissions, canMarkPaid: permissions.canMarkCollected }} 
                 onAction={receivablesApi.onAction || receivablesApi.toggleCollected} 
                 onInfo={onInfo}
              />
           </Collapsible>

           {/* 4. COBROS POR VENCER */}
           <Collapsible 
             title="COBROS POR VENCER" 
             icon={<ListChecks size={18} className="text-emerald-500" />} 
             defaultOpen={true}
             extra={
               <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-md text-xs">
                 S/ {upcomingReceivablesTotal.toLocaleString()}
               </span>
             }
           >
              <PrioritySection 
                 type="receivable" 
                 items={upcomingReceivables} 
                 permissions={{ ...permissions, canMarkPaid: permissions.canMarkCollected }} 
                 onAction={receivablesApi.onAction || receivablesApi.toggleCollected} 
                 onInfo={onInfo}
              />
           </Collapsible>
       </div>
    </div>
  );
}
