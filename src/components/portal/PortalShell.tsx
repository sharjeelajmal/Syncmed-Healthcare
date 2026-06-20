import * as React from "react"
import { PortalShellDecor } from "@/components/portal/PortalShellDecor"

/** Shared premium mesh background for portals and public marketing pages. */
export function PortalShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      {/* Fixed layer — stays visible while scrolling and in gaps between cards */}
      <div aria-hidden className="portal-shell-bg pointer-events-none fixed inset-0 z-0" />
      <PortalShellDecor />

      <div className="relative z-[1] flex min-h-screen flex-col">{children}</div>
    </div>
  )
}
