/**
 * useRole — Hook de Permisos por Rol
 *
 * Roles disponibles:
 *  - 'admin'    → Acceso total (crear, editar, eliminar, marcar pagado)
 *  - 'empleado' → Solo ver, crear pagos y marcar pagado (NO eliminar)
 */
export function useRole(role, isExpired = false, plan = 'trial') {
  const isAdmin = role === 'admin';

  return {
    // Permisos específicos (bloqueados en modo lectura si expiró)
    canDelete:         !isExpired && isAdmin,
    canCreate:         !isExpired && (isAdmin || role === 'empleado'),
    canEdit:           !isExpired && (isAdmin || role === 'empleado'),
    canMarkPaid:       !isExpired && (isAdmin || role === 'empleado'),
    canManageCategories: isAdmin,
    canExport:         isAdmin,
    canExportExcel:    isAdmin && plan === 'empresa',
    canFilterList:     plan === 'empresa',
    canViewRecords:    isAdmin || role === 'empleado',
    canAttachVoucher:  !isExpired && isAdmin,
    canCreateEmployees: isAdmin && (plan === 'negocio' || plan === 'empresa'),

    // Permisos de cobros (bloqueados en modo lectura si expiró)
    canCreateReceivable: !isExpired && (isAdmin || role === 'empleado'),
    canDeleteReceivable: !isExpired && isAdmin,
    canMarkCollected:    !isExpired && (isAdmin || role === 'empleado'),

    // Shorthand general
    isAdmin,
    isEmpleado: role === 'empleado',
    role: role || 'sin_rol',

    // Helper para obtener etiqueta de rol en español
    roleLabel: role === 'admin' ? 'Administrador' : role === 'empleado' ? 'Empleado' : 'Sin rol',
  };
}
