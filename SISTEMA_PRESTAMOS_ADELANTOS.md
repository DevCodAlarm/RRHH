# Sistema de Préstamos y Adelantos de Nómina (LocalStorage)

## Descripción General

Sistema completo de gestión de préstamos y adelantos de nómina implementado en **localStorage**, con flujo de múltiples roles y descuentos quincenales automáticos.

---

## Flujo de Préstamos

### 1️⃣ Solicitud del Empleado
**Ubicación:** `/dashboard/prestamos`
- El empleado solo ingresa el **monto solicitado**
- Sin detalles de interés o cuotas
- Estado: `pending`

### 2️⃣ Aprobación del Admin/RRHH
**Ubicación:** `/dashboard/admin/prestamos-solicitudes`
- Admin revisa la solicitud
- Configura:
  - **Tasa de Interés** (%)
  - **Número de Quincenas** para descontar (1, 2, 3, 4, 6, 8, 12)
- El sistema calcula:
  - Monto total (con interés)
  - Cuota quincenal = Total ÷ Número de Quincenas
  - **Calendario de Descuentos** automático (deductionSchedule)

**Estados:**
- `pending` → `approved` (configurado)
- `approved` → `active` (activado para descontar)

### 3️⃣ Procesamiento en Nómina
**Ubicación:** `/dashboard/nomina/procesar`
- Cada quincena se procesa y se aplica el descuento programado
- El sistema busca en `deductionSchedule[periodoKey]`
- Descuenta automáticamente
- Actualiza el balance
- Cuando balance = 0, estado → `completed`

### 4️⃣ Estados del Préstamo
```
pending → approved → active → completed
                   ↓
                 rejected
```

---

## Flujo de Adelantos

### 1️⃣ Solicitud del Empleado
**Ubicación:** `/dashboard/solicitudes/adelantos`
- Empleado ingresa monto
- Sistema calcula automáticamente la **próxima quincena**
- Se asigna `targetPeriod` automáticamente

### 2️⃣ Aprobación del Admin/RRHH
**Ubicación:** `/dashboard/solicitudes/adelantos` (vista admin)
- Admin revisa y aprueba
- Estado: `approved`

### 3️⃣ Procesamiento en Nómina
- Se descuenta en la quincena `targetPeriod`
- Estado: `processed`

### 4️⃣ Estados del Adelanto
```
pending → approved → processed
       ↓
     rejected
```

---

## Estructura de Datos (localStorage)

### HRLoan (Préstamo)
```typescript
{
  id: string
  employeeId: string
  employeeName: string
  department: string
  
  // Monto original
  requestedAmount: number
  
  // Interés y configuración
  interestRate: number (%)
  biweeklyInstallments: number (cuotas)
  
  // Cálculos
  balance: number (saldo pendiente)
  biweeklyPayment: number (cuota quincenal)
  remainingBiweekly: number (quincenas restantes)
  
  // Calendario automático
  deductionSchedule: {
    "2025-04-Q1": 500,
    "2025-04-Q2": 500,
    ...
  }
  
  // Estados
  status: "pending" | "approved" | "active" | "completed"
  
  // Fechas
  requestedAt: string (ISO)
  approvedAt?: string (ISO)
  
  // Historial de pagos
  payments?: HRLoanPayment[]
}
```

### HRRequest (Adelanto)
```typescript
{
  id: string
  employeeId: string
  employeeName: string
  type: "payroll_advance"
  
  // Monto y detalles
  amount: number
  title: string
  description: string
  
  // Quincena destino (automática)
  targetPeriod: string (ej: "2025-04-Q2")
  
  // Estados
  status: "pending" | "approved" | "processed" | "rejected"
  
  // Fechas
  createdAt: string (ISO)
  startDate: string (ISO)
  endDate: null | string (ISO)
}
```

---

## Métodos Clave del Contexto

### Préstamos

#### `addLoan(loan)`
Crea una solicitud pendiente de préstamo.
```typescript
addLoan({
  employeeId: "usr-001",
  employeeName: "Carlos Méndez",
  department: "Dirección",
  requestedAmount: 5000,
  avatar: "CM"
})
```

#### `approveLoan(loanId, interestRate, biweeklyInstallments)`
Aprueba un préstamo y genera el calendario de descuentos.
```typescript
approveLoan("loan-123", 5, 2) // 5% interés, 2 quincenas
// Calcula:
// - Total = 5000 * (1 + 0.05) = 5250
// - Cuota = 5250 / 2 = 2625 c/quincena
// - deductionSchedule = {"2025-04-Q2": 2625, "2025-05-Q1": 2625}
```

#### `updateLoanStatus(loanId, status)`
Cambia el estado (pending → approved → active → completed).

#### `settlePayrollDeductions(employeeId, periodoKey)`
Aplica el descuento del préstamo en la nómina actual.
```typescript
settlePayrollDeductions("usr-001", "2025-04-Q2")
// Busca: deductionSchedule["2025-04-Q2"]
// Resta del balance
// Si balance = 0 → status = "completed"
```

#### `getLoanDeductionForPeriod(employeeId, periodoKey)`
Obtiene el descuento del préstamo para una quincena específica.
```typescript
const deduction = getLoanDeductionForPeriod("usr-001", "2025-04-Q2")
// Retorna: 2625
```

---

### Adelantos

#### `addRequest(request)`
Crea una solicitud de adelanto.
```typescript
addRequest({
  employeeId: "usr-001",
  employeeName: "Carlos Méndez",
  type: "payroll_advance",
  amount: 2000,
  title: "Adelanto de Nómina",
  targetPeriod: "2025-04-Q2" // Automático
})
```

#### `updateRequestStatus(id, status)`
Cambia estado (pending → approved → processed).

