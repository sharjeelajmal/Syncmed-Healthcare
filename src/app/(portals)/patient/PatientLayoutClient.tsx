"use client"

import dynamic from "next/dynamic"
import { portalMainBottomPadding, portalShellClass } from "@/lib/portal-shell"
import { cn } from "@/lib/utils"
import {
  PatientPortalNavigation,
  PatientPortalBottomNav,
} from "./PatientPortalNavigation"
import { PortalShellDecor } from "@/components/portal/PortalShellDecor"
import { ClientBodyPortal } from "@/components/portal/ClientBodyPortal"

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
    <div className="portal-shell-bg flex min-h-screen flex-col">
      <PortalShellDecor />
      <PatientPortalNavigation userId={userId} />

      <main className={cn(portalShellClass, "relative z-[1] flex-1", portalMainBottomPadding)}>
        <div className="animate-in fade-in duration-300 ease-out fill-mode-both">
          {children}
        </div>
      </main>

      <PatientPortalBottomNav userId={userId} />

      <ClientBodyPortal>
        <PatientChatOverlay />
      </ClientBodyPortal>
    </div>
  )
}
