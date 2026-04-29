import { useState, useEffect, useMemo } from 'react';
import { collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { db, appId, isMock } from '../lib/firebase';

export function usePayments(user) {
  const [payments, setPayments] = useState(() => {
    if (isMock) {
      const local = localStorage.getItem('payments');
      return local ? JSON.parse(local) : [];
    }
    return [];
  });

  const getCategoriesKey = () => `finanzaspro_categories_${user?.tenantId || user?.uid || 'local'}`;

  const [categories, setCategories] = useState(() => {
    try {
      const local = localStorage.getItem(getCategoriesKey());
      return local ? JSON.parse(local) : ['Alquiler', 'Servicios', 'Planillas', 'Proveedores', 'Varios'];
    } catch {
      return ['Alquiler', 'Servicios', 'Planillas', 'Proveedores', 'Varios'];
    }
  });

  const [loading, setLoading] = useState(!isMock);

  useEffect(() => {
    if (isMock) localStorage.setItem('payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    const key = getCategoriesKey();
    try {
      const local = localStorage.getItem(key);
      if (local) {
        setCategories(JSON.parse(local));
      } else {
        setCategories(['Alquiler', 'Servicios', 'Planillas', 'Proveedores', 'Varios']);
      }
    } catch {
      setCategories(['Alquiler', 'Servicios', 'Planillas', 'Proveedores', 'Varios']);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(getCategoriesKey(), JSON.stringify(categories));
  }, [categories, user]);

  // Escuchar Pagos de Firestore
  useEffect(() => {
    if (!user || isMock) {
      setTimeout(() => setLoading(false), 0);
      return;
    }
    const paymentsRef = collection(db, 'artifacts', appId, 'public', 'data', 'payments');
    const tenantId = user.tenantId || user.uid;
    const q = query(paymentsRef, where('tenantId', '==', tenantId));
    
    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPayments(data);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore error:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user]);

  // Listar Stats
  const todayStr = new Date().toLocaleDateString('en-CA');
  
  const todayOnlyPayments = useMemo(() => {
    return payments.filter(p => p.dueDate === todayStr && !p.isPaid);
  }, [payments, todayStr]);

  const overduePayments = useMemo(() => {
    return payments.filter(p => p.dueDate < todayStr && !p.isPaid).sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [payments, todayStr]);

  const stats = useMemo(() => {
    const calc = () => {
      const total = payments.reduce((acc, p) => acc + Number(p.amount), 0);
      const paid = payments.filter(p => p.isPaid).reduce((acc, p) => acc + Number(p.amount), 0);
      const pending = total - paid;
      const progress = total > 0 ? (paid / total) * 100 : 0;
      return { total, paid, pending, progress };
    };
    return { PEN: calc() };
  }, [payments]);

  // CRUD base
  const addPayment = async (formData) => {
    if (isMock) {
      const newDoc = {
        id: Date.now().toString(),
        ...formData,
        amount: Number(formData.amount),
        originalAmount: Number(formData.amount),
        isPaid: false,
        tenantId: user.tenantId || user.uid || 'local',
        createdBy: 'Local',
        createdAt: new Date().toISOString(),
        updatedBy: 'Local'
      };
      setPayments(prev => [...prev, newDoc]);
      return;
    }

    const tenantId = user.tenantId || user.uid;
    if (!tenantId) throw new Error('Usuario no identificado. Cierra sesión e ingresa nuevamente.');

    const paymentsRef = collection(db, 'artifacts', appId, 'public', 'data', 'payments');
    await addDoc(paymentsRef, {
      ...formData,
      amount: Number(formData.amount),
      originalAmount: Number(formData.amount),
      isPaid: false,
      tenantId,
      createdBy: user.email || user.uid,
      createdAt: serverTimestamp(),
      updatedBy: user.email || user.uid
    });
  };

  const deletePayment = async (id) => {
    if (isMock) {
      setPayments(prev => prev.filter(p => p.id !== id));
    } else {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'payments', id));
    }
  };

  const togglePaid = async (payment) => {
    const isNowPaid = !payment.isPaid;
    const completedAt = isNowPaid ? (isMock ? new Date().toISOString() : serverTimestamp()) : null;
    
    if (isMock) {
      setPayments(prev => prev.map(p => p.id === payment.id ? { ...p, isPaid: isNowPaid, completedAt } : p));
    } else {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'payments', payment.id);
      await updateDoc(docRef, {
        isPaid: isNowPaid,
        completedAt: isNowPaid ? serverTimestamp() : null,
        updatedBy: user.email || user.uid,
        updatedAt: serverTimestamp()
      });
    }

    if (isNowPaid && payment.recurrenceMode && payment.recurrenceMode !== 'none') {
      const [y, m, d] = payment.dueDate.split('-');
      const nextDate = new Date(y, m - 1, d);
      
      if (payment.recurrenceMode === 'weekly') {
        nextDate.setDate(nextDate.getDate() + 7);
      } else if (payment.recurrenceMode === 'biweekly') {
        nextDate.setDate(nextDate.getDate() + 15);
      } else if (payment.recurrenceMode === 'monthly') {
        const originalDay = nextDate.getDate();
        nextDate.setMonth(nextDate.getMonth() + 1);
        if (nextDate.getDate() !== originalDay) {
           nextDate.setDate(0);
        }
      } else if (payment.recurrenceMode === 'custom') {
        nextDate.setDate(nextDate.getDate() + (Number(payment.recurrenceDays) || 0));
      }

      const nextDateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;

      const newPayment = {
        title: payment.title,
        amount: Number(payment.originalAmount || payment.amount),
        originalAmount: Number(payment.originalAmount || payment.amount),
        category: payment.category || 'Varios',
        recurrenceMode: payment.recurrenceMode,
        recurrenceDays: payment.recurrenceDays || 30,
        dueDate: nextDateStr,
        isPaid: false,
        priority: payment.priority || 'NORMAL',
        note: payment.note || '',
        tenantId: payment.tenantId || user?.tenantId || 'local',
        voucherUrl: null
      };

      if (isMock) {
        setPayments(prev => [...prev, {
          id: Date.now().toString() + Math.floor(Math.random() * 1000),
          ...newPayment,
          createdBy: 'Sistema (Auto)',
          createdAt: new Date().toISOString(),
          updatedBy: 'Sistema (Auto)'
        }]);
      } else {
        const paymentsRef = collection(db, 'artifacts', appId, 'public', 'data', 'payments');
        addDoc(paymentsRef, {
          ...newPayment,
          createdBy: 'Sistema (Auto)',
          createdAt: serverTimestamp(),
          updatedBy: 'Sistema (Auto)'
        }).catch(err => console.error("Error clonando recurrente:", err));
      }
    }
  };

  const addPartialPayment = async (payment, inputAmount) => {
    const newPayment = {
      title: `[Abono] ${payment.title}`,
      amount: inputAmount,
      originalAmount: inputAmount,
      category: payment.category || 'Varios',
      recurrenceMode: 'none',
      dueDate: payment.dueDate,
      isPaid: true,
      paidDate: new Date().toLocaleDateString('en-CA'),
      tenantId: payment.tenantId || user?.tenantId || 'local',
      voucherUrl: null
    };

    if (isMock) {
      setPayments(prev => {
        const updated = prev.map(p => p.id === payment.id
          ? { ...p, amount: p.amount - inputAmount, originalAmount: p.originalAmount || p.amount }
          : p
        );
        return [...updated, {
          id: Date.now().toString() + Math.random().toString().slice(2, 5),
          ...newPayment,
          createdBy: 'Local (Abono)',
          createdAt: new Date().toISOString(),
          updatedBy: 'Local (Abono)'
        }];
      });
    } else {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'payments', payment.id);
      const paymentsRef = collection(db, 'artifacts', appId, 'public', 'data', 'payments');
      await Promise.all([
        updateDoc(docRef, { amount: payment.amount - inputAmount, originalAmount: payment.originalAmount || payment.amount, updatedAt: serverTimestamp() }),
        addDoc(paymentsRef, { ...newPayment, createdBy: user.email || user.uid, createdAt: serverTimestamp(), updatedBy: user.email || user.uid })
      ]);
    }
  };

  const editPayment = async (id, fields) => {
    if (isMock) {
      setPayments(prev => prev.map(p => p.id === id ? { ...p, ...fields, updatedBy: 'Local' } : p));
    } else {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'payments', id);
      await updateDoc(docRef, { ...fields, updatedBy: user.email || user.uid, updatedAt: serverTimestamp() });
    }
  };

  const attachVoucher = async (payment, voucherUrl) => {
    if (!voucherUrl) return;
    if (isMock) {
      setPayments(prev => prev.map(p => p.id === payment.id ? { ...p, voucherUrl } : p));
    } else {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'payments', payment.id);
      await updateDoc(docRef, { voucherUrl, updatedAt: serverTimestamp() });
    }
  };

  return {
    payments,
    categories,
    setCategories,
    loading,
    todayOnlyPayments,
    overduePayments,
    stats,
    addPayment,
    deletePayment,
    togglePaid,
    editPayment,
    addPartialPayment,
    attachVoucher
  };
}
