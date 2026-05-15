"use client"

import * as React from "react"
import { signOut } from "next-auth/react"
import { 
  LayoutDashboard, 
  Users, 
  Bell, 
  User,
  LogOut,
  Stethoscope
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChatOverlay } from "@/components/chat/ChatOverlay"

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
      icon: LayoutDashboard 
    },
    { 
      name: "My Patients", 
      href: "/provider/patients", 
      icon: Users 
    },
    { 
      name: "Schedule", 
      href: "/provider/schedule", 
      icon: Bell 
    },
    { 
      name: "My Profile", 
      href: "/provider/profile", 
      icon: User 
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Top Navbar (Desktop Only) */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="SyncMed Logo" className="h-14 w-auto object-contain" />
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/provider/dashboard" && pathname.startsWith(item.href))
                return (
                  <Link key={item.href} href={item.href}>
                    <Button 
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "font-bold transition-all",
                        isActive ? "text-[#67BA2E] bg-emerald-50" : "text-slate-500"
                      )}
                    >
                      <item.icon 
                        className={cn("mr-2 size-4", isActive && "fill-[#67BA2E]/20")} 
                      />
                      {item.name}
                    </Button>
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end mr-2 text-right">
              <span className="text-[10px] font-black text-[#67BA2E] uppercase tracking-widest">Medical Portal</span>
              <span className="text-xs font-bold text-slate-900 tracking-tight">Authorized Provider</span>
            </div>
            
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-sm">
              <Stethoscope className="size-5 text-[#67BA2E]" />
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

      {/* Main Content Area */}
      <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-6 py-3 pb-safe shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
        <nav className="flex items-center justify-between">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/provider/dashboard" && pathname.startsWith(item.href))
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
      {/* Global Chat Overlay */}
      <ChatOverlay />
    </div>
  )
}
