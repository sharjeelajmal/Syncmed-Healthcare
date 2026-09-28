import type { Metadata } from "next"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { CareersClient } from "./CareersClient"

export const metadata: Metadata = {
  title: "Careers | SyncMed Healthcare",
  description:
    "Join SyncMed's concierge care team. Open roles for doctors, registered nurses, physiotherapists, dietitians, psychologists and clinical staff.",
}

export default function CareersPage() {
  return (
    <div className="min-h-screen selection:bg-[#67BA2E]/20 font-sans flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16 px-4 md:px-8">
        <CareersClient />
      </main>
      <Footer />
    </div>
  )
}
