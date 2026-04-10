# 🎨 Guía Visual - Componentes Nuevos

## 📅 Calendario Inteligente

### Vista General en Dashboard
```
┌─────────────────────────────────────────────────────┬─────────────────┐
│  Calendario del Mes                                 │   Anuncios      │
│                                                     │                 │
│  ◄ Abril 2026 ►                                   │ 🔔 3 nuevos     │
│                                                     │                 │
│ Legend:                                             │ ┌───────────────┤
│ ├ Trabajado (🟢)     ├ Feriado (🟡)                 │ │ [OBLIGATORIO] │
│ ├ Nacional (🔴)      ├ Licencia (🔵)                │ │ Capacitación  │
│ ├ Pago (💜)          ├ Sin trabajar (⚪)            │ │ Viernes 5/4   │
│                                                     │ │ Marcar leído  │
│  Lun  Mar  Mié  Jue  Vie  Sáb  Dom                │ └───────────────┤
│   1    2    3    4    5    6    7  🇩🇴             │                 │
│   8    9   10   11   12   13   14                  │ ┌───────────────┤
│  15   16   17   18   19   20   21                  │ │ Baño fuera    │
│  22   23   24   25 🇩🇴 26   27   28                  │ │ de servicio   │
│  29   30                                            │ │ Marcar leído  │
│                                                     │ └───────────────┤
└─────────────────────────────────────────────────────┴─────────────────┘
```

### Vista de Día Seleccionado (Haz clic en un día)
```
┌──────────────────────────────────────────┐
│ Miércoles, 3 de abril de 2026            │
├──────────────────────────────────────────┤
│                                          │
│ Tipo de día:                             │
│ ┌────────────────────────────────────┐  │
│ │ Licencia                           │  │
│ └────────────────────────────────────┘  │
│                                          │
│ Eventos:                                 │
│ ┌────────────────────────────────┐      │
│ │ Licencia solicitada             │      │
│ │ Por: admin-1                    │      │
│ └────────────────────────────────┘      │
│                                          │
│ Marcar como:                             │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐    │
│ │Trab│ │Lice│ │Pago│ │Otro│ │Sin │    │
│ └────┘ └────┘ └────┘ └────┘ └────┘    │
└──────────────────────────────────────────┘
```

### Información de Feriado Nacional
```
Cuando selecciones 10 de abril (Viernes Santo):

┌──────────────────────────────────────────┐
│ Viernes, 10 de abril de 2026             │
├──────────────────────────────────────────┤
│                                          │
│ Tipo de día:                             │
│ ┌────────────────────────────────────┐  │
│ │ 🔴 Feriado Nacional: Viernes Santo │  │
│ └────────────────────────────────────┘  │
│                                          │
│ (No se puede editar feriados nacionales) │
│                                          │
└──────────────────────────────────────────┘
```

### Código de Colores del Calendario
```
Celda Día    | Color     | Significado
─────────────┼───────────┼──────────────────────
Fondo Verde  | #10B981   | Día trabajado
Fondo Rojo   | #EF4444   | Feriado Nacional
Fondo Azul   | #3B82F6   | Licencia/Vacación
Fondo Gris   | #D1D5DB   | Sin trabajar/Descanso
Fondo Púrp   | #A855F7   | Día de pago
Fondo Amaril | #FBBF24   | Otro tipo feriado
```

---

## 📢 Sistema de Anuncios

### Panel de Anuncios en Dashboard
```
┌────────────────────────────────────────┐
│ 🔔 Anuncios                            │
│                                        │
│ [+ Crear Anuncio] (solo admin/rrhh)   │
│                                        │
│ ☑ Mostrar solo no leídos               │
│                                        │
│ [3 nuevos]  ◄─ Badge de no leídos     │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ 🔴 [OBLIGATORIO]                   │ │
│ │ Capacitación de Seguridad          │ │
│ │ [Leído]                            │ │
│ │                                    │ │
│ │ Se realizará capacitación...       │ │
│ │ Viernes 5 de abril, 2-4 PM         │ │
│ │ Marcar como leído                  │ │
│ └────────────────────────────────────┘ │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ ℹ️  Baño fuera de servicio         │ │
│ │ [Leído]                            │ │
│ │                                    │ │
│ │ El baño del pasillo 2 está...      │ │
│ │ Usar baños pasillo 1 o 3           │ │
│ │ Marcar como leído                  │ │
│ └────────────────────────────────────┘ │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ ℹ️  Cierre de Sistema              │ │
│ │ Domingo 7 de abril, 10PM-12AM       │ │
│ │ Marcar como leído                  │ │
│ └────────────────────────────────────┘ │
│                                        │
└────────────────────────────────────────┘
```

### Dialog para Crear Anuncio
```
╔════════════════════════════════════════╗
║ Crear Nuevo Anuncio                    ║
├════════════════════════════════════════┤
║                                        ║
║ Los anuncios obligatorios deben        ║
║ ser confirmados por todos              ║
║                                        ║
║ Título:                                ║
║ [________________________]              ║
║                                        ║
║ Contenido:                             ║
║ ┌────────────────────────────────────┐║
║ │                                    ││
║ │ (4 líneas de texto)                ││
║ │                                    ││
║ └────────────────────────────────────┘║
║                                        ║
║ ☑ Marcar como obligatorio              ║
║   (todos deben confirmar lectura)      ║
║                                        ║
║ Fecha de vencimiento (opcional):       ║
║ [________________________]              ║
║                                        ║
║      [Cancelar]  [Crear Anuncio]      ║
╚════════════════════════════════════════╝
```

### Estado de Anuncios

#### Anuncio No Leído (Admin ve)
```
Fondo azul claro
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔔 Nuevo Anuncio
Título importante
01/04/2026 09:30
[Marcar como leído] [Eliminar]
```

