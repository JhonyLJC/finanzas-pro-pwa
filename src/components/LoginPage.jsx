import React, { useState } from 'react';
import { Eye, EyeOff, UserPlus, LogIn, ArrowLeft, Mail } from 'lucide-react';
import logoImg from '../assets/logo.png';
import { toast, Toaster } from 'react-hot-toast';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  setPersistence, 
  browserLocalPersistence, 
  browserSessionPersistence,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showReset, setShowReset] = useState(false);
  const [email, setEmail] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const validate = () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error('Por favor ingresa un email válido');
      return false;
    }
    if (!password || password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    try {
      const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistenceType);

      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Inicio de sesión exitoso');
      } else {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        
        // Verificar si el documento existe para no sobreescribir en caso raro
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (!userDocSnap.exists()) {
          const trialEnd = new Date();
          trialEnd.setDate(trialEnd.getDate() + 14);
          
          await setDoc(userDocRef, {
            email: user.email,
            role: 'admin',
            tenantId: user.uid,
            currentPeriodEnd: trialEnd.toISOString(),
            plan: 'empresa',
            createdAt: new Date().toISOString()
          });
        }
        
        toast.success('Cuenta creada exitosamente. ¡Bienvenido!');
      }
    } catch (err) {
      const msgs = {
        'auth/invalid-credential': 'Email o contraseña incorrectos.',
        'auth/user-not-found': 'Usuario no encontrado.',
        'auth/wrong-password': 'Contraseña incorrecta.',
        'auth/email-already-in-use': 'El correo ya está registrado.',
        'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos.'
      };
      toast.error(msgs[err.code] || 'Ocurrió un error. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!resetEmail || !/\S+@\S+\.\S+/.test(resetEmail)) {
      toast.error('Por favor ingresa un email válido');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSent(true);
      toast.success('Correo de recuperación enviado. Revisa tu bandeja.');
    } catch (err) {
      const msgs = {
        'auth/user-not-found': 'No existe una cuenta con ese correo.',
        'auth/invalid-email': 'El formato del correo no es válido.',
        'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos.'
      };
      toast.error(msgs[err.code] || 'Error al enviar el correo.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistenceType);

      const googleProvider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, googleProvider);
      
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (!userDocSnap.exists()) {
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 14);
        
        await setDoc(userDocRef, {
          email: user.email,
          role: 'admin',
          tenantId: user.uid,
          currentPeriodEnd: trialEnd.toISOString(),
          plan: 'empresa',
          createdAt: new Date().toISOString()
        });
        toast.success('Cuenta creada exitosamente. ¡Bienvenido!');
      } else {
        toast.success('Inicio de sesión exitoso');
      }
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error('Ocurrió un error con Google Login.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#1e293b',
          color: '#fff',
          borderRadius: '12px',
        }
      }} />
      
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-5 w-24 h-24 rounded-2xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.18)] flex items-center justify-center overflow-hidden p-2">
            <img src={logoImg} alt="FinanzasPro Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            FinanzasPro <span className="text-blue-400">PWA</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {showReset ? 'Recuperar contraseña' : isLogin ? 'Inicia sesión para continuar' : 'Crea tu cuenta ahora'}
          </p>
        </div>

        {/* ── FORMULARIO RECUPERAR CONTRASEÑA ── */}
        {showReset ? (
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl">
            {!resetSent ? (
              <form onSubmit={handleReset} className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <button type="button" onClick={() => { setShowReset(false); setResetEmail(''); }}
                    className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
                    <ArrowLeft size={18} />
                  </button>
                  <h2 className="text-base font-bold text-white">Recuperar contraseña</h2>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed pb-1">
                  Ingresa tu correo registrado y te enviaremos un enlace para restablecer tu contraseña.
                </p>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">Correo electrónico</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email" required autoComplete="email"
                      placeholder="correo@ejemplo.com"
                      value={resetEmail} onChange={e => setResetEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(59,130,246,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Mail size={18} /> Enviar enlace</>}
                </button>
              </form>
            ) : (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Mail size={28} className="text-emerald-400" />
                </div>
                <h2 className="text-lg font-bold text-white">Correo enviado</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Revisa tu bandeja de entrada en <strong className="text-white">{resetEmail}</strong>. El enlace expira en 1 hora.
                </p>
                <button onClick={() => { setShowReset(false); setResetSent(false); setResetEmail(''); }}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-white/10">
                  <ArrowLeft size={16} /> Volver al inicio de sesión
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl">
            {/* Toggle Tab */}
            <div className="flex bg-slate-800/50 p-1 rounded-xl mb-6">
              <button
                onClick={() => { setIsLogin(true); setEmail(''); setPassword(''); }}
                type="button"
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isLogin ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => { setIsLogin(false); setEmail(''); setPassword(''); }}
                type="button"
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isLogin ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Crear Cuenta
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/80 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner"
                />
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-slate-800/80 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {!isLogin && (
                  <p className="text-[10px] text-slate-500 mt-1.5 ml-1">Mínimo 6 caracteres.</p>
                )}
              </div>

              {/* Recordarme + Olvidaste tu contraseña */}
              {isLogin && (
                <div className="flex items-center justify-between pt-1 pb-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox" id="remember"
                      checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-slate-800/80 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                    />
                    <label htmlFor="remember" className="text-sm font-medium text-slate-400 cursor-pointer">Recordarme</label>
                  </div>
                  <button type="button" onClick={() => { setShowReset(true); setResetEmail(email); }}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors underline-offset-2 hover:underline">
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}

              {/* Botón */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(59,130,246,0.4)] hover:shadow-[0_4px_25px_rgba(59,130,246,0.6)] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
                    {isLogin ? 'Ingresar' : 'Registrarse'}
                  </>
                )}
              </button>
            </form>

            {/* Social Login Separator */}
            <div className="mt-6 flex items-center gap-3">
              <hr className="flex-1 border-white/10" />
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">O</span>
              <hr className="flex-1 border-white/10" />
            </div>

            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="mt-6 w-full py-3.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-400 border-t-slate-800 rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continuar con Google
                </>
              )}
            </button>
          </div>
        )}

        <p className="text-center text-slate-600 text-xs mt-6">
          Acceso restringido · Solo personal autorizado
        </p>
      </div>
    </div>
  );
}
