import * as React from "react"
import { auth } from "@/../auth"
import prisma from "@/lib/prisma"
import { PatientPortalNavigation } from "./PatientPortalNavigation"
import { PatientChatOverlay } from "@/components/chat/PatientChatOverlay"

export default async function PatientPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  let unpaidCount = 0
  
  if (session?.user?.id) {
    // Count unpaid appointment primary bills
    const unpaidAppointmentsCount = await prisma.appointment.count({
      where: {
        patient: { userId: session.user.id },
        paymentStatus: "UNPAID"
      }
    })

    // Count unpaid secondary invoices
    const unpaidSecondaryInvoicesCount = await prisma.paymentInvoice.count({
      where: {
        patient: { userId: session.user.id },
        status: "PENDING"
      }
    })

    unpaidCount = unpaidAppointmentsCount + unpaidSecondaryInvoicesCount
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <PatientPortalNavigation unpaidCount={unpaidCount} />

      {/* Main Content Area */}
      <main className="container mx-auto max-w-7xl px-0 py-0 sm:px-0 sm:py-0 pb-32 md:pb-0">
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both">
          {children}
        </div>
      </main>

      <PatientChatOverlay />
    </div>
  )
}
