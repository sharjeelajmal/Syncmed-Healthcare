"use client"

import * as React from "react"
import { useSession, signOut } from "next-auth/react"
import {
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  Users,
  Bell,
  Stethoscope,
  Sparkles,
  Settings2,
  Inbox,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AdminNotificationsProvider } from "@/contexts/AdminNotificationsContext"
import { NotificationBell } from "@/components/admin/NotificationBell"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  portalHeaderActionsClass,
  portalHeaderBrandClass,
  portalHeaderNavClass,
  portalHeaderRowClass,
  portalMainBottomPadding,
  portalBottomNavClass,
  portalShellClass,
} from "@/lib/portal-shell"

type AdminLayoutUser = {
  firstName?: string | null
  lastName?: string | null
  image?: string | null
  role?: string | null
}

export function AdminLayoutClient({
  children,
  user,
}: {
  children: React.ReactNode
  user: AdminLayoutUser | null
}) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName ?? ""}`
    : session?.user?.name || "System Administrator"
  const displayImage =
    user?.image ||
    (session?.user as { image?: string | null })?.image ||
    null

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Providers",
      href: "/admin/providers",
      icon: Stethoscope,
    },
    {
      name: "Patients",
      href: "/admin/patients",
      icon: Users,
    },
    {
      name: "Schedule",
      href: "/admin/appointments",
      icon: Bell,
    },
  ]

  return (
    <AdminNotificationsProvider>
      <div className="flex min-h-screen flex-col bg-slate-50">
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md overflow-x-hidden">
          <div className={portalShellClass}>
            <div className={portalHeaderRowClass}>
            <div className={portalHeaderBrandClass}>
              <Link href="/" className="flex shrink-0 items-center gap-2">
                <img
                  src="/logo.png"
                  alt="SyncMed Logo"
                  className="h-10 w-auto object-contain sm:h-11"
                />
              </Link>

              <nav className={portalHeaderNavClass}>
                {navItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/admin/dashboard" &&
                      pathname.startsWith(item.href))
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "font-bold transition-all",
                          isActive
                            ? "text-[#67BA2E] bg-emerald-50"
                            : "text-slate-500"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "mr-2 size-4",
                            isActive && "fill-[#67BA2E]/20"
                          )}
                        />
                        {item.name}
                      </Button>
                    </Link>
                  )
                })}
              </nav>
            </div>

            <div className={portalHeaderActionsClass}>
              <div className="hidden flex-col items-end text-right sm:flex">
                <span className="text-xs font-black uppercase tracking-widest text-[#67BA2E]">
                  ADMIN
                </span>
                <span className="text-[10px] font-bold tracking-tight text-slate-400 opacity-70">
                  {displayName.trim() || "System Administrator"}
                </span>
              </div>

              <NotificationBell />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Account menu"
                    className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 shadow-sm transition-all hover:border-[#67BA2E]/20 hover:bg-slate-100 hover:shadow-md active:scale-95"
                  >
                    {displayImage ? (
                      <img
                        src={displayImage}
                        alt="Profile"
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <UserIcon className="size-5 text-slate-400" />
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="z-50 w-56 rounded-xl p-1 shadow-xl"
                >
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer p-2.5 font-bold text-slate-700 hover:bg-emerald-50 hover:text-[#67BA2E]"
                  >
                    {pathname.startsWith("/admin/ai-panel") ? (
                      <Link href="/admin/dashboard">
                        <LayoutDashboard className="mr-2 size-4" /> Dashboard
                      </Link>
                    ) : (
                      <Link href="/admin/ai-panel">
                        <Sparkles className="mr-2 size-4" /> AI Management Hub
                      </Link>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer p-2.5 font-bold text-slate-700 hover:bg-emerald-50 hover:text-[#67BA2E]"
                  >
                    {pathname === "/admin/settings" ? (
                      <Link href="/admin/dashboard">
                        <LayoutDashboard className="mr-2 size-4" /> Dashboard
                      </Link>
                    ) : (
                      <Link href="/admin/settings">
                        <Settings2 className="mr-2 size-4" /> Site Settings
                      </Link>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer p-2.5 font-bold text-slate-700 hover:bg-emerald-50 hover:text-[#67BA2E]"
                  >
                    {pathname === "/admin/leads" ? (
                      <Link href="/admin/dashboard">
                        <LayoutDashboard className="mr-2 size-4" /> Dashboard
                      </Link>
                    ) : (
                      <Link href="/admin/leads">
                        <Inbox className="mr-2 size-4" /> Leads & Inquiries
                      </Link>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer p-2.5 font-bold text-red-500 focus:bg-red-50 focus:text-red-600"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                  >
                    <LogOut className="mr-2 size-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            </div>
          </div>
        </header>

        <main
          className={cn(
            portalShellClass,
            "pt-8",
            !pathname.startsWith("/admin/ai-panel")
              ? portalMainBottomPadding
              : "pb-8"
          )}
        >
          <div className="animate-in fade-in duration-300 ease-out fill-mode-both">
            {children}
          </div>
        </main>

        {!pathname.startsWith("/admin/ai-panel") && (
          <div className={portalBottomNavClass}>
            <nav className="flex items-center justify-between">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin/dashboard" &&
                    pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex flex-col items-center justify-center gap-1"
                  >
                    <div
                      className={cn(
                        "relative rounded-2xl p-2 transition-all duration-300",
                        isActive
                          ? "scale-110 bg-emerald-50 text-[#67BA2E]"
                          : "text-slate-400 group-active:scale-95"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "size-6 transition-all",
                          isActive
                            ? "fill-[#67BA2E]"
                            : "fill-none stroke-[2px]"
                        )}
                      />
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-black uppercase tracking-widest transition-all",
                        isActive
                          ? "text-[#67BA2E] opacity-100"
                          : "text-slate-400 opacity-60"
                      )}
                    >
                      {item.name}
                    </span>
                  </Link>
                )
              })}
            </nav>
          </div>
        )}
      </div>
    </AdminNotificationsProvider>
  )
}
