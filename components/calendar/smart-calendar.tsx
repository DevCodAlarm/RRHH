"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight, Calendar, BarChart3, AlertCircle, Sparkles } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay } from "date-fns"
import { es } from "date-fns/locale"

interface DominicanHoliday {
  name: string
  type: string
  isPublicHoliday: boolean
  category: string
}

const DOMINICAN_HOLIDAYS: Record<string, DominicanHoliday> = {
  "2026-01-01": { name: "Año Nuevo", type: "national-holiday", isPublicHoliday: true, category: "Celebración" },
  "2026-01-06": { name: "Día de Reyes", type: "national-holiday", isPublicHoliday: true, category: "Religiosa" },
  "2026-01-26": { name: "Natalicio de Juan Pablo Duarte", type: "national-holiday", isPublicHoliday: true, category: "Nacional" },
  "2026-02-27": { name: "Independencia Nacional", type: "national-holiday", isPublicHoliday: true, category: "Nacional" },
  "2026-04-10": { name: "Viernes Santo", type: "national-holiday", isPublicHoliday: true, category: "Religiosa" },
  "2026-04-11": { name: "Sábado de Gloria", type: "national-holiday", isPublicHoliday: true, category: "Religiosa" },
  "2026-05-01": { name: "Día del Trabajador", type: "national-holiday", isPublicHoliday: true, category: "Laboral" },
  "2026-08-16": { name: "Restauración de la República", type: "national-holiday", isPublicHoliday: true, category: "Nacional" },
  "2026-11-06": { name: "Día de Constitución", type: "national-holiday", isPublicHoliday: true, category: "Nacional" },
  "2026-12-25": { name: "Navidad", type: "national-holiday", isPublicHoliday: true, category: "Religiosa" },
}

const DAY_COLORS = {
  // Neutral navy/gray palette to match the app (no saturated colors)
  "national-holiday": { bg: "#1f2a44", text: "white", label: "Feriado Nacional", light: "#eef2f7" },
  worked: { bg: "#1f2a44", text: "white", label: "Día Trabajado", light: "#eef2f7" },
  vacation: { bg: "#1f2a44", text: "white", label: "Licencia", light: "#eef2f7" },
  "sick-leave": { bg: "#1f2a44", text: "white", label: "Incapacidad", light: "#eef2f7" },
  payday: { bg: "#1f2a44", text: "white", label: "Día de Pago", light: "#eef2f7" },
  celebration: { bg: "#1f2a44", text: "white", label: "Celebración", light: "#eef2f7" },
  observance: { bg: "#1f2a44", text: "white", label: "Observancia", light: "#eef2f7" },
}

