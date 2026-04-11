import React from 'react';
import { Calendar, Wallet, ListChecks, Lightbulb } from 'lucide-react';
import Collapsible from '../ui/Collapsible';
import CashFlowCard from '../dashboard/CashFlowCard';
import PrioritySection from '../dashboard/PrioritySection';
import DayInsights from '../dashboard/DayInsights';
import { useDashboard } from '../../hooks/useDashboard';

export default function HomeView({ paymentsApi, receivablesApi, permissions, subscription }) {
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

  const priorityPayments = [...paymentsApi.overduePayments, ...paymentsApi.todayOnlyPayments];
  const priorityPaymentsTotal = priorityPayments.reduce((acc, p) => acc + Number(p.amount || 0), 0);

  const priorityReceivables = [...receivablesApi.overdueReceivables, ...receivablesApi.todayOnlyReceivables];
  const priorityReceivablesTotal = priorityReceivables.reduce((acc, r) => acc + Number(r.amount || 0), 0);

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
          toPay={pending.toPay} 
          toCollect={pending.toCollect} 
          balance={pending.balance} 
          paymentsCount={pending.paymentsCount} 
          receivablesCount={pending.receivablesCount} 
       />

       <div className="mt-8">
           <Collapsible 
             title="PRIORIDAD PAGOS" 
             icon={<Wallet size={18} />} 
             defaultOpen={true}
             extra={
               <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 font-bold px-2 py-0.5 rounded-md text-xs">
                 S/ {priorityPaymentsTotal.toLocaleString()}
               </span>
             }
           >
              <PrioritySection 
                 type="payment" 
                 items={priorityPayments} 
                 permissions={permissions} 
                 onAction={paymentsApi.onAction || paymentsApi.togglePaid} 
              />
           </Collapsible>

           <Collapsible 
             title="PRIORIDAD COBROS" 
             icon={<ListChecks size={18} />} 
             defaultOpen={true}
             extra={
               <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-md text-xs">
                 S/ {priorityReceivablesTotal.toLocaleString()}
               </span>
             }
           >
              <PrioritySection 
                 type="receivable" 
                 items={priorityReceivables} 
                 permissions={{ ...permissions, canMarkPaid: permissions.canMarkCollected }} 
                 onAction={receivablesApi.onAction || receivablesApi.toggleCollected} 
              />
           </Collapsible>

           {insights && insights.length > 0 && (
             <Collapsible title="INSIGHT DÍA" icon={<Lightbulb size={18} />} defaultOpen={true}>
                <DayInsights insights={insights} />
             </Collapsible>
           )}

           <Collapsible title="RESUMEN MES" icon={<Calendar size={18} />} defaultOpen={false}>
               <div className="p-4 space-y-4">
                 <div>
                   <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-500 dark:text-slate-400 font-bold">Por Pagar</span>
                      <span className="font-black text-slate-800 dark:text-slate-200">S/ {Number(month.toPay).toLocaleString()}</span>
                   </div>
                   <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                     <div className="bg-red-500 h-2 rounded-full transition-all duration-500" style={{ width: `${month.toPay > 0 ? (month.paid / month.toPay) * 100 : 0}%`}}></div>
                   </div>
                   <p className="text-right text-[10px] mt-1 text-slate-400">Pagado: S/ {Number(month.paid).toLocaleString()} ({(month.toPay > 0 ? (month.paid / month.toPay) * 100 : 0).toFixed(0)}%)</p>
                 </div>
                 
                 <div>
                   <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-500 dark:text-slate-400 font-bold">Por Cobrar</span>
                      <span className="font-black text-slate-800 dark:text-slate-200">S/ {Number(month.toCollect).toLocaleString()}</span>
                   </div>
                   <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                     <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${month.toCollect > 0 ? (month.collected / month.toCollect) * 100 : 0}%`}}></div>
                   </div>
                   <p className="text-right text-[10px] mt-1 text-slate-400">Cobrado: S/ {Number(month.collected).toLocaleString()} ({(month.toCollect > 0 ? (month.collected / month.toCollect) * 100 : 0).toFixed(0)}%)</p>
                 </div>
               </div>
           </Collapsible>
       </div>
    </div>
  );
}
