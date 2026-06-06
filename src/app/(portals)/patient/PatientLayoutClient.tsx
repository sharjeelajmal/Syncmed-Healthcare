"use client"

import dynamic from "next/dynamic"
import { portalMainBottomPadding, portalShellClass } from "@/lib/portal-shell"
import { cn } from "@/lib/utils"
import { PatientPortalNavigation } from "./PatientPortalNavigation"

const PatientChatOverlay = dynamic(
  () =>
    import("@/components/chat/PatientChatOverlay").then(
      (mod) => mod.PatientChatOverlay
    ),
  { ssr: false, loading: () => null }
)

export function PatientLayoutClient({
  children,
  userId,
}: {
  children: React.ReactNode
  userId: string | null
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <PatientPortalNavigation userId={userId} />

      <main className={cn(portalShellClass, portalMainBottomPadding)}>
        <div className="animate-in fade-in duration-300 ease-out fill-mode-both">
          {children}
        </div>
      </main>

      <PatientChatOverlay />
    </div>
  )
}
