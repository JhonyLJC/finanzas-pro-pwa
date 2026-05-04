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

    function isAnyAdmin() {
      return isAuth() && (userRole() == 'admin' || userRole() == 'admin_secundario');
    }

    function isEmpleado() {
      return isAuth() && userRole() == 'empleado';
    }

    function isContador() {
      return isAuth() && userRole() == 'contador';
    }

    function ownTenant(docTenantId) {
      return docTenantId == userTenantId();
    }

    // ─── Colección: Users ────────────────────────────────────────────────
    match /users/{userId} {
      allow read: if isAuth();
      // Solo el Admin principal puede crear/borrar integrantes
      allow create, delete: if isAdmin();
      // El propio usuario puede editarse, o el admin
      allow update: if isAuth() && (request.auth.uid == userId || isAdmin());
    }

    // ─── Pagos ────────────────────────────────────────────────────────────
    match /payments/{paymentId} {
      allow read:   if (isAnyAdmin() || isEmpleado() || isContador()) && ownTenant(resource.data.tenantId);
      allow create: if (isAnyAdmin() || isEmpleado()) && ownTenant(request.resource.data.tenantId);
      allow update: if (isAnyAdmin() || isEmpleado()) && ownTenant(resource.data.tenantId);
      allow delete: if isAnyAdmin() && ownTenant(resource.data.tenantId);
    }

    // ─── Cobros (Receivables) ─────────────────────────────────────────────
    match /receivables/{receivableId} {
      allow read:   if (isAnyAdmin() || isEmpleado() || isContador()) && ownTenant(resource.data.tenantId);
      allow create: if (isAnyAdmin() || isEmpleado()) && ownTenant(request.resource.data.tenantId);
      allow update: if (isAnyAdmin() || isEmpleado()) && ownTenant(resource.data.tenantId);
      allow delete: if isAnyAdmin() && ownTenant(resource.data.tenantId);
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
