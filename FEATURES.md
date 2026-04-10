# Funcionalidades Implementadas - MVP-RRHH

## 📅 Calendario Inteligente

### Descripción
Un calendario visual que muestra diferentes tipos de días de trabajo, feriados y eventos especiales para empleados de República Dominicana.

### Características

#### Tipos de días soportados:
- 🟢 **Trabajado**: Días en los que se trabajó normalmente
- 🔴 **Feriado Nacional**: Feriados definidos legalmente en RD
- 📍 **Licencia**: Ausencias autorizadas (vacaciones, licencia médica, etc.)
- ⚪ **Sin trabajar**: Días de descanso regulares
- 💜 **Día de pago**: Días especiales de pago de nómina
- 🟡 **Feriado**: Otros feriados no nacionales

#### Feriados Dominicanos Pre-configurados:
- Año Nuevo (1 de enero)
- Día de Reyes (6 de enero)
- Natalicio de Juan Pablo Duarte (26 de enero)
- Independencia Nacional (27 de febrero)
- Viernes Santo y Sábado de Gloria (calculados automáticamente - Semana Santa)
- Día del Trabajador (1 de mayo)
- Restauración de la República (16 de agosto)
- Día de Constitución (6 de noviembre)
- Navidad (25 de diciembre)

### Cómo usar

#### Para Administradores/RRHH:
```typescript
// Los eventos se pueden agregar desde la UI del calendario
// Haz clic en un día para ver opciones de marcar como:
// - Trabajado
// - Licencia
// - Sin trabajar
// - Día de pago
```

#### Para Empleados:
- Los empleados pueden ver el calendario pero no pueden editarlo (solo lectura)
- Los eventos se marcan automáticamente por el administrador
- Los feriados nacionales se muestran automáticamente con indicador 🇩🇴

### Almacenamiento
- Los datos se guardan automáticamente en **localStorage**
- Clave: `calendar_events`
- Persiste entre sesiones del navegador

## 📢 Sistema de Anuncios (Broadcast)

### Descripción
Un sistema tipo broadcast para enviar anuncios importantes a todos los empleados con confirmación de lectura opcional u obligatoria.

### Características

- ✅ **Crear anuncios**: Solo administradores y RRHH
- 📨 **Envío a todos**: Los anuncios se distribuyen a todos los usuarios
- 🔔 **Notificación visual**: Badge con contador de anuncios no leídos
- 🟥 **Anuncios obligatorios**: Marcar un anuncio como obligatorio requiere que todos confirmen lectura
- ⏰ **Fechas de vencimiento**: Establecer cuándo expira un anuncio (opcional)
- ✍️ **Confirmación de lectura**: Track de quién ha leído cada anuncio
- 📋 **Filtro por estado**: Ver solo no leídos o todos

### Casos de uso

#### Ejemplo: "Baño fuera de servicio"
1. Un admin crea un anuncio: "Baño fuera de servicio - Pasillo 2"
2. El anuncio aparece en el dashboard de todos
3. Los empleados hacen clic en "Marcar como leído"
4. El admin puede ver quién lo ha leído

#### Ejemplo: Anuncio obligatorio
1. Se crea un anuncio con "Marcar como obligatorio"
2. Aparece con indicador rojo 🔴 "Obligatorio"
3. Todos DEBEN hacer clic en confirmar lectura
4. El admin ve el porcentaje de confirmaciones

### Almacenamiento
- Anuncios: `announcements` (localStorage)
- Registro de lecturas: `announcement_reads` (localStorage)
- Incluye timestamp de creación y fecha de lectura

## 🔐 Control de Acceso por Rol

### Cambios implementados

#### Empleado (acceso limitado):
El sidebar filtra automáticamente para mostrar solo:
- ✅ Dashboard (vista limitada)
- ✅ Mis Turnos
- ✅ Mi Desempeño
- ✅ Mi Historial de Nómina
- ✅ Mis Prestamos (ver y crear los suyos)
- ✅ Mis Solicitudes (ver y crear las suyas)
- ✅ Mi Perfil

No pueden ver:
- ❌ Colaboradores (lista general de empleados)
- ❌ Organigrama
- ❌ Contratación
- ❌ Períodos de nómina
- ❌ Procesar nómina
- ❌ Declaraciones
- ❌ Reportes
- ❌ Configuración
- ❌ Tasas y retenciones
- ❌ Roles y permisos

### Cómo funciona el filtrado

El componente Sidebar usa `useAuth()` para verificar permisos:
```typescript
const filterByPermission = (items: NavItemType[]): NavItemType[] => {
  return items
    .map(item => {
      if (item.children) {
        const filteredChildren = item.children.filter(child => 
          !child.permission || hasPermission(child.permission, "canView")
        )
        if (filteredChildren.length === 0) return null
        return { ...item, children: filteredChildren }
      }
      // ...
    })
    .filter(Boolean)
}
```

## 💾 Persistencia con localStorage

Todas las nuevas funcionalidades guardan datos en localStorage:

### Calendarios (`calendar_events`)
```json
{
  "id": "2026-04-15-worked-1712118000000",
  "date": "2026-04-15",
  "type": "worked",
  "userId": "user-123",
  "description": "Día trabajado normal",
  "createdBy": "admin-1"
}
```

### Anuncios (`announcements`)
```json
{
  "id": "ann-1712118000000",
  "title": "Baño fuera de servicio",
  "content": "El baño del pasillo 2...",
  "isRequired": false,
  "createdBy": "admin-1",
  "createdAt": "2026-04-01T10:00:00Z",
  "readBy": ["user-1", "user-2"]
}
```

### Lecturas de Anuncios (`announcement_reads`)
```json
{
  "userId": "user-1",
  "announcementId": "ann-1712118000000",
  "readAt": "2026-04-01T10:30:00Z"
}
```

## 🛠️ Integración en el Proyecto

### Providers instalados en `app/layout.tsx`:
```tsx
<html>
  <body>
    <AuthProvider>
      <CalendarProvider>
        <AnnouncementsProvider>
          {children}
        </AnnouncementsProvider>
      </CalendarProvider>
    </AuthProvider>
  </body>
</html>
```

### Componentes nuevos:
- `lib/calendar-context.tsx` - Contexto del calendario
- `lib/announcements-context.tsx` - Contexto de anuncios
- `lib/dominican-holidays.ts` - Cálculo de feriados
- `components/calendar/smart-calendar.tsx` - Componente visual del calendario
- `components/announcements/announcement-manager.tsx` - Gestor de anuncios

### Integración en Dashboard:
El calendario y anuncios aparecen en el dashboard principal bajo los stats y actividad reciente.

## 🚀 Próximas mejoras sugeridas

1. **Notificaciones por correo**: Enviar correos de anuncios obligatorios
2. **Exportar calendario**: Descargar en PDF o iCal
3. **Sincronización con backend**: Guardar datos en servidor en vez de localStorage
4. **API REST**: Endpoints para CRUD de eventos y anuncios
5. **Push Notifications**: Notificaciones del navegador en tiempo real
6. **Historial de cambios**: Auditoría de quién modificó qué
7. **Importar eventos**: Cargar eventos desde CSV
8. **Reportes de asistencia**: Generar reportes basados en el calendario

