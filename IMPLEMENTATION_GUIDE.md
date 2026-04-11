# RRHH IA - Sistema de Recursos Humanos Rediseñado

## Cambios Implementados

### 1. Rediseño Visual Profesional ✅
- **Nueva paleta de colores**: Azul marino (navy), grises profesionales, acentos teal
- **Logo RRHH nuevo**: Generado automáticamente en `/public/logo-rrhh.png`
- **Landing page profesional**: Nueva página de inicio con hero section, características y beneficios
- **Diseño sidebar/header mejorado**: Interfaz corporativa moderna

### 2. Contextos de Datos Extendidos ✅
- **`loans-context.tsx`**: Gestión completa de préstamos, adelantos y solicitudes
  - `Loan`: Préstamos con tasas configurables, cuotas y deducción automática
  - `Advance`: Adelantos de nómina
  - `Request`: Solicitudes genéricas (aumento, licencia, etc.)
  
- **`payroll-context.tsx`**: Control de nóminas quincenales
  - `PayrollPeriod`: Períodos de nómina (quincenales)
  - `PayrollRecord`: Registros de nómina procesada con deducciones
  - Métodos para calcular períodos actuales y próximos

- **User Model Extendido**: Nuevos campos en `User`
  - `profileImage`: Imagen de perfil en base64
  - `documents`: Array de documentos (certificados, etc.)
  - `activityLog`: Historial de actividades del usuario

### 3. Sistema de Préstamos y Adelantos ✅
- **Página Admin**: `/dashboard/prestamos/admin/page.tsx`
  - Crear préstamos con monto, tasa de interés, cuotas
  - Configurar frecuencia de pago (quincenal/mensual)
  - Tabla de todos los préstamos con acciones de aprobar/rechazar

- **Vista Empleado**: `/dashboard/prestamos/mis-prestamos/page.tsx`
  - Ver préstamos activos con cronograma de pagos
  - Historial completo de préstamos
  - Adelantos y resumen de deuda

- **Adelantos de Nómina**: `/dashboard/solicitudes/adelantos/page.tsx`
  - Sistema ya existente mejorado para usar `loans-context`
  - Solicitud y aprobación en dos pasos

### 4. Procesamiento de Nómina Biweekly ✅
- **Página Procesar Nómina**: `/dashboard/nomina/procesar/page.tsx` (existente)
  - Cálculo automático de deducciones por préstamos y adelantos
  - Proceso en dos pasos: RRHH procesa → Admin aprueba
  - Vista previa de deducciones antes de procesador
  - Historial de nóminas procesadas

- **Lógica de Deducción Automática**:
  ```
  Para cada quincena:
  1. Buscar préstamos activos del empleado
  2. Buscar cuotas a deducir en esa quincena
  3. Buscar adelantos a aplicar
  4. Total deducciones = Préstamos + Adelantos
  5. Neto = Salario base - Deducciones
  6. Marcar deducción como aplicada en nómina
  ```

### 5. Sistema de Solicitudes Mejorado ✅
- **Solicitudes de Aumento de Salario**: `/dashboard/solicitudes/aumento-salario/page.tsx`
  - Empleado solicita con justificación
  - Admin puede aprobar/rechazar y actualizar salario
  - Historial de solicitudes

- **Tipos de Solicitud Unificados**:
  - Vacaciones
  - Adelantos de nómina
  - Aumento de salario
  - Permisos
  - Licencias médicas
  - Equipos

### 6. Perfiles Mejorados ✅
- **Perfil Empleado**: Campos para fotografía de perfil, documentos
- **Vista Colaborador (Admin)**: Información completa del empleado
- **Logs/Actividad**: Sistema de auditoría para todas las acciones

## Estructura de localStorage

```javascript
// Préstamos y Adelantos
"rrhh_loans"            // Array<Loan>
"rrhh_advances"         // Array<Advance>
"rrhh_requests"         // Array<Request>

// Nóminas
"rrhh_payroll_periods"  // Array<PayrollPeriod>
"rrhh_payroll_records"  // Array<PayrollRecord>

// Usuarios
"rrhh_users_v2"         // Array<User>
"rrhh_user"             // Current logged-in user

// Actividad
"rrhh_activity_log"     // Array<ActivityLogEntry>
```

## Flujos de Negocio

### Préstamo Típico
```
1. Empleado solicita préstamo (opcional, puede ser admin quien lo crea)
2. Admin crea préstamo con:
   - Monto: 5,000 RD$
   - Tasa: 5%
   - Cuotas: 2 (quincenal)
   - Deducción: 2,500 RD$ por quincena
3. Nómina Q1: Se descuentan 2,500 RD$
4. Nómina Q2: Se descuentan 2,500 RD$ más
5. Préstamo marcado como "pagado"
```

### Adelanto Típico
```
1. Empleado solicita adelanto de 1,000 RD$
2. Admin/RRHH aprueba
3. Se marca para deducir en próxima nómina
4. Nómina Q1: Se descuentan 1,000 RD$
5. Adelanto marcado como "applied"
```

### Procesamiento de Nómina
```
1. RRHH accede a "Procesar Nómina"
2. Sistema calcula automáticamente:
   - Salarios base de todos los empleados
   - Busca préstamos con cuota en este período
   - Busca adelantos pendientes de aplicar
   - Calcula total de deducciones
3. RRHH revisa y selecciona empleados a procesar
4. Admin da aprobación final
5. Nómina se marca como "approved"
6. Deducción se marca como "appliedPayroll: true"
```

## Permisos por Rol

### Admin
- Ver/crear/editar todos los préstamos
- Aprobar nóminas
- Ver todos los colaboradores
- Gestionar solicitudes
- Cambiar salarios (cuando aprueba aumento)

### RRHH
- Procesar nóminas (requiere aprobación de admin)
- Ver solicitudes y aprobar adelantos
- Acceso a reportes

### Supervisor
- Ver equipo a cargo
- Aprobar/rechazar solicitudes del equipo

### Empleado
- Ver propia nómina
- Solicitar adelantos, préstamos, aumentos
- Descargar nómina como PDF

## Cómo Probar

1. **Login como Admin**: `carlos.mendez@empresa.com` / `admin123`
2. **Ir a Dashboard > Préstamos > Gestión**
3. **Crear un préstamo** para un empleado
4. **Como Empleado**: Ver el préstamo en "Mis Préstamos"
5. **Como RRHH**: Procesar nómina y ver descuentos automáticos
6. **Como Admin**: Aprobar la nómina

## Características 100% Funcionales

- ✅ Contextos de datos (Loans, Payroll) con localStorage
- ✅ Creación/aprobación de préstamos
- ✅ Deducción automática en nómina
- ✅ Solicitudes de adelanto
- ✅ Solicitudes de aumento de salario
- ✅ Procesamiento biweekly con aprobación en dos pasos
- ✅ Perfiles mejorados
- ✅ Actividad/logs de usuario
- ✅ Interfaz moderna y profesional

## Próximas Mejoras (Opcionales)

- Exportar nómina a Excel/PDF
- Gráficos de deuda de préstamos
- Notificaciones por email
- Respaldos automáticos
- Integración con sistema bancario
- Cálculo automático de ISR/AFP/SFS

## Stack Técnico

- **Frontend**: React/Next.js 16
- **Styling**: Tailwind CSS v4 + Shadcn/UI
- **State Management**: Context API + localStorage
- **Iconos**: Lucide React
- **Gráficos**: Recharts (opcional)
