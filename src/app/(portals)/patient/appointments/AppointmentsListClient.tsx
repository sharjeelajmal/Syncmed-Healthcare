"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AppointmentBookingModal } from "@/components/ui/appointment-booking-modal"
import { DebouncedSearch } from "@/components/ui/debounced-search"

export function AppointmentsListClient({ 
  patientId, 
  providers, 
  children 
}: { 
  patientId: string, 
  providers: any[], 
  children: React.ReactNode 
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isBookingOpen, setIsBookingOpen] = React.useState(false)

  // Auto-open modal if ?openBooking=true
  React.useEffect(() => {
    if (searchParams.get("openBooking") === "true") {
      setIsBookingOpen(true)
      // Clean up URL without triggering refresh
      const newUrl = window.location.pathname
      window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl)
    }
  }, [searchParams])

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <DebouncedSearch placeholder="Search by provider or specialty..." />
        <Button 
          onClick={() => setIsBookingOpen(true)}
          className="h-12 w-full md:px-8 bg-[#67BA2E] hover:bg-[#5aa827] text-white font-bold rounded-xl shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2 border-0"
        >
          <Plus className="size-5" />
          Book New Appointment
        </Button>
      </div>

      <div className="animate-slide-up">
        {children}
      </div>

      <AppointmentBookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        patientId={patientId} 
        providers={providers} 
      />
    </>
  )
}
