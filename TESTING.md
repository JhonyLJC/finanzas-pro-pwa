# Checklist de Testing — FinanzasPro V2.0

Este documento contiene un flujo estructurado para validar manualmente el correcto funcionamiento de toda la aplicación, enfocándose en cambios arquitectónicos, seguridad y flujos de negocio (`CRUD` + Suscripciones).

### 1. Testing Funcional (CRUD)
- [ ] **Crear Pago**: Agregar un pago manual, validar la aparición del Toast y la persistencia en el calendario.
- [ ] **Crear Cobro**: Agregar un cobro con información del cliente (`ReceivableFormModal`) y validar visibilidad.
- [ ] **Marcar Pagado / Cobrado**: Interactuar con los botones rápidos del Dashboard o Listas, comprobando que se actualiza el estado.
- [ ] **Abonos Parciales**: Hacer clic en un pago habilitado para agregar "abono", colocar un monto menor y validar actualización del balance pendiente.
- [ ] **Eliminación Segura**: Comprobar que botón de eliminar funciona si eres `admin`, y no se renderiza si eres `empleado`.
- [ ] **Adjunto de Comprobante**: Adjuntar URL y comprobar persistencia del campo visual.

### 2. Testing de Dashboard (Algoritmos)
- [ ] **Cálculos de Flujo**: Sumar los pagos de *HOY* y cobros de *HOY*, comprobando si la resta corresponde fielmente al **Balance Neto** mostrado en `CashFlowCard`. 
- [ ] **Resumen Mes**: Corroborar que las barras de progreso verdes y rojas coinciden en porcentaje con los montos totales del mes.
- [ ] **Orden Inteligente**: En la sección de prioridades, validar que elementos con etiqueta "VENCIDO" se listan estrictamente por encima de los que dicen "HOY".
- [ ] **DayInsights (Inteligencia)**: Cambiar artificialmente un vencimiento a -4 días y verificar que salta la alerta roja de liquidez (e.g. Danger).

### 3. Testing de Suscripciones (Bloqueo y Seguridad)
- [ ] **Modo Expired**: Modificar el documento en Firebase de la cuenta actual para setear `currentPeriodEnd` en una fecha de *2021*. Recargar la app.
  - [ ] Aparece banner rojo `⚠️ Tu período de prueba o suscripción ha finalizado.`
  - [ ] Los botones de `+` desaparecen de la interfaz.
  - [ ] La UI queda bloqueada para edición pero se puede navegar.
  - [ ] Clic en "Renovar" te lleva a los planes de WhatsApp.
- [ ] **Generación de Enlace WA**: Hacer clic en "Contactar WhatsApp" → Validar que codificó tu email y montos sin errores.
- [ ] **Panel Admin**: Ingresar manualmente como superadmin.
  - [ ] Buscar una cuenta por email.
  - [ ] Otorgar 30 días haciendo clic.
  - [ ] Validar en Console si el campo `paymentLogs` fue creado y si el `currentPeriodEnd` se actualizó en el usuario.

### 4. Testing de Entornos y Responsive
- [ ] **Modo Local (PWA offline)**: Eliminar temporalmente las `VITE_FIREBASE_API_KEY` o apagar el wifi en desarrollo. Validar que la interfaz se degrada correctamente usando el `Mock Storage`.
- [ ] **Mobile**: Revisar la visibilidad de la PWA en un ancho de 390px (iPhone).
  - [ ] `BottomNav` aparece.
  - [ ] El menú de la parte superior mantiene tamaños proporcionales.
  - [ ] Layout de las métricas (`CashFlowCard`) fluye verticalmente de manera limpia.

### 5. Testing de Seguridad en Firestore (Reglas)
- [ ] Validar que un usuario `empleado` no puede borrar pagos usando la API nativa (rechazado por ACL).
- [ ] Validar que desde un usuario estándar no haya read requests sobre la path `/paymentLogs/`, lo cual confirmaría que la protección de superadmin está operando localmente.
