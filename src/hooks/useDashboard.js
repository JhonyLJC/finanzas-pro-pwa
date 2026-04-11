import { useMemo } from 'react';

export function useDashboard(paymentsApi, receivablesApi) {
  const loading = paymentsApi.loading || receivablesApi.loading;

  const pending = useMemo(() => {
    // ALL pending payments (not paid)
    const allPendingPayments = paymentsApi.payments
      ? paymentsApi.payments.filter(p => !p.isPaid)
      : [...(paymentsApi.overduePayments || []), ...(paymentsApi.todayOnlyPayments || [])];
    // ALL pending receivables (not collected)
    const allPendingReceivables = receivablesApi.receivables
      ? receivablesApi.receivables.filter(r => !r.isCollected)
      : [...(receivablesApi.overdueReceivables || []), ...(receivablesApi.todayOnlyReceivables || [])];

    const toPay = allPendingPayments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
    const toCollect = allPendingReceivables.reduce((acc, r) => acc + Number(r.amount || 0), 0);
    const balance = toCollect - toPay;
    return { toPay, toCollect, balance, paymentsCount: allPendingPayments.length, receivablesCount: allPendingReceivables.length };
  }, [paymentsApi.payments, paymentsApi.overduePayments, paymentsApi.todayOnlyPayments, receivablesApi.receivables, receivablesApi.overdueReceivables, receivablesApi.todayOnlyReceivables]);

  // Keep 'today' for insights backward compat
  const today = useMemo(() => {
    const toPay = (paymentsApi.todayOnlyPayments || []).reduce((acc, p) => acc + Number(p.amount), 0);
    const toCollect = (receivablesApi.todayOnlyReceivables || []).reduce((acc, r) => acc + Number(r.amount), 0);
    const balance = toCollect - toPay;
    return { toPay, toCollect, balance };
  }, [paymentsApi.todayOnlyPayments, receivablesApi.todayOnlyReceivables]);

  const overdue = useMemo(() => {
    const toPay = paymentsApi.overduePayments.reduce((acc, p) => acc + Number(p.amount), 0);
    const toCollect = receivablesApi.overdueReceivables.reduce((acc, r) => acc + Number(r.amount), 0);
    const balance = toCollect - toPay;
    return { toPay, toCollect, balance };
  }, [paymentsApi.overduePayments, receivablesApi.overdueReceivables]);

  const month = useMemo(() => {
    const toPay = paymentsApi.stats.PEN.total;
    const paid = paymentsApi.stats.PEN.paid;
    const toCollect = receivablesApi.stats.PEN.total;
    const collected = receivablesApi.stats.PEN.collected;
    const expectedBalance = toCollect - toPay; 
    const currentBalance = collected - paid; 
    return { toPay, paid, toCollect, collected, expectedBalance, currentBalance };
  }, [paymentsApi.stats, receivablesApi.stats]);

  const insights = useMemo(() => {
    const messages = [];
    
    // Alertas críticas (vencidos)
    if (paymentsApi.overduePayments.length > 0) {
      messages.push({ type: 'danger', text: `Tienes ${paymentsApi.overduePayments.length} pago(s) vencido(s) que requieren acción.` });
    }
    if (receivablesApi.overdueReceivables.length > 0) {
      messages.push({ type: 'warning', text: `Tienes ${receivablesApi.overdueReceivables.length} cobro(s) atrasado(s). ¡Haz seguimiento!` });
    }
    
    // Alertas de flujo de caja (hoy)
    if (today.toPay > 0 && today.toCollect < today.toPay) {
      messages.push({ type: 'info', text: `Tus obligaciones de hoy superan tus cobros por S/ ${(today.toPay - today.toCollect).toLocaleString()}. Revisa tu liquidez.` });
    } else if (today.toCollect > today.toPay && today.toCollect > 0) {
       messages.push({ type: 'success', text: `Balance diario positivo: Esperas recolectar S/ ${today.balance.toLocaleString()} más de lo que debes pagar hoy.` });
    }

    // Estado general
    if (paymentsApi.overduePayments.length === 0 && receivablesApi.overdueReceivables.length === 0 && today.toPay === 0) {
        messages.push({ type: 'success', text: "¡Todo al día! No tienes obligaciones urgentes pendientes." });
    }
    
    return messages;
  }, [paymentsApi.overduePayments, receivablesApi.overdueReceivables, today]);

  return {
    loading,
    today,
    pending,
    overdue,
    month,
    insights
  };
}
