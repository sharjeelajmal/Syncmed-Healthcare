export type AdminActivityPayload = {
  title: string
  message: string
  url?: string
}

export type AdminNotification = {
  id: string
  title: string
  message: string
  url?: string
  createdAt: string
  read: boolean
}

export const ADMIN_NOTIFICATIONS_STORAGE_KEY =
  "syncmed-admin-notifications"

export const ADMIN_NOTIFICATIONS_PAGE_SIZE = 10
