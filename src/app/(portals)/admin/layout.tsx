"use client"

import * as React from "react"
import { signOut } from "next-auth/react"
import { 
  LogOut, 
  User, 
  LayoutDashboard, 
  Users, 
  Bell, 
  Stethoscope,
  Sparkles
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

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navItems = [
    { 
      name: "Dashboard", 
      href: "/admin/dashboard", 
      icon: LayoutDashboard 
    },
    { 
      name: "Providers", 
      href: "/admin/providers", 
      icon: Stethoscope 
    },
    { 
      name: "Patients", 
      href: "/admin/patients", 
      icon: Users 
    },
    { 
      name: "Schedule", 
      href: "/admin/appointments", 
      icon: Bell 
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
                const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href))
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
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Administrative Node</span>
              <span className="text-xs font-bold text-slate-900 tracking-tight">System Controller</span>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-100 transition-all">
                  <User className="size-5 text-slate-400" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl p-1 shadow-xl z-50">
                <DropdownMenuItem asChild className="cursor-pointer font-bold text-slate-700 p-2.5 hover:bg-emerald-50 hover:text-[#67BA2E]">
                  {pathname.startsWith('/admin/ai-panel') ? (
                    <Link href="/admin/dashboard">
                      <LayoutDashboard className="mr-2 size-4" /> Dashboard
                    </Link>
                  ) : (
                    <Link href="/admin/ai-panel">
                      <Sparkles className="mr-2 size-4" /> AI Management Hub
                    </Link>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer font-bold text-red-500 p-2.5 focus:bg-red-50 focus:text-red-600" onClick={() => signOut({ callbackUrl: "/login" })}>
                  <LogOut className="mr-2 size-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>


          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation (App Style) */}
      {!pathname.startsWith('/admin/ai-panel') && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-6 py-3 pb-safe shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
        <nav className="flex items-center justify-between">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href))
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
      )}
    </div>
  )
}
