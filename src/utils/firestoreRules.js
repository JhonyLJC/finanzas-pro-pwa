/**
 * REGLAS DE FIRESTORE — COPIAR Y PEGAR EN FIREBASE CONSOLE
 *
 * Cómo acceder:
 * 1. Firebase Console → tu proyecto → "Firestore Database"
 * 2. Pestaña "Reglas"
 * 3. Reemplazar el contenido con estas reglas
 * 4. Clic en "Publicar"
 *
 * NOTA TÉCNICA: La app guarda los datos en:
 *   /artifacts/{projectId}/public/data/payments/{id}
 *   /artifacts/{projectId}/public/data/receivables/{id}
 * El {appId} en las reglas captura CUALQUIER valor de ese segmento.
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

    function ownTenant(tenantId) {
      return tenantId == userTenantId();
    }

    // ─── Colección: Users ────────────────────────────────────────────────
    // Cualquier usuario autenticado puede leer (necesario para sincronizar
    // la suscripción de empleados/contadores con su admin dueño)
    match /users/{userId} {
      allow read:   if isAuth();
      allow create: if isAdmin();
      allow update: if isAuth() && (request.auth.uid == userId || isAdmin());
      allow delete: if isAdmin();
    }

    // ─── Pagos y Cobros ───────────────────────────────────────────────────
    // La ruta real es: /artifacts/{appId}/public/data/{collection}/{docId}
    // {appId} coincide con firebaseConfig.projectId en la app
    match /artifacts/{appId}/public/data/payments/{docId} {
      allow read:   if (isAnyAdmin() || isEmpleado() || isContador())
                    && ownTenant(resource.data.tenantId);
      allow create: if (isAnyAdmin() || isEmpleado())
                    && ownTenant(request.resource.data.tenantId);
      allow update: if (isAnyAdmin() || isEmpleado())
                    && ownTenant(resource.data.tenantId);
      allow delete: if isAnyAdmin()
                    && ownTenant(resource.data.tenantId);
    }

    match /artifacts/{appId}/public/data/receivables/{docId} {
      allow read:   if (isAnyAdmin() || isEmpleado() || isContador())
                    && ownTenant(resource.data.tenantId);
      allow create: if (isAnyAdmin() || isEmpleado())
                    && ownTenant(request.resource.data.tenantId);
      allow update: if (isAnyAdmin() || isEmpleado())
                    && ownTenant(resource.data.tenantId);
      allow delete: if isAnyAdmin()
                    && ownTenant(resource.data.tenantId);
    }

    // ─── Nodos intermedios (public/data) — solo lectura de estructura ─────
    match /artifacts/{appId}/public/data/{document=**} {
      allow read: if isAuth();
    }

    // ─── Todo lo demás bloqueado ──────────────────────────────────────────
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
`;
