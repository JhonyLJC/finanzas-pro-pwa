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

    // ─── Helpers ─────────────────────────────────────────────────────────
    function isAuth() {
      return request.auth != null;
    }

    function userData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }

    function userRole() {
      return userData().role;
    }

    function userTenantId() {
      // fallback: el tenantId del usuario, o su propio uid si no tiene
      let data = userData();
      return data.keys().hasAny(['tenantId']) ? data.tenantId : request.auth.uid;
    }

    function isAdmin() {
      return isAuth() && userRole() == 'admin';
    }

    function isEmpleado() {
      return isAuth() && (userRole() == 'empleado' || userRole() == 'admin');
    }

    function ownTenant(docTenantId) {
      return docTenantId == userTenantId() || docTenantId == request.auth.uid;
    }

    // ─── Colección de Usuarios ────────────────────────────────────────────
    match /users/{userId} {
      allow read: if isAuth();
      allow create: if isAuth() && (request.auth.uid == userId || isAdmin());
      allow update: if isAuth() && (request.auth.uid == userId || isAdmin());
      allow delete: if isAdmin();
    }

    // ─── Pagos ────────────────────────────────────────────────────────────
    match /artifacts/{appId}/public/data/payments/{paymentId} {
      allow read:   if isEmpleado() && ownTenant(resource.data.tenantId);
      allow create: if isEmpleado() && ownTenant(request.resource.data.tenantId);
      allow update: if isEmpleado() && ownTenant(resource.data.tenantId);
      allow delete: if isAdmin() && ownTenant(resource.data.tenantId);
    }

    // ─── Cobros (Receivables) ─────────────────────────────────────────────
    match /artifacts/{appId}/public/data/receivables/{receivableId} {
      allow read:   if isEmpleado() && ownTenant(resource.data.tenantId);
      allow create: if isEmpleado() && ownTenant(request.resource.data.tenantId);
      allow update: if isEmpleado() && ownTenant(resource.data.tenantId);
      allow delete: if isAdmin() && ownTenant(resource.data.tenantId);
    }

    // ─── Todo lo demás bloqueado ──────────────────────────────────────────
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
