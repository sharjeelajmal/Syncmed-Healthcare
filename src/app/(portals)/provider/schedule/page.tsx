import * as React from "react"
import { 
  Clock, 
  Settings2, 
  AlertCircle,
  History
} from "lucide-react"
import { auth } from "@/../auth"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScheduleForm } from "./ScheduleForm"
import { redirect } from "next/navigation"

export default async function ProviderSchedulePage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  const provider = await prisma.providerProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: true }
  })

  if (!provider) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-slate-500 font-bold uppercase tracking-widest">Provider Records Not Found</p>
      </div>
    )
  }

  const providerId = provider.id;

  // Fetch parallel data
  const [availability, todayAppointments] = await Promise.all([
    prisma.availability.findMany({
      where: { providerId },
      orderBy: { day: 'asc' }
    }),
    prisma.appointment.findMany({
      where: { 
        providerId,
        scheduledAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(new Date().setHours(23, 59, 59, 999))
        },
        status: { not: "CANCELLED" }
      },
      orderBy: { scheduledAt: 'asc' },
      include: { patient: { include: { user: true } } }
    })
  ])

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-8 pb-20 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col gap-1 px-2 sm:px-0 mt-4 sm:mt-0">
        <h1 className="text-xl sm:text-3xl font-black text-slate-800 tracking-tight uppercase sm:normal-case">Schedule</h1>
        <p className="text-[10px] sm:text-sm text-slate-500 font-medium italic">Configure clinical working hours.</p>
      </div>

      <Card className="rounded-[1.5rem] sm:rounded-[2.5rem] border-slate-200 shadow-lg sm:shadow-xl bg-white overflow-hidden border-0">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-4 sm:p-8">
           <div className="flex items-center gap-3">
              <div className="size-8 sm:size-10 rounded-lg sm:rounded-xl bg-[#67BA2E] flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                 <Settings2 className="size-4 sm:size-5" />
              </div>
              <div>
                <CardTitle className="text-sm sm:text-lg font-black text-slate-800">Operational Hours</CardTitle>
                <CardDescription className="text-[9px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Define clinical windows</CardDescription>
              </div>
           </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-8">
           <ScheduleForm initialAvailability={availability} />
        </CardContent>
      </Card>

      {/* Committed Blocks */}
      <div className="space-y-6">
         <div className="flex items-center gap-2 ml-2">
            <History className="size-4 text-slate-400" />
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Committed Blocks (Today)</h2>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayAppointments.length > 0 ? (
              todayAppointments.map((apt) => (
                <Card key={apt.id} className="rounded-2xl border-slate-200 bg-white shadow-sm border-l-4 border-l-amber-400">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex flex-col">
                       <span className="text-xs font-black text-slate-800">{apt.patient.user.firstName} {apt.patient.user.lastName}</span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {apt.id.slice(-6).toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                       <Clock className="size-3 text-amber-500" />
                       <span className="text-[10px] font-black text-slate-700 tracking-tight">{new Date(apt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-white border-2 border-dashed border-slate-200 rounded-[2rem]">
                 <AlertCircle className="size-8 text-slate-200 mx-auto mb-2" />
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No committed blocks for today</p>
              </div>
            )}
         </div>
      </div>

      <div className="p-4 rounded-2xl bg-[#67BA2E]/5 border border-[#67BA2E]/10 flex items-start gap-4">
         <AlertCircle className="size-5 text-[#67BA2E] mt-0.5" />
         <p className="text-xs text-[#67BA2E] font-medium leading-relaxed">
            <strong>Smart Scheduling:</strong> Changes to availability will not affect existing "Committed Blocks". To modify today's schedule, please manage individual appointments in the Schedule tab.
         </p>
      </div>
    </div>
  )
}
