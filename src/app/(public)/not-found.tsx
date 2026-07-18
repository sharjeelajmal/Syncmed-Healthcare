import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { NotFoundView } from "@/components/errors/NotFoundView"

/** 404 on public pages — PortalShell comes from (public)/layout. */
export default function PublicNotFound() {
  return (
    <>
      <Navbar />
      <NotFoundView />
      <Footer />
    </>
  )
}
