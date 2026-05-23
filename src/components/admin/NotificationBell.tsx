"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Bell, ChevronLeft, ChevronRight } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAdminNotifications } from "@/contexts/AdminNotificationsContext"
import { ADMIN_NOTIFICATIONS_PAGE_SIZE } from "@/types/admin-notifications"

export function NotificationBell() {
  const router = useRouter()
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useAdminNotifications()
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(1)

  const sorted = useMemo(
    () =>
      [...notifications].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [notifications]
  )

  const totalPages = Math.max(
    1,
    Math.ceil(sorted.length / ADMIN_NOTIFICATIONS_PAGE_SIZE)
  )

  const safePage = Math.min(page, totalPages)
  const pageStart = (safePage - 1) * ADMIN_NOTIFICATIONS_PAGE_SIZE

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])
  const pageItems = sorted.slice(
    pageStart,
    pageStart + ADMIN_NOTIFICATIONS_PAGE_SIZE
  )

  const canGoPrevious = safePage > 1
  const canGoNext =
    pageItems.length >= ADMIN_NOTIFICATIONS_PAGE_SIZE &&
    safePage < totalPages

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) setPage(1)
  }

  const handleItemClick = (id: string, url?: string) => {
    markAsRead(id)
    setOpen(false)
    if (url) router.push(url)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="relative size-10 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white text-slate-500 shadow-sm transition-all hover:border-[#67BA2E]/30 hover:bg-emerald-50/50 hover:text-[#67BA2E] hover:shadow-md active:scale-95"
        >
          <Bell className="size-5 stroke-[2px]" />
          {unreadCount > 0 && (
            <span
              className="absolute -right-1 -top-1 flex size-5 min-w-5 items-center justify-center rounded-full bg-[#67BA2E] px-1 text-[10px] font-black text-white animate-pulse"
              aria-live="polite"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[min(100vw-2rem,22rem)] rounded-2xl border border-slate-200 bg-white p-0 shadow-xl ring-1 ring-slate-200/60 sm:w-96"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div>
            <h3 className="text-sm font-black tracking-tight text-slate-800">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#67BA2E]">
                {unreadCount} unread
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={unreadCount === 0}
            onClick={markAllAsRead}
            className="h-8 rounded-lg px-2.5 text-[10px] font-black uppercase tracking-wider text-[#67BA2E] hover:bg-emerald-50 disabled:opacity-40"
          >
            Mark all as read
          </Button>
        </div>

        <div className="max-h-[min(50vh,20rem)] overflow-y-auto overscroll-contain">
          {pageItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                <Bell className="size-5" />
              </div>
              <p className="text-sm font-bold text-slate-700">All caught up</p>
              <p className="text-xs text-slate-500">
                New appointments and payments will appear here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {pageItems.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleItemClick(item.id, item.url)}
                    className={cn(
                      "w-full px-4 py-3 text-left transition-colors hover:bg-emerald-50/40",
                      !item.read &&
                        "bg-slate-50/80 border-l-2 border-l-[#67BA2E] pl-[calc(1rem-2px)]"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          "text-sm leading-snug",
                          item.read
                            ? "font-semibold text-slate-700"
                            : "font-bold text-slate-800"
                        )}
                      >
                        {item.title}
                      </p>
                      <span className="shrink-0 text-[10px] font-bold text-slate-400">
                        {formatDistanceToNow(new Date(item.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                      {item.message}
                    </p>
                    {!item.read && (
                      <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-[#67BA2E]">
                        New
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {sorted.length > 0 && (
          <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/50 px-3 py-2.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!canGoPrevious}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 gap-1 px-2 text-[10px] font-bold text-slate-600 hover:text-[#67BA2E] disabled:opacity-40"
            >
              <ChevronLeft className="size-3.5" />
              Previous
            </Button>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Page {safePage} of {totalPages}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!canGoNext}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 gap-1 px-2 text-[10px] font-bold text-slate-600 hover:text-[#67BA2E] disabled:opacity-40"
            >
              Next
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
