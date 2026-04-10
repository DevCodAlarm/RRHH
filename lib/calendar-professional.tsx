"use client"

import React, { useState, useMemo } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay } from "date-fns"
import { es } from "date-fns/locale"
import type { CSSProperties } from "react"

// Estilos profesionales
const styles: Record<string, CSSProperties> = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
    padding: "2rem 1rem",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  maxWidth: {
    maxWidth: "1400px",
    margin: "0 auto",
  },
  header: {
    background: "white",
    borderRadius: "16px",
    padding: "2rem",
    marginBottom: "2rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    border: "1px solid #e2e8f0",
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "1.5rem",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
  },
  headerIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #c41e3a 0%, #003d82 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "28px",
    boxShadow: "0 4px 15px rgba(196, 30, 58, 0.2)",
  },
  title: {
    fontSize: "32px",
    fontWeight: "600",
    color: "#1a202c",
    margin: "0 0 4px 0",
  },
  subtitle: {
    fontSize: "13px",
    color: "#718096",
    margin: "0",
  },
  monthName: {
    fontSize: "28px",
    fontWeight: "600",
    color: "#1a202c",
    margin: "0 0 4px 0",
  },
  year: {
    fontSize: "14px",
    color: "#718096",
  },
  statsContainer: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
  },
  statItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "13px",
  },
  statValue: {
    fontWeight: "600",
    color: "#1a202c",
    marginLeft: "0.5rem",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "2rem",
  },
  card: {
    background: "white",
    borderRadius: "16px",
    padding: "2rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    border: "1px solid #e2e8f0",
  },
  weekdaysGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "0.75rem",
    marginBottom: "1.5rem",
  },
  weekday: {
    textAlign: "center" as const,
    fontSize: "12px",
    fontWeight: "600",
    color: "#718096",
    textTransform: "uppercase" as const,
    padding: "0.75rem 0",
    letterSpacing: "0.5px",
  },
  daysGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "0.75rem",
  },
  dayButton: {
    aspectRatio: "1",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    background: "#f7fafc",
    fontWeight: "500",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    color: "#1a202c",
  },
  holidayButton: {
    border: "2px solid #c41e3a",
    background: "#fed7d7",
    color: "#c41e3a",
  },
  sidebarContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.5rem",
  },
  holidayCard: {
    background: "linear-gradient(135deg, #c41e3a 0%, #a01830 100%)",
    borderRadius: "16px",
    padding: "1.5rem",
    color: "white",
    boxShadow: "0 4px 15px rgba(196, 30, 58, 0.2)",
  },
  holidayHeader: {
    display: "flex",
    gap: "0.75rem",
    marginBottom: "1rem",
  },
  holidayIcon: {
    fontSize: "28px",
  },
  holidayTitle: {
    fontSize: "16px",
    fontWeight: "600",
    margin: "0",
    color: "white",
  },
  holidayDate: {
    fontSize: "13px",
    opacity: "0.9",
    margin: "4px 0 0",
    color: "white",
  },
  holidayInfo: {
    borderTop: "1px solid rgba(255,255,255,0.2)",
    paddingTop: "1rem",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.5rem",
    fontSize: "13px",
  },
  infoLabel: {
    opacity: "0.9",
  },
  infoValue: {
    fontWeight: "600",
  },
  listContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.75rem",
  },
  listButton: {
    width: "100%",
    padding: "0.75rem",
    background: "#fed7d7",
    border: "1px solid #fcbdbd",
    borderLeft: "3px solid #c41e3a",
    borderRadius: "10px",
    textAlign: "left" as const,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  listItemName: {
    fontSize: "13px",
    fontWeight: "600",
    margin: "0",
    color: "#c41e3a",
  },
  listItemDate: {
    fontSize: "12px",
    color: "#a01830",
    margin: "2px 0 0",
  },
  statsTitle: {
    fontSize: "14px",
    fontWeight: "600",
    margin: "0 0 1.5rem 0",
    color: "#1a202c",
  },
  statRow: {
    marginBottom: "1.5rem",
  },
  statLabel: {
    fontSize: "11px",
    color: "#718096",
    textTransform: "uppercase" as const,
    fontWeight: "600",
    margin: "0 0 0.5rem 0",
    letterSpacing: "0.5px",
  },
  statNumber: {
    fontSize: "28px",
    fontWeight: "600",
    margin: "0",
    color: "#1a202c",
  },
  statNumberRed: {
    color: "#c41e3a",
  },
  statNumberGreen: {
    color: "#38a169",
  },
  divider: {
    borderTop: "1px solid #e2e8f0",
    paddingTop: "1rem",
    marginBottom: "1rem",
  },
}

