# Guía de Testing - Sistema de Préstamos y Adelantos

## Pasos para Probar el Sistema Completo

### 1. **Empleado Solicita Préstamo**
- Navega a: `/dashboard/prestamos`
- Click en "Solicitar Préstamo"
- Ingresa monto (ej: 5000)
- Haz click en "Solicitar"
- Abre DevTools (F12) y busca logs `[v0]` para ver el flujo
- El préstamo debe aparecer en "Solicitudes Pendientes" en esa misma página

### 2. **Ver Logs de localStorage**
- En DevTools, Console, ejecuta:
  ```javascript
  console.log(JSON.parse(localStorage.getItem('rrhh_prestamos_v2')))
  ```
- Deberías ver el préstamo con `status: "pending"`

### 3. **Admin Aprueba el Préstamo**
- Navega a: `/dashboard/admin/prestamos-solicitudes`
- Deberías ver el préstamo pendiente en "Solicitudes Pendientes"
- Click en el préstamo pendiente
- Configura:
  - Tasa de Interés: 5 (%)
  - Número de Quincenas: 2
- Click en "Aprobar"
- Verifica en DevTools logs que veas `[v0] Admin approving loan`

### 4. **Ver Cambios en localStorage**
- En DevTools, ejecuta:
  ```javascript
  JSON.parse(localStorage.getItem('rrhh_prestamos_v2'))[0]
  ```
- Deberías ver:
  - `status: "approved"`
  - `balance`: monto con interés
  - `deductionSchedule`: calendario de descuentos
  - `biweeklyPayment`: cuota calculada

### 5. **Activar Préstamo**
- En página admin, el préstamo aprobado debe tener botón "Activar"
- Click en "Activar"
- Ahora `status` debe cambiar a `"active"`

### 6. **Procesar Nómina (Verificar Descuento)**
- Navega a: `/dashboard/nomina/procesar`
- Selecciona una quincena (ej: 2025-04-Q1)
- Busca el empleado que solicitó el préstamo
- Deberías ver el descuento del préstamo en sus deducciones
- Click en "Procesar Nómina"
- Verifica en DevTools que `settlePayrollDeductions` fue llamado

### 7. **Verificar Saldo Actualizado**
- Vuelve a la página de admin
- El préstamo debe mostrar saldo reducido
- `remainingBiweekly` debe haber disminuido en 1
- Cuando `balance` llegue a 0, `status` debe cambiar a `"completed"`

### 8. **Solicitar Adelanto**
- Navega a: `/dashboard/solicitudes/adelantos`
- Ingresa monto a adelantar
- Selecciona quincena destino
- Click en "Solicitar"
- El estado debe ser "approved" automáticamente

## Debugging

Si no ves los préstamos en admin:

1. Revisa que no haya errores en DevTools Console
2. Verifica localStorage: `localStorage.getItem('rrhh_prestamos_v2')`
3. Busca logs `[v0]` en console
4. Asegúrate de estar logueado con permisos de admin

Si los descuentos no se aplican en nómina:

1. Verifica que `deductionSchedule` tenga el periodo correcto
2. El `periodoKey` en procesar debe coincidir con el del `deductionSchedule`
3. Solo se descuenta si `status === "active"`
