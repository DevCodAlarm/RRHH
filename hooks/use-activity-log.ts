"use client"

import { useEffect, useMemo, useState } from "react"
import type { ActivityEntry } from "@/lib/activity-log"
import { clearActivities, getActivities, subscribeActivities } from "@/lib/activity-log"

const READ_KEY_PREFIX = "rrhh_activity_last_read_v1:"

export function useActivityLog(userId?: string) {
  const [activities, setActivities] = useState<ActivityEntry[]>([])

  useEffect(() => {
    setActivities(getActivities())
    return subscribeActivities(() => setActivities(getActivities()))
  }, [])

  const lastReadTs = useMemo(() => {
    if (!userId) return 0
    const raw = localStorage.getItem(`${READ_KEY_PREFIX}${userId}`)
    const parsed = raw ? Number(raw) : 0
    return Number.isFinite(parsed) ? parsed : 0
  }, [userId, activities.length])

  const unreadCount = useMemo(() => {
    if (!userId) return 0
    return activities.filter((a) => a.ts > lastReadTs).length
  }, [activities, lastReadTs, userId])

  function markAllRead() {
    if (!userId) return
    localStorage.setItem(`${READ_KEY_PREFIX}${userId}`, String(Date.now()))
    // force recalculation
    setActivities(getActivities())
  }

  return {
    activities,
    unreadCount,
    markAllRead,
    clear: clearActivities,
  }
}

