import * as React from "react"
import { CreditCard } from "lucide-react"
import prisma from "@/lib/prisma"
import { BillingClient } from "./BillingClient"

export const dynamic = "force-dynamic"

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>
}) {
  const params = await searchParams
  const query = params?.query || ""

  // MOCK AUTH: Fetch deterministic patient
  const patient = await prisma.patientProfile.findFirst({
    orderBy: { user: { createdAt: 'asc' } },
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

  // Filter appointments based on search query
  const appointments = allAppointments.filter(appt => {
    if (!query) return true;
    const q = query.toLowerCase();
    const clinicianName = `${appt.provider.user.firstName} ${appt.provider.user.lastName}`.toLowerCase();
    const apptId = appt.id.toLowerCase();
    const specialty = (appt.provider.specialty || "").toLowerCase();
    
    return clinicianName.includes(q) || 
           apptId.includes(q) || 
           specialty.includes(q);
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
        <BillingClient appointments={appointments} />
      </div>
    </div>
  )
}
