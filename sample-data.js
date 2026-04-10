/**
 * Datos de Prueba para la aplicación MVP-RRHH
 * 
 * Cómo usar:
 * 1. Abre la consola del navegador (F12)
 * 2. Copia y pega estos datos en la consola
 * 3. Los datos se guardarán en localStorage
 */

// ============================================
// 📅 DATOS DE PRUEBA: CALENDARIO
// ============================================

const sampleCalendarEvents = [
  // Abril 2026
  {
    id: "2026-04-01-worked-1",
    date: "2026-04-01",
    type: "worked",
    userId: "emp-001",
    description: "Día trabajado normal",
    createdBy: "admin-1",
    createdAt: new Date("2026-03-25")
  },
  {
    id: "2026-04-02-worked-1",
    date: "2026-04-02",
    type: "worked",
    userId: "emp-001",
    description: "Día trabajado normal",
    createdBy: "admin-1"
  },
  {
    id: "2026-04-03-worked-1",
    date: "2026-04-03",
    type: "vacation",
    userId: "emp-001",
    description: "Licencia solicitada",
    createdBy: "admin-1"
  },
  {
    id: "2026-04-04-payday-1",
    date: "2026-04-04",
    type: "payday",
    userId: "emp-001",
    description: "Día de pago - Q1",
    createdBy: "admin-1"
  },
  {
    id: "2026-04-06-off-1",
    date: "2026-04-06",
    type: "off",
    userId: "emp-001",
    description: "Fin de semana",
    createdBy: "system"
  },
  {
    id: "2026-04-07-off-1",
    date: "2026-04-07",
    type: "off",
    userId: "emp-001",
    description: "Fin de semana",
    createdBy: "system"
  },
  {
    id: "2026-04-15-worked-2",
    date: "2026-04-15",
    type: "worked",
    userId: "emp-002",
    description: "Día trabajado completo",
    createdBy: "admin-1"
  }
];

// Copiar en consola:
// localStorage.setItem('calendar_events', JSON.stringify(sampleCalendarEvents));
// console.log('✅ Eventos de calendario guardados');

// ============================================
// 📢 DATOS DE PRUEBA: ANUNCIOS
// ============================================

const sampleAnnouncements = [
  {
    id: "ann-001",
    title: "Baño fuera de servicio",
    content: "El baño del pasillo 2 está siendo reparado.\n\nPor favor utilizar los baños del pasillo 1 o 3 hasta nuevo aviso.",
    isRequired: false,
    createdBy: "admin-1",
    createdAt: new Date("2026-04-01T09:00:00"),
    readBy: ["emp-001", "emp-002", "emp-003"]
  },
  {
    id: "ann-002",
    title: "CAPACITACION OBLIGATORIA",
    content: "Se realizará capacitación obligatoria sobre seguridad en el trabajo.\n\nFecha: Viernes 5 de abril de 2026\nHora: 2:00 PM - 4:00 PM\nLugar: Sala de conferencias - Piso 2\n\nPor favor confirmar asistencia.",
    isRequired: true,
    createdBy: "rrhh-1",
    createdAt: new Date("2026-04-01T10:30:00"),
    readBy: ["emp-001"]
  },
  {
    id: "ann-003",
    title: "Cierre de Sistema para Mantenimiento",
    content: "El sistema estará en mantenimiento el domingo 7 de abril de 2026\nde 10:00 PM a 12:00 AM.\n\nDurante este período no podrá acceder a la aplicación.",
    isRequired: false,
    createdBy: "admin-1",
    createdAt: new Date("2026-03-31T14:00:00"),
    readBy: ["emp-001", "emp-002", "emp-003", "emp-004", "emp-005"]
  },
  {
    id: "ann-004",
    title: "Actualización de Datos Personales",
    content: "Por favor, asegúrate de mantener tus datos personales actualizados en el sistema.\n\nEspecialmente:\n- Número de teléfono\n- Dirección\n- Contacto de emergencia\n\nVence el 30 de abril de 2026.",
    isRequired: true,
    createdBy: "rrhh-1",
    createdAt: new Date("2026-03-29T08:00:00"),
    expiresAt: new Date("2026-04-30"),
    readBy: ["emp-001", "emp-002"]
  }
];

