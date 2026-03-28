import { useState, useEffect, useMemo } from 'react';
import { collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, appId, isMock } from '../lib/firebase';

export function usePayments(user) {
  const [payments, setPayments] = useState(() => {
    if (isMock) {
      const local = localStorage.getItem('payments');
      return local ? JSON.parse(local) : [];
    }
    return [];
  });

  const [categories, setCategories] = useState(() => {
    if (isMock) {
      const local = localStorage.getItem('categories');
      return local ? JSON.parse(local) : ['Alquiler', 'Servicios', 'Planillas', 'Proveedores', 'Varios'];
    }
    return ['Alquiler', 'Servicios', 'Planillas', 'Proveedores', 'Varios'];
  });

  const [loading, setLoading] = useState(!isMock);

  // Sync Mocks
  useEffect(() => {
    if (isMock) localStorage.setItem('payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    if (isMock) localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  // Escuchar Pagos de Firestore
  useEffect(() => {
    if (!user || isMock) {
      setTimeout(() => setLoading(false), 0);
      return;
    }
    const paymentsRef = collection(db, 'artifacts', appId, 'public', 'data', 'payments');
    const unsubscribe = onSnapshot(paymentsRef,
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
  const todayStr = new Date().toISOString().split('T')[0];
  
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
        createdBy: 'Local',
        createdAt: new Date().toISOString(),
        updatedBy: 'Local'
      };
      setPayments(prev => [...prev, newDoc]);
      return;
    }
    
    const paymentsRef = collection(db, 'artifacts', appId, 'public', 'data', 'payments');
    await addDoc(paymentsRef, {
      ...formData,
      amount: Number(formData.amount),
      originalAmount: Number(formData.amount),
      isPaid: false,
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
    
    if (isMock) {
      setPayments(prev => prev.map(p => p.id === payment.id ? { ...p, isPaid: isNowPaid } : p));
    } else {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'payments', payment.id);
      await updateDoc(docRef, {
        isPaid: isNowPaid,
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
        nextDate.setMonth(nextDate.getMonth() + 1);
      } else if (payment.recurrenceMode === 'custom') {
        nextDate.setDate(nextDate.getDate() + (Number(payment.recurrenceDays) || 0));
      }

      const nextDateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;

      const newPmt = {
        title: payment.title,
        amount: Number(payment.originalAmount || payment.amount),
        originalAmount: Number(payment.originalAmount || payment.amount),
        category: payment.category || 'Varios',
        recurrenceMode: payment.recurrenceMode,
        recurrenceDays: payment.recurrenceDays || 30,
        dueDate: nextDateStr,
        isPaid: false,
        voucherUrl: null
      };

      if (isMock) {
        setPayments(prev => [...prev, {
          id: Date.now().toString() + Math.floor(Math.random() * 1000),
          ...newPmt,
          createdBy: 'Sistema (Auto)',
          createdAt: new Date().toISOString(),
          updatedBy: 'Sistema (Auto)'
        }]);
      } else {
        const paymentsRef = collection(db, 'artifacts', appId, 'public', 'data', 'payments');
        addDoc(paymentsRef, {
          ...newPmt,
          createdBy: 'Sistema (Auto)',
          createdAt: serverTimestamp(),
          updatedBy: 'Sistema (Auto)'
        }).catch(err => console.error("Error clonando recurrente:", err));
      }
    }
  };

  const addPartialPayment = async (payment, inputAmount) => {
    const newPmt = {
      title: `[Abono] ${payment.title}`,
      amount: inputAmount,
      originalAmount: inputAmount,
      category: payment.category || 'Varios',
      recurrenceMode: 'none',
      dueDate: payment.dueDate,
      isPaid: true,
      voucherUrl: null
    };

    if (isMock) {
      setPayments(prev => {
        const updated = prev.map(p => p.id === payment.id ? { ...p, amount: p.amount - inputAmount, originalAmount: p.originalAmount || p.amount } : p);
        return [...updated, {
          id: Date.now().toString() + Math.random().toString().slice(2,5),
          ...newPmt,
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
        addDoc(paymentsRef, { ...newPmt, createdBy: user.email || user.uid, createdAt: serverTimestamp(), updatedBy: user.email || user.uid })
      ]);
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
    addPartialPayment,
    attachVoucher
  };
}
