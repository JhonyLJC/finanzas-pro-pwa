import { useState, useEffect, useMemo } from 'react';
import { collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { db, appId, isMock } from '../lib/firebase';

export function useReceivables(user) {
  const [receivables, setReceivables] = useState(() => {
    if (isMock) {
      const local = localStorage.getItem('finanzaspro_receivables');
      return local ? JSON.parse(local) : [];
    }
    return [];
  });

  const [loading, setLoading] = useState(!isMock);

  const getCategoriesKey = () => `finanzaspro_receivable_categories_${user?.tenantId || user?.uid || 'local'}`;

  const [categories, setCategories] = useState(() => {
    try {
      const stored = localStorage.getItem(getCategoriesKey());
      return stored ? JSON.parse(stored) : ['Alquiler', 'Inversion', 'Ventas', 'Servicios', 'Sueldo', 'Otros'];
    } catch { return ['Alquiler', 'Inversion', 'Ventas', 'Servicios', 'Sueldo', 'Otros']; }
  });

  useEffect(() => {
    const key = getCategoriesKey();
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        setCategories(JSON.parse(stored));
      } else {
        setCategories(['Alquiler', 'Inversion', 'Ventas', 'Servicios', 'Sueldo', 'Otros']);
      }
    } catch {
      setCategories(['Alquiler', 'Inversion', 'Ventas', 'Servicios', 'Sueldo', 'Otros']);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(getCategoriesKey(), JSON.stringify(categories));
  }, [categories, user]);

  // Sync Mocks
  useEffect(() => {
    if (isMock) localStorage.setItem('finanzaspro_receivables', JSON.stringify(receivables));
  }, [receivables]);

  // Escuchar Cobros de Firestore
  useEffect(() => {
    if (!user || isMock) {
      setTimeout(() => setLoading(false), 0);
      return;
    }
    const receivablesRef = collection(db, 'artifacts', appId, 'public', 'data', 'receivables');
    const tenantId = user.tenantId || user.uid;
    const q = query(receivablesRef, where('tenantId', '==', tenantId));
    
    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setReceivables(data);
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
  
  const todayOnlyReceivables = useMemo(() => {
    return receivables.filter(r => r.dueDate === todayStr && !r.isCollected);
  }, [receivables, todayStr]);

  const overdueReceivables = useMemo(() => {
    return receivables.filter(r => r.dueDate < todayStr && !r.isCollected).sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [receivables, todayStr]);

  const stats = useMemo(() => {
    const calc = () => {
      const total = receivables.reduce((acc, r) => acc + Number(r.amount), 0);
      const collected = receivables.filter(r => r.isCollected).reduce((acc, r) => acc + Number(r.amount), 0);
      const pending = total - collected;
      const progress = total > 0 ? (collected / total) * 100 : 0;
      return { total, collected, pending, progress };
    };
    return { PEN: calc() };
  }, [receivables]);



  // CRUD base
  const addReceivable = async (formData) => {
    if (isMock) {
      const newDoc = {
        id: Date.now().toString(),
        ...formData,
        amount: Number(formData.amount),
        originalAmount: Number(formData.amount),
        isCollected: false,
        tenantId: user.tenantId || 'local',
        createdBy: 'Local',
        createdAt: new Date().toISOString(),
        updatedBy: 'Local'
      };
      setReceivables(prev => [...prev, newDoc]);
      return;
    }
    
    const tenantId = user.tenantId || user.uid;
    if (!tenantId) throw new Error('Usuario no identificado. Cierra sesión e ingresa nuevamente.');

    const receivablesRef = collection(db, 'artifacts', appId, 'public', 'data', 'receivables');
    await addDoc(receivablesRef, {
      ...formData,
      amount: Number(formData.amount),
      originalAmount: Number(formData.amount),
      isCollected: false,
      tenantId,
      createdBy: user.email || user.uid,
      createdAt: serverTimestamp(),
      updatedBy: user.email || user.uid
    });
  };

  const deleteReceivable = async (id) => {
    if (isMock) {
      setReceivables(prev => prev.filter(r => r.id !== id));
    } else {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'receivables', id));
    }
  };

  const toggleCollected = async (receivable) => {
    const isNowCollected = !receivable.isCollected;
    const collectedDate = isNowCollected ? new Date().toLocaleDateString('en-CA') : null;
    const completedAt = isNowCollected ? (isMock ? new Date().toISOString() : serverTimestamp()) : null;
    
    if (isMock) {
      setReceivables(prev => prev.map(r => r.id === receivable.id ? { ...r, isCollected: isNowCollected, collectedDate, completedAt } : r));
    } else {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'receivables', receivable.id);
      await updateDoc(docRef, {
        isCollected: isNowCollected,
        collectedDate,
        completedAt: isNowCollected ? serverTimestamp() : null,
        updatedBy: user.email || user.uid,
        updatedAt: serverTimestamp()
      });
    }

    if (isNowCollected && receivable.recurrenceMode && receivable.recurrenceMode !== 'none') {
      const [y, m, d] = receivable.dueDate.split('-');
      const nextDate = new Date(y, m - 1, d);
      
      if (receivable.recurrenceMode === 'weekly') {
        nextDate.setDate(nextDate.getDate() + 7);
      } else if (receivable.recurrenceMode === 'biweekly') {
        nextDate.setDate(nextDate.getDate() + 15);
      } else if (receivable.recurrenceMode === 'monthly') {
        const originalDay = nextDate.getDate();
        nextDate.setMonth(nextDate.getMonth() + 1);
        if (nextDate.getDate() !== originalDay) {
           nextDate.setDate(0); // Clamps to the last day of the target month
        }
      } else if (receivable.recurrenceMode === 'custom') {
        nextDate.setDate(nextDate.getDate() + (Number(receivable.recurrenceDays) || 0));
      }

      const nextDateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;

      const newRec = {
        title: receivable.title,
        category: receivable.category || 'Otros',
        amount: Number(receivable.originalAmount || receivable.amount),
        originalAmount: Number(receivable.originalAmount || receivable.amount),
        recurrenceMode: receivable.recurrenceMode,
        recurrenceDays: receivable.recurrenceDays || 30,
        dueDate: nextDateStr,
        isCollected: false,
        priority: receivable.priority || 'NORMAL',
        note: receivable.note || '',
        tenantId: receivable.tenantId || user?.tenantId || 'local',
        voucherUrl: null
      };

      if (isMock) {
        setReceivables(prev => [...prev, {
          id: Date.now().toString() + Math.floor(Math.random() * 1000),
          ...newRec,
          createdBy: 'Sistema (Auto)',
          createdAt: new Date().toISOString(),
          updatedBy: 'Sistema (Auto)'
        }]);
      } else {
        const receivablesRef = collection(db, 'artifacts', appId, 'public', 'data', 'receivables');
        addDoc(receivablesRef, {
          ...newRec,
          createdBy: 'Sistema (Auto)',
          createdAt: serverTimestamp(),
          updatedBy: 'Sistema (Auto)'
        }).catch(err => console.error("Error clonando recurrente:", err));
      }
    }
  };

  const addPartialReceivable = async (receivable, inputAmount) => {
    const newRec = {
      title: `[Abono] ${receivable.title}`,
      category: receivable.category || 'Otros',
      amount: inputAmount,
      originalAmount: inputAmount,
      recurrenceMode: 'none',
      dueDate: receivable.dueDate,
      isCollected: true,
      collectedDate: new Date().toLocaleDateString('en-CA'),
      tenantId: receivable.tenantId || user?.tenantId || 'local',
      voucherUrl: null
    };
    const remaining = receivable.amount - inputAmount;

    if (isMock) {
      setReceivables(prev => {
        const updated = prev.map(r => r.id === receivable.id ? { ...r, amount: remaining, originalAmount: remaining } : r);
        return [...updated, {
          id: Date.now().toString() + Math.random().toString().slice(2,5),
          ...newRec,
          createdBy: 'Local (Abono)',
          createdAt: new Date().toISOString(),
          updatedBy: 'Local (Abono)'
        }];
      });
    } else {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'receivables', receivable.id);
      const receivablesRef = collection(db, 'artifacts', appId, 'public', 'data', 'receivables');
      await Promise.all([
        updateDoc(docRef, { amount: remaining, originalAmount: remaining, updatedAt: serverTimestamp() }),
        addDoc(receivablesRef, { ...newRec, createdBy: user.email || user.uid, createdAt: serverTimestamp(), updatedBy: user.email || user.uid })
      ]);
    }
  };

  const editReceivable = async (id, fields) => {
    if (isMock) {
      setReceivables(prev => prev.map(r => r.id === id ? { ...r, ...fields, updatedBy: 'Local' } : r));
    } else {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'receivables', id);
      await updateDoc(docRef, { ...fields, updatedBy: user.email || user.uid, updatedAt: serverTimestamp() });
    }
  };

  const attachVoucher = async (receivable, voucherUrl) => {
    if (!voucherUrl) return;
    if (isMock) {
      setReceivables(prev => prev.map(r => r.id === receivable.id ? { ...r, voucherUrl } : r));
    } else {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'receivables', receivable.id);
      await updateDoc(docRef, { voucherUrl, updatedAt: serverTimestamp() });
    }
  };

  return {
    receivables,
    loading,
    todayOnlyReceivables,
    overdueReceivables,
    stats,
    receivableCategories: categories,
    setReceivableCategories: setCategories,
    addReceivable,
    deleteReceivable,
    toggleCollected,
    editReceivable,
    addPartialReceivable,
    attachVoucher
  };
}
