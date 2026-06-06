import * as React from "react"
import { 
  Bell, 
  CalendarCheck,
} from "lucide-react"

import prisma from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { AppointmentsListClient } from "./AppointmentsListClient"
import { AppointmentsTableClient } from "./AppointmentsTableClient"

import { auth } from "@/../auth"
import { redirect } from "next/navigation"

export default async function PatientAppointmentsPage({
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

  // Fetch active providers for the modal
  const providers = await prisma.providerProfile.findMany({
    include: { user: true },
    where: { user: { isActive: true } }
  })

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-slate-500 font-bold uppercase tracking-widest">Patient Profile Not Found</p>
      </div>
    )
  }

  const appointments = await prisma.appointment.findMany({
    where: { 
      patientId: patient.id,
      OR: query ? [
        { provider: { user: { firstName: { contains: query, mode: 'insensitive' } } } },
        { provider: { user: { lastName: { contains: query, mode: 'insensitive' } } } },
        { provider: { specialty: { contains: query, mode: 'insensitive' } } },
      ] : undefined,
    },
    orderBy: { scheduledAt: 'desc' },
    include: {
      provider: {
        include: { user: true }
      }
    }
  })

  return (
    <div className="w-full py-6 md:py-8">
      <div className="animate-slide-up">
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-3xl font-black tracking-tight text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-[#67BA2E]/10 rounded-xl">
               <Bell className="size-8 text-[#67BA2E]" />
            </div>
            My Appointments
          </h1>
          <p className="text-slate-500 font-medium ml-1">Manage your upcoming and past clinical encounters.</p>
        </div>

        <AppointmentsListClient patientId={patient.id} providers={providers}>
          {appointments.length > 0 ? (
            <AppointmentsTableClient appointments={appointments} />
          ) : (
            <Card className="rounded-[2.5rem] border-slate-200 shadow-xl bg-white overflow-hidden border-dashed border-2">
              <CardContent className="p-16 text-center space-y-6">
                <div className="size-20 rounded-[2.5rem] bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-inner text-[#67BA2E]">
                  <Bell className="size-10 opacity-20" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">No appointments found</h3>
                  <p className="text-slate-500 font-medium max-w-sm mx-auto italic">Your medical journey is just beginning. Schedule your first clinical interaction today.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </AppointmentsListClient>
      </div>
    </div>
  )
}
