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

interface NavItem {
  name: string
  href: string
  icon: any
  badge?: number
}

interface PatientPortalNavigationProps {
  unpaidCount: number
}

export function PatientPortalNavigation({ unpaidCount }: PatientPortalNavigationProps) {
  const pathname = usePathname()

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
    <>
      {/* Top Navbar (Desktop Only) */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="SyncMed Logo" className="h-14 w-auto object-contain" />
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/patient/dashboard" && pathname.startsWith(item.href))
                return (
                  <Link key={item.href} href={item.href} className="relative">
                    <Button 
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "font-bold transition-all relative",
                        isActive ? "text-[#67BA2E] bg-emerald-50" : "text-slate-500"
                      )}
                    >
                      <item.icon 
                        className={cn("mr-2 size-4", isActive && "fill-[#67BA2E]/20")} 
                      />
                      {item.name}
                      
                      {item.badge && item.badge > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white shadow-sm ring-2 ring-white animate-pulse">
                          {item.badge}
                        </span>
                      )}
                    </Button>
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end mr-2 text-right">
              <span className="text-[10px] font-black text-[#67BA2E] uppercase tracking-widest">Patient Portal</span>
              <span className="text-xs font-bold text-slate-900 tracking-tight">Verified Member</span>
            </div>
            
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-sm">
              <ShieldCheck className="size-5 text-[#67BA2E]" />
            </div>

            <Button
              variant="outline"
              size="sm"
              className="rounded-lg border-slate-200 font-bold hover:bg-slate-50 transition-all ml-2"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="mr-2 size-4 text-red-500" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-6 py-3 pb-safe shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
        <nav className="flex items-center justify-between">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/patient/dashboard" && pathname.startsWith(item.href))
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className="flex flex-col items-center justify-center gap-1 group"
              >
                <div className={cn(
                  "p-2 rounded-2xl transition-all duration-300 relative",
                  isActive ? "bg-emerald-50 text-[#67BA2E] scale-110" : "text-slate-400 group-active:scale-95"
                )}>
                  <item.icon 
                    className={cn(
                      "size-6 transition-all",
                      isActive ? "fill-[#67BA2E]" : "fill-none stroke-[2px]"
                    )} 
                  />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-black text-white ring-2 ring-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest transition-all",
                  isActive ? "text-[#67BA2E] opacity-100" : "text-slate-400 opacity-60"
                )}>
                  {item.name}
                </span>
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
