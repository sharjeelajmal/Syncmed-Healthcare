"use client"

import * as React from "react"
import { signOut } from "next-auth/react"
import { 
  LayoutDashboard, 
  Bell, 
  HeartPulse, 
  Wallet,
  LogOut,
  ShieldCheck
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  portalHeaderActionsClass,
  portalHeaderBrandClass,
  portalHeaderNavClass,
  portalHeaderRowClass,
  portalBottomNavClass,
  portalShellClass,
} from "@/lib/portal-shell"
import { fetchPatientUnpaidCountAction } from "@/app/actions/patient.actions"

interface NavItem {
  name: string
  href: string
  icon: any
  badge?: number
}

interface PatientPortalNavigationProps {
  userId: string | null
}

export function PatientPortalNavigation({ userId }: PatientPortalNavigationProps) {
  const pathname = usePathname()
  const [unpaidCount, setUnpaidCount] = React.useState(0)

  React.useEffect(() => {
    if (!userId) return

    let cancelled = false
    fetchPatientUnpaidCountAction(userId).then((count) => {
      if (!cancelled) setUnpaidCount(count)
    })

    return () => {
      cancelled = true
    }
  }, [userId])

  const navItems: NavItem[] = [
    { 
      name: "Home", 
      href: "/patient/dashboard", 
      icon: LayoutDashboard 
    },
    { 
      name: "Appointments", 
      href: "/patient/appointments", 
      icon: Bell 
    },
    { 
      name: "My Health", 
      href: "/patient/records", 
      icon: HeartPulse 
    },
    { 
      name: "Billing", 
      href: "/patient/billing", 
      icon: Wallet,
      badge: unpaidCount
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full overflow-x-clip border-b bg-white/80 backdrop-blur-md">
        <div className={portalShellClass}>
          <div className={cn(portalHeaderRowClass, "py-1")}>
            <div className={portalHeaderBrandClass}>
              <Link href="/" className="flex shrink-0 items-center gap-2">
                <img src="/logo.png" alt="SyncMed Logo" className="h-10 w-auto object-contain sm:h-11" />
              </Link>

              <nav className={cn(portalHeaderNavClass, "flex-1 gap-0.5 xl:gap-1")}>
                {navItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/patient/dashboard" && pathname.startsWith(item.href))
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="relative shrink-0 overflow-visible pt-1"
                      title={item.name}
                      aria-label={item.name}
                    >
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        size="sm"
                        className={cn(
                          "relative h-9 overflow-visible px-2 pr-3 font-bold transition-all sm:px-2.5 sm:pr-3.5 xl:px-3 xl:pr-4",
                          isActive ? "text-[#67BA2E] bg-emerald-50" : "text-slate-500"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "size-4 shrink-0 xl:mr-2",
                            isActive && "fill-[#67BA2E]/20"
                          )}
                        />
                        <span className="hidden xl:inline">{item.name}</span>

                        {item.badge != null && item.badge > 0 && (
                          <span className="pointer-events-none absolute -top-0.5 right-0 z-10 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black leading-none text-white shadow-sm ring-2 ring-white animate-pulse">
                            {item.badge > 9 ? "9+" : item.badge}
                          </span>
                        )}
                      </Button>
                    </Link>
                  )
                })}
              </nav>
            </div>

            <div className={portalHeaderActionsClass}>
              <div className="mr-2 hidden flex-col items-end text-right xl:flex">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#67BA2E]">
                  Patient Portal
                </span>
                <span className="text-xs font-bold tracking-tight text-slate-900">
                  Verified Member
                </span>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 shadow-sm">
                <ShieldCheck className="size-5 text-[#67BA2E]" />
              </div>

              <Button
                variant="outline"
                size="sm"
                className="ml-1 shrink-0 rounded-lg border-slate-200 font-bold transition-all hover:bg-slate-50 xl:ml-2"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="size-4 text-red-500 xl:mr-2" />
                <span className="hidden xl:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>
  )
}

export function PatientPortalBottomNav({ userId }: { userId: string | null }) {
  const pathname = usePathname()
  const [unpaidCount, setUnpaidCount] = React.useState(0)

  React.useEffect(() => {
    if (!userId) return

    let cancelled = false
    fetchPatientUnpaidCountAction(userId).then((count) => {
      if (!cancelled) setUnpaidCount(count)
    })

    return () => {
      cancelled = true
    }
  }, [userId])

  const navItems: NavItem[] = [
    { name: "Home", href: "/patient/dashboard", icon: LayoutDashboard },
    { name: "Appointments", href: "/patient/appointments", icon: Bell },
    { name: "My Health", href: "/patient/records", icon: HeartPulse },
    { name: "Billing", href: "/patient/billing", icon: Wallet, badge: unpaidCount },
  ]

  return (
    <div className={portalBottomNavClass}>
      <nav className="flex items-center justify-between">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/patient/dashboard" && pathname.startsWith(item.href))
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
                    isActive ? "fill-[#67BA2E]" : "fill-none stroke-[2px]"
                  )}
                />
                {item.badge != null && item.badge > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 animate-pulse items-center justify-center rounded-full bg-red-500 text-[8px] font-black text-white ring-2 ring-white">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-black uppercase tracking-widest transition-all",
                  isActive ? "text-[#67BA2E] opacity-100" : "text-slate-400 opacity-60"
                )}
              >
                {item.name}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
