import { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isMock } from '../lib/firebase';

export function useAuth() {
  const [user, setUser] = useState(undefined);
  const [role, setRole] = useState(null); // 'admin' | 'empleado'
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (isMock) {
      setUser({ email: 'dueño@local.com', uid: 'local', displayName: 'Administrador Local' });
      setRole('admin');
      return;
    }

    setPersistence(auth, browserLocalPersistence).catch(console.error);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Buscar rol en Firestore: /users/{uid}
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role || 'empleado');
          } else {
            // Primera vez que inicia sesión → crear documento con rol empleado por defecto
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              email: firebaseUser.email,
              role: 'empleado',
              createdAt: new Date().toISOString()
            });
            setRole('empleado');
          }
        } catch {
          setRole('empleado'); // fallback seguro
        }
        setUser(firebaseUser);
      } else {
        setUser(null);
        setRole(null);
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

  return { user, role, authError, authLoading, login, logout };
}
