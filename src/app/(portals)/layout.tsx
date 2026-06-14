import * as React from "react"
import { PortalShell } from "@/components/portal/PortalShell"

export default function PortalRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <PortalShell>{children}</PortalShell>
}
