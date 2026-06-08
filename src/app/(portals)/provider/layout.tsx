"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  Users,
  Bell,
  User,
  LogOut,
  Stethoscope,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { PortalShellDecor } from "@/components/portal/PortalShellDecor"
import { ClientBodyPortal } from "@/components/portal/ClientBodyPortal"
import {
  portalHeaderActionsClass,
  portalHeaderBrandClass,
  portalHeaderNavClass,
  portalHeaderRowClass,
  portalMainBottomPadding,
  portalBottomNavClass,
  portalShellClass,
} from "@/lib/portal-shell"

const ChatOverlay = dynamic(
  () =>
    import("@/components/chat/ChatOverlay").then((mod) => mod.ChatOverlay),
  { ssr: false, loading: () => null }
)

export default function ProviderPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navItems = [
    {
      name: "Overview",
      href: "/provider/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "My Patients",
      href: "/provider/patients",
      icon: Users,
    },
    {
      name: "Schedule",
      href: "/provider/schedule",
      icon: Bell,
    },
    {
      name: "My Profile",
      href: "/provider/profile",
      icon: User,
    },
  ]

  return (
    <div className="portal-shell-bg flex min-h-screen flex-col">
      <PortalShellDecor />
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
                  (item.href !== "/provider/dashboard" &&
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
            <div className="mr-2 hidden flex-col items-end text-right sm:flex">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#67BA2E]">
                Medical Portal
              </span>
              <span className="text-xs font-bold tracking-tight text-slate-900">
                Authorized Provider
              </span>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 shadow-sm">
              <Stethoscope className="size-5 text-[#67BA2E]" />
            </div>

            <Button
              variant="outline"
              size="sm"
              className="ml-2 rounded-lg border-slate-200 font-bold transition-all hover:bg-slate-50"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="mr-2 size-4 text-red-500" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
          </div>
        </div>
      </header>

      <main className={cn(portalShellClass, "relative z-[1] flex-1 pt-8", portalMainBottomPadding)}>
        <div className="animate-in fade-in duration-300 ease-out fill-mode-both">
          {children}
        </div>
      </main>

      <div className={portalBottomNavClass}>
        <nav className="flex items-center justify-between">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/provider/dashboard" &&
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

      <ClientBodyPortal>
        <ChatOverlay />
      </ClientBodyPortal>
    </div>
  )
}
