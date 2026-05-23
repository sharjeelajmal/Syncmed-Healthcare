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
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="SyncMed Logo"
                className="h-14 w-auto object-contain"
              />
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
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

          <div className="flex items-center gap-3">
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
      </header>

      <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-in fade-in duration-300 ease-out fill-mode-both">
          {children}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 px-6 py-3 pb-safe shadow-[0_-8px_30px_rgb(0,0,0,0.04)] backdrop-blur-lg md:hidden">
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

      <ChatOverlay />
    </div>
  )
}
