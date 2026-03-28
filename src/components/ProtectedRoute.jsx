import React from 'react';
import LoginPage from './LoginPage';

/**
 * ProtectedRoute: Si el usuario no está autenticado, muestra el Login.
 * Si está cargando la sesión, muestra un spinner.
 * Si está autenticado, renderiza los hijos normalmente.
 */
export default function ProtectedRoute({ user, onLogin, authError, authLoading, children }) {
  // user === undefined → todavía verificando sesión con Firebase
  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
      </div>
    );
  }

  // user === null → no hay sesión activa
  if (user === null) {
    return (
      <LoginPage
        onLogin={onLogin}
        authError={authError}
        authLoading={authLoading}
      />
    );
  }

  // user existe → autenticado, mostrar app
  return children;
}
