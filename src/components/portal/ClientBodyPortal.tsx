"use client"

import * as React from "react"
import { createPortal } from "react-dom"

/** Renders children on document.body so fixed UI is never trapped by portal layout. */
export function ClientBodyPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(children, document.body)
}
