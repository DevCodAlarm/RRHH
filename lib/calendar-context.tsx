"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"

export type DayType = "worked" | "holiday" | "vacation" | "sick-leave" | "payday" | "national-holiday" | "celebration" | "observance"

export interface CalendarEvent {
  id: string
  date: string // YYYY-MM-DD
  type: DayType
  description?: string
  userId?: string
  createdBy?: string
  createdAt?: Date
  backgroundColor?: string
}

export interface CalendarContextType {
  events: CalendarEvent[]
  addEvent: (event: Omit<CalendarEvent, "id">) => void
  removeEvent: (id: string) => void
  updateEvent: (id: string, event: Partial<CalendarEvent>) => void
  getEventsByDate: (date: string) => CalendarEvent[]
  getEventsByMonth: (year: number, month: number) => CalendarEvent[]
  isNationalHoliday: (date: string) => boolean
  getEventType: (date: string, userId?: string) => DayType | null
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined)

// Feriados nacionales de República Dominicana (Completo)
const DOMINICAN_HOLIDAYS_2024 = {
  "2024-01-01": { name: "Año Nuevo", type: "national-holiday", isPublicHoliday: true, category: "Celebración" },
  "2024-01-06": { name: "Día de Reyes", type: "national-holiday", isPublicHoliday: true, category: "Religiosa" },
  "2024-01-26": { name: "Natalicio de Juan Pablo Duarte", type: "national-holiday", isPublicHoliday: true, category: "Nacional" },
  "2024-02-27": { name: "Independencia Nacional", type: "national-holiday", isPublicHoliday: true, category: "Nacional" },
  "2024-03-29": { name: "Viernes Santo", type: "national-holiday", isPublicHoliday: true, category: "Religiosa" },
  "2024-03-30": { name: "Sábado de Gloria", type: "national-holiday", isPublicHoliday: true, category: "Religiosa" },
  "2024-05-01": { name: "Día del Trabajador", type: "national-holiday", isPublicHoliday: true, category: "Laboral" },
  "2024-08-16": { name: "Restauración de la República", type: "national-holiday", isPublicHoliday: true, category: "Nacional" },
  "2024-11-06": { name: "Día de Constitución", type: "national-holiday", isPublicHoliday: true, category: "Nacional" },
  "2024-12-25": { name: "Navidad", type: "national-holiday", isPublicHoliday: true, category: "Religiosa" },
}

const DOMINICAN_HOLIDAYS_2025 = {
  "2025-01-01": { name: "Año Nuevo", type: "national-holiday", isPublicHoliday: true, category: "Celebración" },
  "2025-01-06": { name: "Día de Reyes", type: "national-holiday", isPublicHoliday: true, category: "Religiosa" },
  "2025-01-26": { name: "Natalicio de Juan Pablo Duarte", type: "national-holiday", isPublicHoliday: true, category: "Nacional" },
  "2025-02-27": { name: "Independencia Nacional", type: "national-holiday", isPublicHoliday: true, category: "Nacional" },
  "2025-04-18": { name: "Viernes Santo", type: "national-holiday", isPublicHoliday: true, category: "Religiosa" },
  "2025-04-19": { name: "Sábado de Gloria", type: "national-holiday", isPublicHoliday: true, category: "Religiosa" },
  "2025-05-01": { name: "Día del Trabajador", type: "national-holiday", isPublicHoliday: true, category: "Laboral" },
  "2025-08-16": { name: "Restauración de la República", type: "national-holiday", isPublicHoliday: true, category: "Nacional" },
  "2025-11-06": { name: "Día de Constitución", type: "national-holiday", isPublicHoliday: true, category: "Nacional" },
  "2025-12-25": { name: "Navidad", type: "national-holiday", isPublicHoliday: true, category: "Religiosa" },
}

const DOMINICAN_HOLIDAYS_2026 = {
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

const ALL_DOMINICAN_HOLIDAYS = {
  ...DOMINICAN_HOLIDAYS_2024,
  ...DOMINICAN_HOLIDAYS_2025,
  ...DOMINICAN_HOLIDAYS_2026,
}

const STORAGE_KEY = "calendar_events_pro"

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setEvents(JSON.parse(stored))
      }
      setIsLoaded(true)
    } catch (error) {
      console.error("Error loading calendar events:", error)
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
      } catch (error) {
        console.error("Error saving calendar events:", error)
      }
    }
  }, [events, isLoaded])

  const addEvent = useCallback((event: Omit<CalendarEvent, "id">) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: `${event.date}-${event.type}-${Date.now()}`,
    }
    setEvents((prev) => [...prev, newEvent])
  }, [])

  const removeEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const updateEvent = useCallback((id: string, updates: Partial<CalendarEvent>) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    )
  }, [])

  const getEventsByDate = useCallback(
    (date: string) => {
      return events.filter((e) => e.date === date)
    },
    [events]
  )

  const getEventsByMonth = useCallback(
    (year: number, month: number) => {
      const monthStr = String(month).padStart(2, "0")
      const monthPrefix = `${year}-${monthStr}`
      return events.filter((e) => e.date.startsWith(monthPrefix))
    },
    [events]
  )

  const isNationalHoliday = useCallback((date: string) => {
    return date in ALL_DOMINICAN_HOLIDAYS
  }, [])

  const getEventType = useCallback(
    (date: string, userId?: string) => {
      if (isNationalHoliday(date)) {
        return "national-holiday"
      }

      const userEvents = events.filter(
        (e) => e.date === date && (!userId || e.userId === userId)
      )

      if (userEvents.length > 0) {
        return userEvents[0].type
      }

      return null
    },
    [events, isNationalHoliday]
  )

  const value: CalendarContextType = {
    events,
    addEvent,
    removeEvent,
    updateEvent,
    getEventsByDate,
    getEventsByMonth,
    isNationalHoliday,
    getEventType,
  }

  return (
    <CalendarContext.Provider value={value}>
      {isLoaded ? children : <div className="flex items-center justify-center h-screen">Cargando...</div>}
    </CalendarContext.Provider>
  )
}

export function useCalendar() {
  const context = useContext(CalendarContext)
  if (!context) {
    throw new Error("useCalendar must be used within CalendarProvider")
  }
  return context
}