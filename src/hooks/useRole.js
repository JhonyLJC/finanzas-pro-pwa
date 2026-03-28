/**
 * useRole — Hook de Permisos por Rol
 *
 * Roles disponibles:
 *  - 'admin'    → Acceso total (crear, editar, eliminar, marcar pagado)
 *  - 'empleado' → Solo ver, crear pagos y marcar pagado (NO eliminar)
 */
export function useRole(role) {
  const isAdmin = role === 'admin';

  return {
    // Permisos específicos
    canDelete:         isAdmin,
    canCreate:         isAdmin || role === 'empleado',
    canMarkPaid:       isAdmin || role === 'empleado',
    canManageCategories: isAdmin,
    canExport:         isAdmin,
    canViewRecords:    isAdmin || role === 'empleado',
    canAttachVoucher:  isAdmin,

    // Shorthand general
    isAdmin,
    isEmpleado: role === 'empleado',
    role: role || 'sin_rol',

    // Helper para obtener etiqueta de rol en español
    roleLabel: role === 'admin' ? 'Administrador' : role === 'empleado' ? 'Empleado' : 'Sin rol',
  };
}
