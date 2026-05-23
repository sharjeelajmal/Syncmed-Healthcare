"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { toast } from "sonner"
import { pusherClient } from "@/lib/pusher-client"
import { playAdminNotificationSound } from "@/lib/admin-notification-sound"
import { useDesktopNotifications } from "@/hooks/useDesktopNotifications"
import type {
  AdminActivityPayload,
  AdminNotification,
} from "@/types/admin-notifications"
import { ADMIN_NOTIFICATIONS_STORAGE_KEY } from "@/types/admin-notifications"

type AdminNotificationsContextValue = {
  notifications: AdminNotification[]
  unreadCount: number
  pushNotification: (payload: AdminActivityPayload) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
}

const AdminNotificationsContext =
  createContext<AdminNotificationsContextValue | null>(null)

function loadStoredNotifications(): AdminNotification[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(ADMIN_NOTIFICATIONS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as AdminNotification[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persistNotifications(notifications: AdminNotification[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(
      ADMIN_NOTIFICATIONS_STORAGE_KEY,
      JSON.stringify(notifications.slice(0, 100))
    )
  } catch {
    // Storage quota or private mode
  }
}

function createNotification(
  payload: AdminActivityPayload
): AdminNotification {
  return {
    id: crypto.randomUUID(),
    title: payload.title,
    message: payload.message,
    url: payload.url,
    createdAt: new Date().toISOString(),
    read: false,
  }
}

export function AdminNotificationsProvider({
  children,
}: {
  children: ReactNode
}) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [hydrated, setHydrated] = useState(false)
  const { triggerNotification } = useDesktopNotifications()

  useEffect(() => {
    setNotifications(loadStoredNotifications())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    persistNotifications(notifications)
  }, [notifications, hydrated])

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  )

  const pushNotification = useCallback(
    (payload: AdminActivityPayload) => {
      const entry = createNotification(payload)
      setNotifications((prev) => [entry, ...prev])
      playAdminNotificationSound()
      triggerNotification(payload.title, payload.message, payload.url)
      toast.info(payload.title, {
        description: payload.message,
        ...(payload.url
          ? {
              action: {
                label: "View",
                onClick: () => {
                  window.location.href = payload.url!
                },
              },
            }
          : {}),
      })
    },
    [triggerNotification]
  )

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  useEffect(() => {
    if (!pusherClient) return

    const channel = pusherClient.subscribe("admin-alerts")

    const handleNewActivity = (data: AdminActivityPayload) => {
      pushNotification(data)
    }

    channel.bind("new-activity", handleNewActivity)

    return () => {
      channel.unbind("new-activity", handleNewActivity)
      pusherClient.unsubscribe("admin-alerts")
    }
  }, [pushNotification])

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      pushNotification,
      markAsRead,
      markAllAsRead,
    }),
    [notifications, unreadCount, pushNotification, markAsRead, markAllAsRead]
  )

  return (
    <AdminNotificationsContext.Provider value={value}>
      {children}
    </AdminNotificationsContext.Provider>
  )
}

export function useAdminNotifications() {
  const ctx = useContext(AdminNotificationsContext)
  if (!ctx) {
    throw new Error(
      "useAdminNotifications must be used within AdminNotificationsProvider"
    )
  }
  return ctx
}
