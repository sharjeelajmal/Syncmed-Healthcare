"use client"

import dynamic from "next/dynamic"
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

      <main className="container mx-auto max-w-7xl px-0 py-0 pb-32 sm:px-0 sm:pb-0 md:pb-0">
        <div className="animate-in fade-in duration-300 ease-out fill-mode-both">
          {children}
        </div>
      </main>

      <PatientChatOverlay />
    </div>
  )
}
