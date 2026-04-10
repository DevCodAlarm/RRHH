"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"

export interface Announcement {
  id: string
  title: string
  content: string
  isRequired: boolean
  createdBy: string
  createdAt: Date
  expiresAt?: Date
  readBy: string[] // Array de user IDs que lo han leído
}

export interface UserAnnouncementRead {
  userId: string
  announcementId: string
  readAt: Date
}

export interface AnnouncementsContextType {
  announcements: Announcement[]
  userReads: UserAnnouncementRead[]
  addAnnouncement: (announcement: Omit<Announcement, "id" | "createdAt" | "readBy">) => void
  removeAnnouncement: (id: string) => void
  markAsRead: (announcementId: string, userId: string) => void
  getUnreadAnnouncements: (userId: string) => Announcement[]
  getUnreadCount: (userId: string) => number
  hasReadAnnouncement: (announcementId: string, userId: string) => boolean
}

const AnnouncementsContext = createContext<AnnouncementsContextType | undefined>(undefined)

const ANNOUNCEMENTS_STORAGE_KEY = "announcements"
const USER_READS_STORAGE_KEY = "announcement_reads"

export function AnnouncementsProvider({ children }: { children: ReactNode }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [userReads, setUserReads] = useState<UserAnnouncementRead[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Cargar datos del localStorage
  useEffect(() => {
    try {
      const storedAnnouncements = localStorage.getItem(ANNOUNCEMENTS_STORAGE_KEY)
      const storedReads = localStorage.getItem(USER_READS_STORAGE_KEY)

      if (storedAnnouncements) {
        const parsed = JSON.parse(storedAnnouncements)
        // Convertir las fechas de string a Date
        setAnnouncements(
          parsed.map((a: any) => ({
            ...a,
            createdAt: new Date(a.createdAt),
            expiresAt: a.expiresAt ? new Date(a.expiresAt) : undefined,
          }))
        )
      }

      if (storedReads) {
        const parsed = JSON.parse(storedReads)
        setUserReads(
          parsed.map((r: any) => ({
            ...r,
            readAt: new Date(r.readAt),
          }))
        )
      }

      setIsLoaded(true)
    } catch (error) {
      console.error("Error loading announcements:", error)
      setIsLoaded(true)
    }
  }, [])

  // Guardar anuncios en localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(announcements))
      } catch (error) {
        console.error("Error saving announcements:", error)
      }
    }
  }, [announcements, isLoaded])

  // Guardar lecturas en localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(USER_READS_STORAGE_KEY, JSON.stringify(userReads))
      } catch (error) {
        console.error("Error saving announcement reads:", error)
      }
    }
  }, [userReads, isLoaded])

  const addAnnouncement = useCallback(
    (announcement: Omit<Announcement, "id" | "createdAt" | "readBy">) => {
      const newAnnouncement: Announcement = {
        ...announcement,
        id: `ann-${Date.now()}`,
        createdAt: new Date(),
        readBy: [],
      }
      setAnnouncements((prev) => [newAnnouncement, ...prev])
    },
    []
  )

  const removeAnnouncement = useCallback((id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id))
    setUserReads((prev) => prev.filter((r) => r.announcementId !== id))
  }, [])

  const markAsRead = useCallback((announcementId: string, userId: string) => {
    // Actualizar el announcement
    setAnnouncements((prev) =>
      prev.map((a) =>
        a.id === announcementId && !a.readBy.includes(userId)
          ? { ...a, readBy: [...a.readBy, userId] }
          : a
      )
    )

    // Registrar la lectura
    const read: UserAnnouncementRead = {
      userId,
      announcementId,
      readAt: new Date(),
    }

    setUserReads((prev) => {
      const exists = prev.some((r) => r.userId === userId && r.announcementId === announcementId)
      return exists ? prev : [...prev, read]
    })
  }, [])

  const getUnreadAnnouncements = useCallback(
    (userId: string) => {
      return announcements.filter((a) => !a.readBy.includes(userId))
    },
    [announcements]
  )

  const getUnreadCount = useCallback(
    (userId: string) => {
      return getUnreadAnnouncements(userId).length
    },
    [getUnreadAnnouncements]
  )

  const hasReadAnnouncement = useCallback(
    (announcementId: string, userId: string) => {
      return announcements.find((a) => a.id === announcementId)?.readBy.includes(userId) ?? false
    },
    [announcements]
  )

  const value: AnnouncementsContextType = {
    announcements,
    userReads,
    addAnnouncement,
    removeAnnouncement,
    markAsRead,
    getUnreadAnnouncements,
    getUnreadCount,
    hasReadAnnouncement,
  }

  return (
    <AnnouncementsContext.Provider value={value}>
      {isLoaded ? children : <div>Cargando anuncios...</div>}
    </AnnouncementsContext.Provider>
  )
}

export function useAnnouncements() {
  const context = useContext(AnnouncementsContext)
  if (!context) {
    throw new Error("useAnnouncements must be used within AnnouncementsProvider")
  }
  return context
}
