/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

export type ActivityType =
  | "auth.login"
  | "auth.logout"
  | "user.created"
  | "employee.created"
  | "employee.deleted"
  | "profile.updated"
  | "request.created"
  | "request.approved"
  | "request.rejected"
  | "loan.created"
  | "payroll.processed"
  | "system.alert"
  | "generic"

export type ActivityActor = {
  id?: string
  name?: string
  email?: string
  role?: string
}

export type ActivityEntry = {
  id: string
  ts: number
  type: ActivityType
  message: string
  actor?: ActivityActor
  meta?: Record<string, any>
}

const STORAGE_KEY = "rrhh_activity_v1"
const MAX_ENTRIES = 250

function safeParse(value: string | null): ActivityEntry[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(Boolean)
  } catch {
    return []
  }
}

export function getActivities(): ActivityEntry[] {
  return safeParse(localStorage.getItem(STORAGE_KEY))
}

export function logActivity(input: Omit<ActivityEntry, "id" | "ts"> & Partial<Pick<ActivityEntry, "id" | "ts">>) {
  const entry: ActivityEntry = {
    id: input.id ?? crypto.randomUUID(),
    ts: input.ts ?? Date.now(),
    type: input.type,
    message: input.message,
    actor: input.actor,
    meta: input.meta,
  }

  const current = getActivities()
  const next = [entry, ...current].slice(0, MAX_ENTRIES)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))

  // Trigger same-tab listeners
  window.dispatchEvent(new CustomEvent("rrhh:activity", { detail: entry }))
}

export function clearActivities() {
  localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new CustomEvent("rrhh:activity-cleared"))
}

export function subscribeActivities(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) onChange()
  }
  const onCustom = () => onChange()
  window.addEventListener("storage", onStorage)
  window.addEventListener("rrhh:activity", onCustom as EventListener)
  window.addEventListener("rrhh:activity-cleared", onCustom as EventListener)
  return () => {
    window.removeEventListener("storage", onStorage)
    window.removeEventListener("rrhh:activity", onCustom as EventListener)
    window.removeEventListener("rrhh:activity-cleared", onCustom as EventListener)
  }
}

