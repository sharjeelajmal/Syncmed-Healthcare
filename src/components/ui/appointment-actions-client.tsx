"use client"

import * as React from "react"
import Link from "next/link"
import { MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AppointmentDetailsModal } from "@/components/ui/appointment-details-modal"

export function AppointmentActionsClient({ appointment }: { appointment: any }) {
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  return (
    <>
      <div className="flex flex-col gap-3 min-w-[200px]">
        <Button
          onClick={() => setIsModalOpen(true)}
          className="h-12 bg-[#67BA2E] hover:bg-[#5aa827] text-white font-black rounded-xl shadow-lg shadow-emerald-100 transition-all uppercase tracking-widest text-xs"
        >
          View Details
        </Button>

        <Button asChild variant="outline" className="h-12 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all rounded-xl uppercase tracking-widest text-xs gap-2">
          <Link href="/patient/appointments">
            <MessageSquare className="size-4" />
            Check Appointments
          </Link>
        </Button>
      </div>

      <AppointmentDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        appointment={appointment}
      />
    </>
  )
}
