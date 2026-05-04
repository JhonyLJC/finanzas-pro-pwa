import { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  browserLocalPersistence,
  setPersistence,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, isMock } from '../lib/firebase';

export function useAuth() {
  const [user, setUser] = useState(undefined);
  const [role, setRole] = useState(null); // 'admin' | 'admin_secundario' | 'empleado' | 'contador'
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

            let actualData = data;
            // Si el rol NO es admin principal y tiene un tenantId diferente, sincronizamos la suscripción del dueño
            const isMemberRole = ['admin_secundario', 'empleado', 'contador'].includes(data.role);
            if (isMemberRole && data.tenantId && data.tenantId !== firebaseUser.uid) {
              try {
                const adminDoc = await getDoc(doc(db, 'users', data.tenantId));
                if (adminDoc.exists()) {
                  const adminData = adminDoc.data();
                  // Forzamos a usar el límite y plan del dueño
                  actualData = { ...data, currentPeriodEnd: adminData.currentPeriodEnd, plan: adminData.plan };
                }
              } catch (e) {
                console.error("No se pudo obtener datos del Admin", e);
              }
            }

            if (actualData.currentPeriodEnd) {
                const end = new Date(actualData.currentPeriodEnd);
                setSubscription({ currentPeriodEnd: actualData.currentPeriodEnd, isExpired: new Date() > end, plan: actualData.plan || 'trial' });
            } else {
                // Si no tiene fecha y es el dueño, le damos 14 días gratis
                if (actualData.role === 'admin') {
                   const trialEnd = new Date();
                   trialEnd.setDate(trialEnd.getDate() + 14);
                   setSubscription({ currentPeriodEnd: trialEnd.toISOString(), isExpired: false, plan: 'empresa' });
                   updateDoc(doc(db, 'users', firebaseUser.uid), { currentPeriodEnd: trialEnd.toISOString(), tenantId: currentTenantId, plan: 'empresa' }).catch(() => {});
                } else {
                   setSubscription({ currentPeriodEnd: null, isExpired: true, plan: 'trial' }); // Si un empleado no halla al dueño, asumimos expirado
                }
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
              plan: 'empresa',
              createdAt: new Date().toISOString()
            });
            setRole('admin');
            setSubscription({ currentPeriodEnd: trialEnd.toISOString(), isExpired: false, plan: 'empresa' });
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

  const sendPasswordReset = async (email) => {
    if (isMock) throw new Error('No disponible en modo local.');
    await sendPasswordResetEmail(auth, email);
  };

  const changePassword = async (currentPassword, newPassword) => {
    if (isMock) throw new Error('No disponible en modo local.');
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) throw new Error('No hay sesión activa.');
    const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
    await reauthenticateWithCredential(firebaseUser, credential);
    await updatePassword(firebaseUser, newPassword);
  };

  return { user, role, authError, authLoading, subscription, login, logout, sendPasswordReset, changePassword };
}