// Copiar en consola:
// localStorage.setItem('announcements', JSON.stringify(sampleAnnouncements));
// console.log('✅ Anuncios guardados');

// ============================================
// 📋 DATOS DE PRUEBA: LECTURAS DE ANUNCIOS
// ============================================

const sampleAnnouncementReads = [
  {
    userId: "emp-001",
    announcementId: "ann-001",
    readAt: new Date("2026-04-01T09:30:00")
  },
  {
    userId: "emp-001",
    announcementId: "ann-002",
    readAt: new Date("2026-04-01T10:45:00")
  },
  {
    userId: "emp-002",
    announcementId: "ann-001",
    readAt: new Date("2026-04-01T09:20:00")
  },
  {
    userId: "emp-003",
    announcementId: "ann-001",
    readAt: new Date("2026-04-01T10:00:00")
  }
];

// Copiar en consola:
// localStorage.setItem('announcement_reads', JSON.stringify(sampleAnnouncementReads));
// console.log('✅ Lecturas de anuncios guardadas');

// ============================================
// 🚀 CARGAR TODO
// ============================================

/**
 * Ejecuta esto en la consola para cargar TODOS los datos de prueba:
 */
function loadSampleData() {
  localStorage.setItem('calendar_events', JSON.stringify(sampleCalendarEvents));
  localStorage.setItem('announcements', JSON.stringify(sampleAnnouncements));
  localStorage.setItem('announcement_reads', JSON.stringify(sampleAnnouncementReads));
  
  console.log('✅ Todos los datos de prueba han sido cargados');
  console.log('📅 Eventos de calendario:', sampleCalendarEvents.length);
  console.log('📢 Anuncios:', sampleAnnouncements.length);
  console.log('📋 Límite de anuncios leídos:', sampleAnnouncementReads.length);
  console.log('\n⚠️ Recarga la página para ver los cambios');
}

// ============================================
// LIMPIAR DATOS
// ============================================

/**
 * Ejecuta esto en la consola para LIMPIAR todo:
 */
function clearSampleData() {
  localStorage.removeItem('calendar_events');
  localStorage.removeItem('announcements');
  localStorage.removeItem('announcement_reads');
  console.log('🗑️ Todos los datos de prueba han sido eliminados');
  console.log('⚠️ Recarga la página para ver los cambios');
}

// ============================================
// INSTRUCCIONES PASO A PASO
// ============================================

/*

PASO 1: Abre la consola del navegador
  - Presiona F12 o Ctrl+Shift+I (Windows/Linux)
  - O Cmd+Option+I (Mac)
  - Haz clic en la pestaña "Console"

PASO 2: Copia todo el archivo sample-data.js

PASO 3: Ejecuta en la consola:
  
  // Opción A: Cargar TODO
  loadSampleData();
  
  // Opción B: Cargar solo calendario
  localStorage.setItem('calendar_events', JSON.stringify(sampleCalendarEvents));
  
  // Opción C: Cargar solo anuncios
  localStorage.setItem('announcements', JSON.stringify(sampleAnnouncements));
  localStorage.setItem('announcement_reads', JSON.stringify(sampleAnnouncementReads));

PASO 4: Recarga la página (F5 o Ctrl+R)

PASO 5: Verás:
  ✅ Calendario con eventos de abril
  ✅ Anuncios apareciendo en el dashboard
  ✅ Algunos anuncios marcados como "Leídos"

PASO 6: Para limpiar después
  clearSampleData();

*/

// Exporte para uso en Node.js / npm scripts si es necesario
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    sampleCalendarEvents,
    sampleAnnouncements,
    sampleAnnouncementReads,
    loadSampleData,
    clearSampleData
  };
}