const DOMINICAN_HOLIDAYS: Record<string, { name: string; category: string }> = {
  "2026-01-01": { name: "Año Nuevo", category: "Celebración" },
  "2026-01-06": { name: "Día de Reyes", category: "Religiosa" },
  "2026-01-26": { name: "Natalicio de Juan Pablo Duarte", category: "Nacional" },
  "2026-02-27": { name: "Independencia Nacional", category: "Nacional" },
  "2026-04-10": { name: "Viernes Santo", category: "Religiosa" },
  "2026-04-11": { name: "Sábado de Gloria", category: "Religiosa" },
  "2026-05-01": { name: "Día del Trabajador", category: "Laboral" },
  "2026-08-16": { name: "Restauración de la República", category: "Nacional" },
  "2026-11-06": { name: "Día de Constitución", category: "Nacional" },
  "2026-12-25": { name: "Navidad", category: "Religiosa" },
}

export function CalendarProfessional() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1))
  const [selectedDate, setSelectedDate] = useState<string | null>("2026-04-10")

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const monthName = format(currentDate, "MMMM", { locale: es })
  const yearName = format(currentDate, "yyyy")

  const handlePreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))
  }

  const monthHolidays = useMemo(() => {
    return daysInMonth
      .map(day => {
        const dateStr = format(day, "yyyy-MM-dd")
        if (dateStr in DOMINICAN_HOLIDAYS) {
          return { date: dateStr, ...DOMINICAN_HOLIDAYS[dateStr] }
        }
        return null
      })
      .filter((h): h is NonNullable<typeof h> => h !== null)
  }, [daysInMonth])

  const weekDays = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"]
  const firstDayOfWeek = getDay(monthStart) === 0 ? 6 : getDay(monthStart) - 1

  const calendarGrid: (Date | null)[] = []
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarGrid.push(null)
  }
  calendarGrid.push(...daysInMonth)
  while (calendarGrid.length % 7 !== 0) {
    calendarGrid.push(null)
  }

  const selectedHoliday = selectedDate && selectedDate in DOMINICAN_HOLIDAYS
    ? DOMINICAN_HOLIDAYS[selectedDate]
    : null

  const stats = {
    totalDays: daysInMonth.length,
    holidays: monthHolidays.length,
    workingDays: daysInMonth.length - monthHolidays.length,
  }

  return (
    <div style={styles.container}>
      <div style={styles.maxWidth}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.headerLeft}>
              <div style={styles.headerIcon}>📅</div>
              <div>
                <h1 style={styles.title}>Calendario Laboral RD</h1>
                <p style={styles.subtitle}>República Dominicana 2026</p>
              </div>
            </div>
            <div style={{ textAlign: "right" as const }}>
              <p style={styles.monthName}>{monthName}</p>
              <p style={styles.year}>{yearName}</p>
            </div>
          </div>

          {/* Navigation */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={handlePreviousMonth}
                style={{
                  padding: "8px 12px",
                  background: "#f7fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#1a202c",
                }}
              >
                ← Anterior
              </button>
              <button
                onClick={handleNextMonth}
                style={{
                  padding: "8px 12px",
                  background: "#f7fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#1a202c",
                }}
              >
                Siguiente →
              </button>
            </div>

            {/* Stats */}
            <div style={styles.statsContainer}>
              <div style={styles.statItem}>
                <span style={{ color: "#c41e3a", fontSize: "16px" }}>🚩</span>
                <span>Feriados:</span>
                <span style={{ ...styles.statValue, color: "#c41e3a" }}>{stats.holidays}</span>
              </div>
              <div style={styles.statItem}>
                <span style={{ color: "#38a169", fontSize: "16px" }}>✓</span>
                <span>Laborales:</span>
                <span style={{ ...styles.statValue, color: "#38a169" }}>{stats.workingDays}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={styles.mainGrid}>
          {/* Calendar */}
          <div style={styles.card}>
            {/* Weekdays */}
            <div style={styles.weekdaysGrid}>
              {weekDays.map(day => (
                <div key={day} style={styles.weekday}>
                  {day}
                </div>
              ))}
            </div>

            {/* Days */}
            <div style={styles.daysGrid}>
              {calendarGrid.map((day, idx) => {
                if (!day) {
                  return <div key={`empty-${idx}`} />
                }

                const dateStr = format(day, "yyyy-MM-dd")
                const isHoliday = dateStr in DOMINICAN_HOLIDAYS
                const isDayToday = isToday(day)
                const isSelected = selectedDate === dateStr
                const notInMonth = !isSameMonth(day, currentDate)

                const baseStyle: CSSProperties = { ...styles.dayButton }
                const buttonStyle: CSSProperties = isHoliday
                  ? { ...baseStyle, ...styles.holidayButton }
                  : baseStyle

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                    onMouseEnter={(e) => {
                      if (!notInMonth) {
                        (e.target as HTMLElement).style.transform = "scale(1.05)"
                        ;(e.target as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)"
                      }
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.transform = "scale(1)"
                      ;(e.target as HTMLElement).style.boxShadow = "none"
                    }}
                    style={{
  ...buttonStyle,
  opacity: notInMonth ? 0.4 : 1,
  border: isDayToday && !isHoliday 
    ? "2px solid #1a202c" 
    : buttonStyle.border,
  backgroundColor: isSelected && isHoliday
    ? "#ed5d5d"
    : typeof buttonStyle.background === "string"
      ? buttonStyle.background
      : undefined,
}}
                    disabled={notInMonth}
                    title={isHoliday ? DOMINICAN_HOLIDAYS[dateStr].name : ""}
                  >
                    {format(day, "d")}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div style={styles.sidebarContainer}>
            {/* Holiday Details */}
            {selectedHoliday && (
              <div style={styles.holidayCard}>
                <div style={styles.holidayHeader}>
                  <div style={styles.holidayIcon}>🇩🇴</div>
                  <div>
                    <h3 style={styles.holidayTitle}>{selectedHoliday.name}</h3>
                    <p style={styles.holidayDate}>
                      {selectedDate && format(new Date(selectedDate + "T00:00:00"), "EEEE, d 'de' MMMM", { locale: es })}
                    </p>
                  </div>
                </div>
                <div style={styles.holidayInfo}>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Tipo:</span>
                    <span style={styles.infoValue}>{selectedHoliday.category}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Estado:</span>
                    <span style={styles.infoValue}>No Laboral</span>
                  </div>
                </div>
              </div>
            )}

            {/* Holidays List */}
            <div style={styles.card}>
              <h3 style={styles.statsTitle}>Feriados de {monthName}</h3>
              {monthHolidays.length > 0 ? (
                <div style={styles.listContainer}>
                  {monthHolidays.map(holiday => (
                    <button
                      key={holiday.date}
                      onClick={() => setSelectedDate(holiday.date)}
                      style={{
                        ...styles.listButton,
                        background: selectedDate === holiday.date ? "#ed5d5d" : "#fed7d7",
                        color: selectedDate === holiday.date ? "white" : "inherit",
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLElement).style.transform = "translateX(4px)"
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLElement).style.transform = "translateX(0)"
                      }}
                    >
                      <p style={{
                        ...styles.listItemName,
                        color: selectedDate === holiday.date ? "white" : "#c41e3a",
                      }}>
                        {holiday.name}
                      </p>
                      <p style={{
                        ...styles.listItemDate,
                        color: selectedDate === holiday.date ? "rgba(255,255,255,0.8)" : "#a01830",
                      }}>
                        {format(new Date(holiday.date + "T00:00:00"), "d MMMM", { locale: es })}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: "center" as const, color: "#718096", fontSize: "13px" }}>Sin feriados este mes</p>
              )}
            </div>

            {/* Statistics */}
            <div style={styles.card}>
              <h3 style={styles.statsTitle}>Estadísticas</h3>
              <div style={styles.statRow}>
                <p style={styles.statLabel}>Días del mes</p>
                <p style={styles.statNumber}>{stats.totalDays}</p>
              </div>
              <div style={{ ...styles.statRow, ...styles.divider }}>
                <p style={styles.statLabel}>Feriados</p>
                <p style={{ ...styles.statNumber, ...styles.statNumberRed }}>{stats.holidays}</p>
              </div>
              <div style={styles.statRow}>
                <p style={styles.statLabel}>Días laborales</p>
                <p style={{ ...styles.statNumber, ...styles.statNumberGreen }}>{stats.workingDays}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center" as const, marginTop: "3rem", padding: "2rem", color: "#718096", fontSize: "13px" }}>
          Calendario Laboral de la República Dominicana © 2026 | Gestión profesional de horarios
        </div>
      </div>
    </div>
  )
}