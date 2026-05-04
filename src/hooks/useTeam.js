import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, query, where, getDocs, setDoc, doc, serverTimestamp, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, firebaseConfig, isMock } from '../lib/firebase';

const VALID_MEMBER_ROLES = ['admin_secundario', 'empleado', 'contador'];
const MAX_TEAM_EMPRESA   = 10;

let secondaryApp;
let secondaryAuth;
try {
  secondaryApp = initializeApp(firebaseConfig, 'Secondary');
  secondaryAuth = getAuth(secondaryApp);
} catch (e) {
  console.log("Error initializing secondary app", e);
}

export function useTeam(user, currentRole) {
  const [team, setTeam]       = useState([]);
  const [loading, setLoading] = useState(!isMock);

  useEffect(() => {
    if (!user || user.tenantId === 'local' || isMock) {
      if (isMock) {
        setTeam([
          { id: '1', email: 'secundario@local.com',  role: 'admin_secundario', createdAt: new Date().toISOString() },
          { id: '2', email: 'empleado@local.com',    role: 'empleado',         createdAt: new Date().toISOString() },
          { id: '3', email: 'contador@local.com',    role: 'contador',         createdAt: new Date().toISOString() },
        ]);
      }
      setLoading(false);
      return;
    }

    const fetchTeam = async () => {
      setLoading(true);
      try {
        const usersRef = collection(db, 'users');
        // Traer todos los integrantes del tenant (cualquier rol excepto admin principal)
        const q = query(
          usersRef,
          where('tenantId', '==', user.tenantId),
          where('role', 'in', VALID_MEMBER_ROLES)
        );
        const snapshot = await getDocs(q);
        const members  = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
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

  /**
   * Crea un miembro del equipo con el rol indicado.
   * @param {string} email
   * @param {string} password
   * @param {'admin_secundario'|'empleado'|'contador'} memberRole
   */
  const createEmployee = async (email, password, memberRole = 'empleado') => {
    const role = VALID_MEMBER_ROLES.includes(memberRole) ? memberRole : 'empleado';

    if (isMock) {
      if (team.length >= MAX_TEAM_EMPRESA)
        throw new Error(`Límite de ${MAX_TEAM_EMPRESA} integrantes alcanzado.`);
      setTeam(prev => [...prev, { id: Date.now().toString(), email, role, createdAt: new Date().toISOString() }]);
      return;
    }

    if (team.length >= MAX_TEAM_EMPRESA)
      throw new Error(`Has alcanzado el límite máximo de ${MAX_TEAM_EMPRESA} integrantes permitidos en el plan Empresa.`);

    try {
      // 1. Crear usuario en Firebase Auth (usando app secundaria para no desloguear al admin)
      const credential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      await signOut(secondaryAuth);

      const newUid = credential.user.uid;

      // 2. Calcular expiración heredada del admin dueño
      let adminPeriodEnd = null;
      try {
        const { getDoc } = await import('firebase/firestore');
        const adminSnap = await getDoc(doc(db, 'users', user.tenantId));
        if (adminSnap.exists()) adminPeriodEnd = adminSnap.data().currentPeriodEnd;
      } catch (_) {}

      // 3. Guardar en Firestore
      await setDoc(doc(db, 'users', newUid), {
        email,
        role,
        tenantId:         user.tenantId,
        createdBy:        user.email || user.uid,
        createdAt:        serverTimestamp(),
        currentPeriodEnd: adminPeriodEnd,   // sincronizado con el dueño
        plan:             'empresa',         // hereda el plan del tenant
      });

      setTeam(prev => [...prev, { id: newUid, email, role, createdAt: new Date().toISOString() }]);

    } catch (err) {
      console.error("Error al crear integrante:", err);
      if (err.code === 'auth/email-already-in-use')
        throw new Error("Este correo ya está registrado en FinanzasPro.");
      if (err.code === 'auth/weak-password')
        throw new Error("La contraseña debe tener al menos 6 caracteres.");
      throw new Error("No se pudo crear el integrante. " + err.message);
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
      throw new Error("No se pudo eliminar al integrante: " + err.message);
    }
  };

  /**
   * Cambia el rol de un integrante existente.
   */
  const changeEmployeeRole = async (employeeId, newRole) => {
    if (!VALID_MEMBER_ROLES.includes(newRole)) return;
    if (isMock) {
      setTeam(prev => prev.map(e => e.id === employeeId ? { ...e, role: newRole } : e));
      return;
    }
    try {
      await updateDoc(doc(db, 'users', employeeId), { role: newRole });
      setTeam(prev => prev.map(e => e.id === employeeId ? { ...e, role: newRole } : e));
    } catch (err) {
      throw new Error("No se pudo cambiar el rol: " + err.message);
    }
  };

  return { team, loading, createEmployee, deleteEmployee, changeEmployeeRole, maxTeam: MAX_TEAM_EMPRESA };
}