#### Anuncio Obligatorio (Rojo)
```
Borde izquierdo rojo (4px)
🔴 [OBLIGATORIO]
Título en rojo
Contenido...
[Marcar como leído] [Eliminar]
```

#### Anuncio Leído (Admin ve)
```
Fondo gris
ℹ️  Título
[✓ Leído] ◄─ Badge
Contenido...
[Eliminar]
```

---

## 🔐 Cambios en el Sidebar

### Sidebar Admin/RRHH (Completo)
```
┌─────────────────────────────────────┐
│   RRHH IA                        ◄   │ ← Puede colapsar
├─────────────────────────────────────┤
│ Conectado como                       │
│ Admin User                           │
│ [Administrador]                      │
├─────────────────────────────────────┤
│ 📊 Dashboard                         │
│                                     │
│ 👥 Personas ▼                        │
│   ├ Colaboradores                   │
│   ├ Turnos                          │
│   ├ Organigrama                     │
│   ├ Contratación                    │
│   └ Desempeño                       │
│                                     │
│ 💰 Nómina ▼                          │
│   ├ Períodos                        │
│   ├ Procesar                        │
│   └ Historial                       │
│                                     │
│ 💳 Préstamos                         │
│ 📋 Solicitudes                       │
│ 📄 Declaraciones                     │
│ 📊 Reportes                          │
│                                     │
├─────────────────────────────────────┤
│ ⚙️  Configuración ▼                  │
│   ├ General                         │
│   ├ Tasas y Retenciones             │
│   └ Roles y Permisos                │
└─────────────────────────────────────┘
```

### Sidebar Empleado (Limitado)
```
┌─────────────────────────────────────┐
│   RRHH IA                        ◄   │
├─────────────────────────────────────┤
│ Conectado como                       │
│ Juan García                          │
│ [Empleado]                           │
├─────────────────────────────────────┤
│ 📊 Dashboard                         │
│                                     │
│ 👥 Personas ▼                        │
│   ├ Turnos                          │
│   ├ Desempeño                       │
│   └ (Colaboradores ✗ NO)            │
│   └ (Organigrama ✗ NO)              │
│                                     │
│ 💰 Nómina ▼                          │
│   ├ Historial                       │
│   └ (Períodos ✗ NO)                 │
│                                     │
│ 💳 Préstamos                         │
│ 📋 Solicitudes                       │
│ 👤 Perfil                            │
│                                     │
│ (Sin acceso a ⚙️ Configuración)     │
│                                     │
└─────────────────────────────────────┘
```

---

## 📊 Flujo de Datos

### Calendario
```
Admin/RRHH
    ↓
[Smart Calendar] ← Selecciona día
    ↓
[Agregar Evento]
    ↓
[useCalendar() Hook]
    ↓
[localStorage: calendar_events]
    ↓
Employado ve (read-only)
```

### Anuncios
```
Admin/RRHH
    ↓
[+ Crear Anuncio Dialog]
    ↓
[Título + Contenido + Obligatorio]
    ↓
[useAnnouncements() Hook]
    ↓
[localStorage: announcements]
    ↓
[localStorage: announcement_reads]
    ↓
Todos los usuarios ven badge de no leídos
    ↓
[Marcar como leído]
    ↓
Actualiza announcement_reads
```

---

## 🎯 Interacciones del Usuario

### Empleado viendo Anuncios
```
LOGIN → DASHBOARD
  ↓
Ven: 🔔 Anuncios [3 nuevos]
  ↓
Click en "Marcar como leído"
  ↓
Se actualiza badge → [2 nuevos]
  ↓
Si es obligatorio → DEBEN hacerlo
Si no → Opcional
```

### Admin Creando Anuncio
```
DASHBOARD → [+ Crear Anuncio]
  ↓
Completa formulario
  ↓
Click [Crear Anuncio]
  ↓
Aparece en dashboard de TODOS los empleados
  ↓
Admin ve quién lo leyó en tiempo real
```

### Empleado Viendo Calendario
```
DASHBOARD → Calendario (solo lectura)
  ↓
Click en día
  ↓
Ve: Tipo de día (Trabajado/Licencia/etc)
  ↓
Ve: Feriados nacionales automáticos 🇩🇴
  ↓
NO puede editar (botones deshabilitados)
```

---

## 📱 Responsive Design

### Mobile (< 768px)
```
┌──────────────────────────┐
│ RRHH IA            ☰     │ ← Menú colapsa
├──────────────────────────┤
│                          │
│ Calendario (full width)  │
│ (visible pero compacto)  │
│                          │
│ Anuncios (full width)    │
│                          │
└──────────────────────────┘
```

### Tablet (768px - 1024px)
```
┌────────────────────────────────────┐
│ RRHH IA                        ◄   │
├────────────────────────────────────┤
│ Dashboard                          │
│                                    │
│ ┌──────────────────┬──────────────┐│
│ │ Calendario       │ Anuncios     ││
│ │ (2 columnas)     │              ││
│ │                  │              ││
│ └──────────────────┴──────────────┘│
└────────────────────────────────────┘
```

### Desktop (> 1024px)
```
┌──────────────────────────────────────────────┐
│ Sidebar ◄ │ Dashboard                        │
│           │                                  │
│ - Dash    │ ┌──────────────────┬──────────┐ │
│ - Person  │ │ Calendario       │ Anuncios │ │
│   - Turnos│ │ (2/3 width)      │ (1/3)    │ │
│   - Desemp│ │                  │          │ │
│ - Nómina  │ │                  │          │ │
│ - Préstamo│ └──────────────────┴──────────┘ │
│           │                                  │
└──────────────────────────────────────────────┘
```