export function SmartCalendarPro() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)) // Abril 2026
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const monthName = format(currentDate, "MMMM", { locale: es })
  const yearName = format(currentDate, "yyyy")

  const handlePreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))
    setSelectedDate(null)
  }

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))
    setSelectedDate(null)
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

  const stats = useMemo(() => {
    return {
      totalHolidays: monthHolidays.length,
      workingDays: daysInMonth.length - monthHolidays.length,
    }
  }, [monthHolidays, daysInMonth])

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header Premium */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-secondary border border-border">
                <Calendar className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold text-foreground">Calendario Laboral RD</h1>
                <p className="text-sm text-muted-foreground mt-1">República Dominicana 2026</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold text-foreground capitalize">{monthName}</p>
              <p className="text-muted-foreground font-medium">{yearName}</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={handlePreviousMonth}
                className="p-2 rounded-lg transition-all hover:bg-secondary/60 active:scale-95"
              >
                <ChevronLeft className="w-5 h-5 text-muted-foreground" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-lg transition-all hover:bg-secondary/60 active:scale-95"
              >
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{stats.totalHolidays}</span> feriados
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{stats.workingDays}</span> días laborales
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="col-span-2">
            <div className="bg-card rounded-2xl border border-border p-8">
              {/* Days Header */}
              <div className="grid grid-cols-7 gap-3 mb-6">
                {weekDays.map(day => (
                  <div key={day} className="text-center">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2">{day}</p>
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-3">
                {calendarGrid.map((day, idx) => {
                  if (!day) {
                    return <div key={`empty-${idx}`} className="aspect-square" />
                  }

                  const dateStr = format(day, "yyyy-MM-dd")
                  const isHoliday = dateStr in DOMINICAN_HOLIDAYS
                  const holiday = isHoliday ? DOMINICAN_HOLIDAYS[dateStr] : null
                  const isDayToday = isToday(day)
                  const isSelected = selectedDate === dateStr
                  const notInMonth = !isSameMonth(day, currentDate)

                  const bgColor = isHoliday ? DAY_COLORS["national-holiday"].light : "hsl(var(--secondary))"
                  const textColor = notInMonth ? "text-muted-foreground/40" : "text-foreground"
                  const borderColor = isDayToday ? "#1f2a44" : "hsl(var(--border))"

                  return (
                    <button
                      key={dateStr}
                      onClick={() => {
                        setSelectedDate(isSelected ? null : dateStr)
                      }}
                      className="aspect-square rounded-xl p-2 flex flex-col items-center justify-center transition-all duration-200 relative group"
                      style={{
                        backgroundColor: isSelected ? DAY_COLORS["national-holiday"].light : bgColor,
                        borderColor: isSelected ? DAY_COLORS["national-holiday"].bg : borderColor,
                        borderWidth: isSelected ? "2px" : "1px",
                        borderStyle: "solid",
                        cursor: notInMonth ? "default" : "pointer",
                      }}
                      disabled={notInMonth}
                    >
                      <span className={`text-sm font-bold ${textColor}`}>
                        {format(day, "d")}
                      </span>

                      {isHoliday && (
                        <div className="mt-1 w-2 h-2 rounded-full" style={{ background: DAY_COLORS["national-holiday"].bg }} />
                      )}

                      {/* Tooltip */}
                      {holiday && (
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-xs px-3 py-1 rounded-lg whitespace-nowrap pointer-events-none z-50">
                          {holiday.name}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Holiday Info Card */}
            {selectedDate && DOMINICAN_HOLIDAYS[selectedDate] && (
              <div className="bg-gradient-to-br rounded-2xl shadow-lg p-6 text-white" style={{ background: "linear-gradient(135deg, #c41e3a 0%, #a01830 100%)" }}>
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg">
                      {DOMINICAN_HOLIDAYS[selectedDate].name}
                    </h3>
                    <p className="text-sm opacity-90 mt-1">
                      {format(new Date(selectedDate + "T00:00:00"), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="opacity-90">Tipo:</span>
                    <span className="font-semibold">{DOMINICAN_HOLIDAYS[selectedDate].category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-90">Estado:</span>
                    <span className="font-semibold">No Laboral</span>
                  </div>
                </div>
              </div>
            )}

            {/* Holidays List */}
            <div className="bg-white rounded-2xl shadow-lg p-6" style={{ border: "1px solid #e2e8f0" }}>
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5" style={{ color: "#c41e3a" }} />
                Feriados de {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
              </h3>

              <div className="space-y-3">
                {monthHolidays.length > 0 ? (
                  monthHolidays.map(holiday => (
                    <button
                      key={holiday.date}
                      onClick={() => setSelectedDate(holiday.date)}
                      className="w-full p-3 rounded-xl transition-all text-left hover:scale-105"
                      style={{
                        background: DAY_COLORS["national-holiday"].light,
                        borderLeft: `4px solid ${DAY_COLORS["national-holiday"].bg}`,
                      }}
                    >
                      <p className="text-sm font-bold text-gray-900">{holiday.name}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {format(new Date(holiday.date + "T00:00:00"), "d MMM", { locale: es })}
                      </p>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">Sin feriados este mes</p>
                )}
              </div>
            </div>

            {/* Statistics Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6" style={{ border: "1px solid #e2e8f0" }}>
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" style={{ color: "#38a169" }} />
                Estadísticas
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-600 uppercase font-bold mb-2">Días del mes</p>
                  <p className="text-2xl font-bold text-gray-900">{daysInMonth.length}</p>
                </div>

                <div className="h-px bg-gray-100" />

                <div>
                  <p className="text-xs text-gray-600 uppercase font-bold mb-2">Feriados</p>
                  <p className="text-2xl font-bold" style={{ color: "#c41e3a" }}>{stats.totalHolidays}</p>
                </div>

                <div className="h-px bg-gray-100" />

                <div>
                  <p className="text-xs text-gray-600 uppercase font-bold mb-2">Días laborales</p>
                  <p className="text-2xl font-bold" style={{ color: "#38a169" }}>{stats.workingDays}</p>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="bg-white rounded-2xl shadow-lg p-6" style={{ border: "1px solid #e2e8f0" }}>
              <h3 className="font-bold text-gray-900 mb-4">Leyenda</h3>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: DAY_COLORS["national-holiday"].bg }} />
                  <span className="text-sm text-gray-700">Feriado Nacional</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-white mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-center text-sm text-gray-600">
            Calendario Laboral de la República Dominicana © 2026 | Gestión profesional de horarios
          </p>
        </div>
      </div>
    </div>
  )
}