import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, query, where, getDocs, setDoc, doc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db, firebaseConfig, isMock } from '../lib/firebase';

let secondaryApp;
let secondaryAuth;
try {
  secondaryApp = initializeApp(firebaseConfig, 'Secondary');
  secondaryAuth = getAuth(secondaryApp);
} catch (e) {
  console.log("Error initializing secondary app", e);
}

export function useTeam(user, currentRole) {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(!isMock);

  useEffect(() => {
    if (!user || user.tenantId === 'local' || isMock) {
        if(isMock) {
            setTeam([
                { id: '1', email: 'empleado1@local.com', role: 'empleado', createdAt: new Date().toISOString() }
            ]);
        }
        setLoading(false);
        return;
    }

    const fetchTeam = async () => {
      setLoading(true);
      try {
        const usersRef = collection(db, 'users');
        // Traer todos los empleados de este tenant
        const q = query(usersRef, where('tenantId', '==', user.tenantId), where('role', '==', 'empleado'));
        const snapshot = await getDocs(q);
        const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTeam(members);
      } catch (err) {
        console.error("Error fetching team", err);
      } finally {
        setLoading(false);
      }
    };

    if (currentRole === 'admin') {
      fetchTeam();
    } else {
        setLoading(false);
    }
  }, [user, currentRole]);

  const createEmployee = async (email, password) => {
    if (isMock) {
        if(team.length >= 4) throw new Error("Límite de empleados alcanzado (Máx. 4)");
        setTeam(prev => [...prev, { id: Date.now().toString(), email, role: 'empleado', createdAt: new Date().toISOString() }]);
        return;
    }

    if (team.length >= 4) {
      throw new Error("Has alcanzado el límite máximo de 4 empleados permitidos en tu cuenta.");
    }

    try {
      // 1. Crear el usuario en Firebase Auth (Secondary)
      const credential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      // Salir inmediatamente de la app secundaria
      await signOut(secondaryAuth);

      const newUid = credential.user.uid;

      // 2. Inscribir al empleado en la DB (usando credenciales primarias, Firestore Rules lo permite ahora)
      await setDoc(doc(db, 'users', newUid), {
        email: email,
        role: 'empleado',
        tenantId: user.tenantId,
        createdBy: user.email || user.uid,
        createdAt: serverTimestamp()
      });

      // Actualizar vista local
      setTeam(prev => [...prev, { id: newUid, email, role: 'empleado', createdAt: new Date().toISOString() }]);

    } catch (err) {
      console.error("Error al crear empleado:", err);
      if (err.code === 'auth/email-already-in-use') {
         throw new Error("Este correo ya está registrado en FinanzasPro.");
      } else if (err.code === 'auth/weak-password') {
         throw new Error("La contraseña debe tener al menos 6 caracteres.");
      }
      throw new Error("No se pudo crear el empleado. " + err.message);
    }
  };

  const deleteEmployee = async (employeeId) => {
    if (isMock) {
        setTeam(prev => prev.filter(e => e.id !== employeeId));
        return;
    }
    try {
        await deleteDoc(doc(db, 'users', employeeId));
        setTeam(prev => prev.filter(e => e.id !== employeeId));
    } catch (err) {
        throw new Error("No se pudo eliminar al empleado: " + err.message);
    }
  };

  return { team, loading, createEmployee, deleteEmployee };
}
