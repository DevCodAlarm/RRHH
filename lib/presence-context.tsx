"use client"

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import type { UserRole } from "@/lib/auth-context"

type PresenceCheckTrigger = "login" | "hourly" | "manual"

export interface PresenceEvent {
  id: string
  timestamp: string
  trigger: PresenceCheckTrigger
  geofenceOk: boolean
  facialScore: number
  confidenceScore: number
  notes: string
}

interface RoleSecurityPolicy {
  requireGeofence: boolean
  requireFacial: boolean
  checkIntervalMinutes: number
  minimumScore: number
}

interface PresenceContextType {
  score: number
  events: PresenceEvent[]
  isChecking: boolean
  inGeofence: boolean | null
  hasAlert: boolean
  rolePolicy: RoleSecurityPolicy | null
  requestPresenceCheck: (trigger?: PresenceCheckTrigger) => Promise<PresenceEvent | null>
  setCurrentRole: (role: UserRole | null) => void
}

const PRESENCE_STORAGE_KEY = "rrhh_presence_events_v1"

const COMPANY_GEOFENCE = {
  label: "Sede principal",
  latitude: 18.4861,
  longitude: -69.9312,
  radiusMeters: 500,
}

const ROLE_POLICIES: Record<UserRole, RoleSecurityPolicy> = {
  admin: { requireGeofence: false, requireFacial: false, checkIntervalMinutes: 180, minimumScore: 95 },
  rrhh: { requireGeofence: true, requireFacial: true, checkIntervalMinutes: 120, minimumScore: 95 },
  supervisor: { requireGeofence: true, requireFacial: true, checkIntervalMinutes: 120, minimumScore: 95 },
  empleado: { requireGeofence: true, requireFacial: true, checkIntervalMinutes: 60, minimumScore: 95 },
}

const PresenceContext = createContext<PresenceContextType | undefined>(undefined)

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRadians = (value: number) => (value * Math.PI) / 180
  const earthRadius = 6371000
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return earthRadius * c
}

async function getCurrentPosition(): Promise<GeolocationPosition | null> {
  if (!("geolocation" in navigator)) {
    return null
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      () => resolve(null),
      { timeout: 8000, enableHighAccuracy: true }
    )
  })
}

export function PresenceProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<PresenceEvent[]>([])
  const [score, setScore] = useState(100)
  const [isChecking, setIsChecking] = useState(false)
  const [inGeofence, setInGeofence] = useState<boolean | null>(null)
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(PRESENCE_STORAGE_KEY)
    if (!stored) return
    try {
      const parsed: PresenceEvent[] = JSON.parse(stored)
      setEvents(parsed)
      const last = parsed[0]
      if (last) {
        setScore(last.confidenceScore)
      }
    } catch {
      setEvents([])
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(PRESENCE_STORAGE_KEY, JSON.stringify(events))
  }, [events])

  const rolePolicy = currentRole ? ROLE_POLICIES[currentRole] : null

  const requestPresenceCheck = async (trigger: PresenceCheckTrigger = "manual") => {
    if (!rolePolicy) return null

    setIsChecking(true)
    const position = await getCurrentPosition()
    let geofenceOk = true
    let notes = "Validacion completada"

    if (rolePolicy.requireGeofence) {
      if (!position) {
        geofenceOk = false
        notes = "No se pudo validar geolocalizacion"
      } else {
        const distance = calculateDistanceMeters(
          position.coords.latitude,
          position.coords.longitude,
          COMPANY_GEOFENCE.latitude,
          COMPANY_GEOFENCE.longitude
        )
        geofenceOk = distance <= COMPANY_GEOFENCE.radiusMeters
        notes = geofenceOk
          ? `Dentro de geocerca (${COMPANY_GEOFENCE.label})`
          : `Fuera de geocerca (${Math.round(distance)}m de distancia)`
      }
    }

    setInGeofence(geofenceOk)

    const facialScore = rolePolicy.requireFacial ? randomBetween(88, 100) : 100
    const nextScore = Math.max(
      0,
      Math.min(
        100,
        score - (geofenceOk ? 0 : 8) - (facialScore < 95 ? 4 : 0) + (geofenceOk && facialScore >= 95 ? 2 : 0)
      )
    )

    const event: PresenceEvent = {
      id: `presence-${crypto.randomUUID()}`,
      timestamp: new Date().toISOString(),
      trigger,
      geofenceOk,
      facialScore,
      confidenceScore: nextScore,
      notes,
    }

    setScore(nextScore)
    setEvents((prev) => [event, ...prev].slice(0, 100))
    setIsChecking(false)
    return event
  }

  useEffect(() => {
    if (!rolePolicy) return

    void requestPresenceCheck("login")

    if (intervalRef.current) {
      window.clearInterval(intervalRef.current)
    }

    intervalRef.current = window.setInterval(() => {
      void requestPresenceCheck("hourly")
    }, rolePolicy.checkIntervalMinutes * 60 * 1000)

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRole])

  const value = useMemo<PresenceContextType>(
    () => ({
      score,
      events,
      isChecking,
      inGeofence,
      hasAlert: !!rolePolicy && score < rolePolicy.minimumScore,
      rolePolicy,
      requestPresenceCheck,
      setCurrentRole,
    }),
    [score, events, isChecking, inGeofence, rolePolicy]
  )

  return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>
}

export function usePresence() {
  const context = useContext(PresenceContext)
  if (!context) {
    throw new Error("usePresence must be used within PresenceProvider")
  }
  return context
}