#### `getApprovedAdvancesForPeriod(employeeId, periodoKey)`
Obtiene adelantos aprobados para una quincena.
```typescript
const advances = getApprovedAdvancesForPeriod("usr-001", "2025-04-Q2")
// Retorna: 2000
```

---

## Integración con Nómina

### Páginas Afectadas

#### `/dashboard/nomina/procesar`
En el procesamiento:
1. Itera empleados a procesar
2. Para cada quincena:
   - Obtiene descuentos del préstamo: `getLoanDeductionForPeriod(empId, periodoKey)`
   - Obtiene adelantos: `getApprovedAdvancesForPeriod(empId, periodoKey)`
   - Aplica `settlePayrollDeductions(empId, periodoKey)`
3. Sincroniza el contexto
4. Recalcula nómina con descuentos actualizados

#### Estado de Nómina
- **Con Deuda Activa:** Muestra descuentos de préstamos/adelantos programados
- **Limpia:** Una vez el préstamo está `completed`, no hay descuentos

---

## Flujo de Datos (Ejemplo Completo)

### Día 1: Solicitud
```
Carlos solicita RD$ 5,000 en /dashboard/prestamos
→ Se crea HRLoan con status="pending"
→ StorageKey: "rrhh_prestamos_v2"
```

### Día 2: Aprobación
```
Admin en /dashboard/admin/prestamos-solicitudes
→ Selecciona: Interés 5%, 2 quincenas
→ approveLoan("loan-123", 5, 2)
→ Calcula:
  - Total = 5,250
  - Cuota = 2,625
  - deductionSchedule = {
      "2025-04-Q2": 2625,
      "2025-05-Q1": 2625
    }
→ Status = "approved"
→ Admin activa: updateLoanStatus("loan-123", "active")
```

### Día 15 (Quincena Q2): Procesamiento
```
Admin en /dashboard/nomina/procesar
→ Selecciona empleados
→ Procesa nómina
→ Para Carlos:
  - Descuento = deductionSchedule["2025-04-Q2"] = 2,625
  - Nómina bruta = 2,500
  - Descuentos = 2,625
  - Neto = -125 (o limite a 0)
→ settlePayrollDeductions("usr-001", "2025-04-Q2")
→ Balance = 5,250 - 2,625 = 2,625
→ remainingBiweekly = 1
→ Status sigue = "active"
```

### Día 1 (Q1 siguiente): Procesamiento
```
Nómina procesada nuevamente
→ Para Carlos:
  - Descuento = deductionSchedule["2025-05-Q1"] = 2,625
→ settlePayrollDeductions("usr-001", "2025-05-Q1")
→ Balance = 2,625 - 2,625 = 0
→ Status = "completed"
→ remainingBiweekly = 0
→ PRÓXIMA nómina: Sin descuentos de préstamo
```

---

## Ventajas del Sistema

✅ **Totalmente en localStorage** - No requiere backend  
✅ **Descuentos automáticos** - Calendario generado por admin  
✅ **Estados claros** - Fácil seguimiento del préstamo  
✅ **Nómina reactiva** - Se actualiza según préstamos/adelantos activos  
✅ **Sincronización** - Contexto se actualiza en tiempo real  
✅ **Flexible** - Admin controla interés y plazos  

---

## Casos de Uso Comunes

### Caso 1: Préstamo sin Interés
```typescript
approveLoan("loan-123", 0, 4) // 0% interés, 4 quincenas
// Total = Monto solicitado (sin cambios)
// Cuota = Total / 4
```

### Caso 2: Adelanto Rápido
```typescript
// Empleado solicita adelanto
// Admin aprueba (automático targetPeriod)
// Próxima nómina se descuenta y se procesa
```

### Caso 3: Múltiples Préstamos
```
Empleado puede tener:
- Préstamo 1: RD$ 3,000 en 2 quincenas
- Préstamo 2: RD$ 2,000 en 4 quincenas
- Adelanto: RD$ 1,000 para próxima quincena
→ Sistema suma todos en la quincena específica
→ Nómina muestra total de descuentos
```

---

## Testing Rápido

1. Ir a `/dashboard/prestamos` → Solicitar RD$ 5,000
2. Ir a `/dashboard/admin/prestamos-solicitudes` → Aprobar
3. Ir a `/dashboard/nomina/procesar` → Ver descuentos
4. Procesar nómina → Observar actualización de balance
5. Ir a `/dashboard/prestamos` → Ver estado "En Descuento"

---

## Storage Keys

```javascript
localStorage.getItem("rrhh_empleados_v2")        // Empleados
localStorage.getItem("rrhh_prestamos_v2")        // Préstamos
localStorage.getItem("rrhh_solicitudes_v2")      // Adelantos/Solicitudes
localStorage.getItem("rrhh_actividad_v2")        // Log de actividad
localStorage.getItem("nomina_periodos_v2")       // Historial de nóminas
```

---

## Notas Importantes

- ⚠️ Los `deductionSchedule` se generan automáticamente desde la fecha actual
- ⚠️ Una vez que un préstamo está `completed`, NO aparece en descuentos futuros
- ⚠️ Los adelantos se procesan automáticamente en su `targetPeriod`
- ⚠️ El contexto se sincroniza cada vez que se procesa nómina
- ⚠️ Los cambios en localStorage disparan un evento `storage_sync` en toda la app

---

## Próximas Mejoras Potenciales

- [ ] Reporte de préstamos por empleado
- [ ] Exportación de descuentos a Excel/CSV
- [ ] Notificaciones cuando préstamo está casi liquidado
- [ ] Historial de pagos por préstamo
- [ ] Simulador de cuotas antes de aprobar
