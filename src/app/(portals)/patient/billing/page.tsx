import * as React from "react"
import { CreditCard } from "lucide-react"
import prisma from "@/lib/prisma"
import { BillingClient } from "./BillingClient"

import { auth } from "@/../auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const params = await searchParams
  const query = params?.query || ""

  // Fetch the real patient profile associated with the logged-in user
  const patient = await prisma.patientProfile.findUnique({
    where: { userId: (session.user as any).id },
    include: { user: true }
  });

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-slate-500 font-bold uppercase tracking-widest">Patient Profile Not Found</p>
      </div>
    )
  }

  // Fetch COMPLETED appointments as billable encounters
  const allAppointments = await prisma.appointment.findMany({
    where: { 
      patientId: patient.id,
      status: { in: ["COMPLETED", "PENDING", "SCHEDULED"] }
    },
    include: {
      provider: {
        include: { user: true }
      }
    },
    orderBy: { scheduledAt: 'desc' }
  })

  // Fetch secondary PaymentInvoices
  const secondaryInvoices = await prisma.paymentInvoice.findMany({
    where: { patientId: patient.id },
    orderBy: { createdAt: 'desc' }
  })

  // Unify data for the client
  const billingItems = [
    ...allAppointments.map(a => ({
      id: a.id,
      type: "APPOINTMENT" as const,
      date: a.scheduledAt,
      amount: a.amount,
      status: a.paymentStatus, // UNPAID, PAID, VERIFICATION_PENDING
      clinician: `Dr. ${a.provider.user.firstName} ${a.provider.user.lastName}`,
      specialty: a.provider.specialty,
      initials: `${a.provider.user.firstName[0]}${a.provider.user.lastName[0]}`
    })),
    ...secondaryInvoices.map(i => ({
      id: i.id,
      type: "SECONDARY" as const,
      date: i.createdAt,
      amount: i.amount,
      status: i.status === "PENDING" ? "UNPAID" : i.status === "VERIFIED" ? "PAID" : "REJECTED",
      clinician: "Clinical Services",
      specialty: "Post-Visit Charges",
      initials: "CS"
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Filter based on search query
  const filteredItems = billingItems.filter(item => {
    if (!query) return true;
    const q = query.toLowerCase();
    return item.clinician.toLowerCase().includes(q) || 
           item.id.toLowerCase().includes(q) || 
           item.specialty.toLowerCase().includes(q);
  });

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="animate-slide-up pb-10">
        {/* Header */}
        <div className="flex flex-col gap-2 mb-10">
          <h1 className="text-3xl font-black tracking-tight text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-[#67BA2E]/10 rounded-xl">
               <CreditCard className="size-8 text-[#67BA2E]" />
            </div>
            Billing & Payments
          </h1>
          <p className="text-slate-500 font-medium ml-1">Manage your invoices and upload payment proofs for clinical visits.</p>
        </div>

        {/* Content */}
        <BillingClient invoices={filteredItems} />
      </div>
    </div>
  )
}
