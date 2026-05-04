/**
 * useRole — Hook de Permisos por Rol
 *
 * Roles disponibles:
 *  - 'admin'            → Dueño. Acceso total.
 *  - 'admin_secundario' → Como admin pero sin gestión de equipo/suscripción.
 *  - 'empleado'         → Ver, crear pagos y marcar pagado. No eliminar.
 *  - 'contador'         → Solo ver registros y descargar Excel (plan empresa).
 */
export function useRole(role, isExpired = false, plan = 'trial') {
  const isAdmin        = role === 'admin';
  const isAdminSecund  = role === 'admin_secundario';
  const isEmpleado     = role === 'empleado';
  const isContador     = role === 'contador';

  // Admins (primary + secondary) comparten la mayoría de operaciones
  const isAnyAdmin = isAdmin || isAdminSecund;

  const isEmpresa = plan === 'empresa';

  return {
    // ── Pagos ──────────────────────────────────────────────────────────────
    canDelete:            !isExpired && isAnyAdmin,
    canCreate:            !isExpired && (isAnyAdmin || isEmpleado),
    canEdit:              !isExpired && (isAnyAdmin || isEmpleado),
    canMarkPaid:          !isExpired && (isAnyAdmin || isEmpleado),
    canAttachVoucher:     !isExpired && isAnyAdmin,
    canManageCategories:  isAnyAdmin,

    // ── Cobros ─────────────────────────────────────────────────────────────
    canCreateReceivable:  !isExpired && (isAnyAdmin || isEmpleado),
    canDeleteReceivable:  !isExpired && isAnyAdmin,
    canMarkCollected:     !isExpired && (isAnyAdmin || isEmpleado),

    // ── Exportación Excel — SOLO plan empresa ──────────────────────────────
    canExport:            isAnyAdmin,
    canExportExcel:       (isAnyAdmin || isContador) && isEmpresa,

    // ── Filtros / Vistas ───────────────────────────────────────────────────
    canFilterList:        isEmpresa,
    canViewRecords:       isAnyAdmin || isEmpleado || isContador,

    // ── Gestión de equipo ─ Solo admin dueño plan empresa ──────────────────
    canCreateEmployees:   isAdmin && isEmpresa,
    canManageTeam:        isAdmin && isEmpresa,

    // ── Shorthand de roles ─────────────────────────────────────────────────
    isAdmin,
    isAdminSecund,
    isEmpleado,
    isContador,
    isAnyAdmin,
    role: role || 'sin_rol',

    roleLabel: role === 'admin'
      ? 'Administrador'
      : role === 'admin_secundario'
      ? 'Admin Secundario'
      : role === 'empleado'
      ? 'Empleado'
      : role === 'contador'
      ? 'Contador'
      : 'Sin rol',
  };
}
