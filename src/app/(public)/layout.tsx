import * as React from "react"
import { PortalShell } from "@/components/portal/PortalShell"

/** Same premium mesh background as patient/admin/provider portals. */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <PortalShell>{children}</PortalShell>
}
