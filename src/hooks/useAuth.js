import { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, isMock } from '../lib/firebase';

export function useAuth() {
  const [user, setUser] = useState(undefined);
  const [role, setRole] = useState(null); // 'admin' | 'empleado'
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [subscription, setSubscription] = useState({ currentPeriodEnd: null, isExpired: false, plan: 'trial' });

  useEffect(() => {
    if (isMock) {
      setUser({ email: 'dueño@local.com', uid: 'local', tenantId: 'local', displayName: 'Administrador Local' });
      setRole('admin');
      const mockSubEnd = new Date();
      mockSubEnd.setDate(mockSubEnd.getDate() + 30);
      setSubscription({ currentPeriodEnd: mockSubEnd.toISOString(), isExpired: false, plan: 'empresa' });
      return;
    }

    setPersistence(auth, browserLocalPersistence).catch(console.error);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Buscar data de usuario y tenant en Firestore: /users/{uid}
        let currentTenantId = firebaseUser.uid; // Por defecto el mismo

        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setRole(data.role || 'empleado');
            if (data.tenantId) currentTenantId = data.tenantId;

            if (data.currentPeriodEnd) {
                const end = new Date(data.currentPeriodEnd);
                setSubscription({ currentPeriodEnd: data.currentPeriodEnd, isExpired: new Date() > end, plan: data.plan || 'trial' });
            } else {
                // Si no tiene fecha, le damos 14 días gratis
                const trialEnd = new Date();
                trialEnd.setDate(trialEnd.getDate() + 14);
                setSubscription({ currentPeriodEnd: trialEnd.toISOString(), isExpired: false, plan: 'trial' });
                updateDoc(doc(db, 'users', firebaseUser.uid), { currentPeriodEnd: trialEnd.toISOString(), tenantId: currentTenantId, plan: 'trial' }).catch(() => {});
            }
          } else {
            // Primera vez que inicia sesión → crear documento como dueño (tenant propio)
            const trialEnd = new Date();
            trialEnd.setDate(trialEnd.getDate() + 14);
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              email: firebaseUser.email,
              role: 'admin',
              tenantId: currentTenantId,
              currentPeriodEnd: trialEnd.toISOString(),
              plan: 'trial',
              createdAt: new Date().toISOString()
            });
            setRole('admin');
            setSubscription({ currentPeriodEnd: trialEnd.toISOString(), isExpired: false, plan: 'trial' });
          }
        } catch {
          setRole('empleado'); // fallback seguro
          setSubscription({ currentPeriodEnd: null, isExpired: false, plan: 'trial' });
        }
        
        // Crear objeto usuario limpio con tenantId incluido
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          tenantId: currentTenantId,
        });
      } else {
        setUser(null);
        setRole(null);
        setSubscription({ currentPeriodEnd: null, isExpired: false });
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setAuthError('');
    setAuthLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const messages = {
        'auth/user-not-found': 'Usuario no encontrado.',
        'auth/wrong-password': 'Contraseña incorrecta.',
        'auth/invalid-email': 'Email inválido.',
        'auth/invalid-credential': 'Email o contraseña incorrectos.',
        'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos.',
      };
      setAuthError(messages[err.code] || 'Error al iniciar sesión. Intenta de nuevo.');
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    if (isMock) return;
    await firebaseSignOut(auth);
    setUser(null);
    setRole(null);
  };

  return { user, role, authError, authLoading, subscription, login, logout };
}
