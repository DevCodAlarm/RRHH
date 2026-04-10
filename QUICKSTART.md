# 🚀 Guía Rápida - Nuevas Funcionalidades

## Cómo Probar en tu Proyecto

### 1️⃣ Calendario Inteligente

#### Para Admin/RRHH:
1. Ingresa al Dashboard
2. Busca la sección "Calendario del Mes" (lado izquierdo)
3. Haz clic en cualquier día
4. Verás un panel con opciones para marcar como:
   - ✅ Trabajado
   - 🔴 Feriado Nacional (automático)
   - 📍 Licencia
   - ⚪ Sin trabajar
   - 💜 Día de pago

**Nota**: Los feriados nacionales aparecen automáticamente en rojo. Prueba con fechas como:
- 27 de febrero (Independencia)
- 10-11 de abril (Semana Santa)
- 1 de mayo (Día del Trabajador)

#### Para Empleado:
- Solo verán el calendario (no pueden editarlo)
- Ven los eventos que el admin marcó
- Ven los feriados nacionales automáticamente

---

### 2️⃣ Sistema de Anuncios

#### Para Admin/RRHH:
1. Ingresa al Dashboard
2. En el lado derecho verás "Anuncios"
3. Haz clic en **"+ Crear Anuncio"**
4. Completa:
   - **Título**: "Baño fuera de servicio"
   - **Contenido**: Describe el problema
   - **Obligatorio**: Marca si quieres que confirmen lectura
   - **Vencimiento**: Opcional - cuándo expira

5. Haz clic en "Crear Anuncio"

**Ejemplo de uso:**
```
Título: Capacitación obligatoria
Contenido: Se realizará capacitación el viernes 5/4 de 2-4pm
Obligatorio: ✓ Sí (todos deben confirmar que leyeron)
```

#### Para Empleado:
- Ven el badge con el contador de anuncios no leídos
- Ven los anuncios en la sección "Anuncios"
- Si es obligatorio (rojo), deben hacer clic en "Marcar como leído"
- Los no leídos aparecen con fondo azul

---

### 3️⃣ Permisos por Rol

#### Probar que los empleados NO ven ciertas secciones:

1. Crea una sesión como **Empleado**
2. En el sidebar notarás que desaparecen:
   - ❌ Colaboradores
   - ❌ Organigrama
   - ❌ Contratación
   - ~~Períodos, Procesar, Reportes, Config~~

3. Los empleados SÍ ven:
   - ✅ Dashboard (limitado)
   - ✅ Mis Turnos
   - ✅ Mi Desempeño
   - ✅ Mi Historial de Nómina
   - ✅ Mis Prestamos
   - ✅ Mis Solicitudes
   - ✅ Mi Perfil

---

## 📱 Detalles Técnicos

### Datos en localStorage:

Abre la consola del navegador (F12) → Application → Local Storage y busca:

```javascript
// Calendarios
JSON.parse(localStorage.getItem('calendar_events'))

// Anuncios
JSON.parse(localStorage.getItem('announcements'))

// Lecturas de anuncios
JSON.parse(localStorage.getItem('announcement_reads'))
```

### Para Desarrolladores:

**Usar el contexto del calendario:**
```typescript
import { useCalendar } from '@/lib/calendar-context'

function MyComponent() {
  const { addEvent, getEventType, events } = useCalendar()
  
  // Agregar evento
  addEvent({
    date: '2026-04-15',
    type: 'vacation',
    userId: 'user-123',
    description: 'Vacación'
  })
  
  // Ver tipo de día
  const dayType = getEventType('2026-04-15', 'user-123')
}
```

**Usar el contexto de anuncios:**
```typescript
import { useAnnouncements } from '@/lib/announcements-context'

function MyComponent() {
  const { 
    addAnnouncement, 
    markAsRead, 
    getUnreadCount 
  } = useAnnouncements()
  
  const unread = getUnreadCount('user-123')
}
```

---

## 🐛 Troubleshooting

### P: Los datos no se guardan después de recargar
R: Verifica que localStorage esté habilitado en el navegador (no modo privado)

### P: No veo el calendario/anuncios en el dashboard
R: Asegúrate de que `CalendarProvider` y `AnnouncementsProvider` estén en `app/layout.tsx`

### P: Los feriados no se muestran correctamente
R: Los feriados calculados (Semana Santa) usan el algoritmo de Computus. Verifica que el año esté entre 2026-2030

### P: Como empleado veo opciones que no debería
R: Recarga la página o limpia cache del navegador

---

## 📚 Archivos Importantes

| Archivo | Descripción |
|---------|------------|
| `lib/calendar-context.tsx` | Contexto del calendario |
| `lib/dispatcements-context.tsx` | Contexto de anuncios |
| `lib/dominican-holidays.ts` | Cálculo de feriados RD |
| `components/calendar/smart-calendar.tsx` | Componente visual del calendario |
| `components/announcements/announcement-manager.tsx` | Gestor de anuncios |
| `FEATURES.md` | Documentación completa |

---

¡Listo para usar! Si encuentras algún problema, revisa FEATURES.md para más detalles.
