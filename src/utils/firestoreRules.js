/**
 * REGLAS DE FIRESTORE — COPIAR Y PEGAR EN FIREBASE CONSOLE
 *
 * Cómo acceder:
 * 1. Firebase Console → tu proyecto → "Firestore Database"
 * 2. Pestaña "Reglas"
 * 3. Reemplazar el contenido con estas reglas
 * 4. Clic en "Publicar"
 *
 * IMPORTANTE: Primero asegúrate de que tus usuarios tengan
 * el campo `role` en la colección `users/{uid}`.
 */

export const firestoreRules = `
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // ─── Función para verificar autenticación ─────────────────────────
    function isAuthenticated() {
      return request.auth != null;
    }

    // ─── Función para obtener el rol del usuario autenticado ──────────
    function userRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }

    function isAdmin() {
      return isAuthenticated() && userRole() == 'admin';
    }

    function isEmpleado() {
      return isAuthenticated() && (userRole() == 'empleado' || userRole() == 'admin');
    }

    // ─── Colección de Usuarios ────────────────────────────────────────
    match /users/{userId} {
      // Solo el propio usuario puede leer su perfil, solo admins pueden escribir roles
      allow read: if isAuthenticated() && request.auth.uid == userId;
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // ─── Colección de Pagos ───────────────────────────────────────────
    match /artifacts/{appId}/public/data/payments/{paymentId} {
      // Leer: cualquier empleado autenticado
      allow read: if isEmpleado();

      // Crear: empleados y admins (empleados pueden crear pagos)
      allow create: if isEmpleado();

      // Actualizar: empleados pueden marcar como pagado, admins editan todo
      allow update: if isEmpleado();

      // Eliminar: SOLO admins
      allow delete: if isAdmin();
    }

    // ─── Bloquear todo lo demás por defecto ──────────────────────────
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
`;

// Solo para console.log de referencia en desarrollo
if (import.meta.env.DEV) {
  console.info('[Firestore Rules] Copia las reglas desde src/utils/firestoreRules.js hacia Firebase Console.');
}
