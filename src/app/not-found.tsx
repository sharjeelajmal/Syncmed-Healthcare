import { PortalShell } from "@/components/portal/PortalShell"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { NotFoundView } from "@/components/errors/NotFoundView"

export default function NotFound() {
  return (
    <PortalShell>
      <Navbar />
      <NotFoundView />
      <Footer />
    </PortalShell>
  )
}
