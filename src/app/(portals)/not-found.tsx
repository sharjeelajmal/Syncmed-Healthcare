import { NotFoundView } from "@/components/errors/NotFoundView"

/** 404 inside portals — shell + nav already provided by (portals)/layout. */
export default function PortalNotFound() {
  return <NotFoundView />
}
