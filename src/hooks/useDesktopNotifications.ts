"use client"

import { useEffect, useCallback } from "react"

export function useDesktopNotifications() {
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission()
      }
    }
  }, [])

  const triggerNotification = useCallback(
    (title: string, body: string, url?: string) => {
      if (!("Notification" in window) || Notification.permission !== "granted") {
        return
      }

      const notification = new Notification(title, {
        body,
        icon: "/favicon.ico",
        tag: "syncmed-alert",
        requireInteraction: true,
      })

      if (url) {
        notification.onclick = () => {
          window.focus()
          window.location.href = url
        }
      }
    },
    []
  )

  return { triggerNotification }
}
