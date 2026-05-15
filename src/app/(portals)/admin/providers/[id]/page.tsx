import * as React from "react"
import { notFound } from "next/navigation"
import { 
  User, 
  Stethoscope, 
  Mail, 
  IdCard, 
  Activity, 
  Users, 
  CalendarCheck,
  Phone,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ProviderProfilePage({ params }: PageProps) {
  const { id } = await params

  const provider = await prisma.user.findUnique({
    where: { id },
    include: {
      providerProfile: true,
    },
  })

  if (!provider || provider.role !== "PROVIDER") {
    notFound()
  }

  // Fetch stats
  const [totalPatients, totalAppointments] = await Promise.all([
    prisma.patientProfile.count({
      where: { assignedProviderId: provider.providerProfile?.id },
    }),
    prisma.appointment.count({
      where: { providerId: provider.providerProfile?.id },
    }),
  ])

  return (
    <div className="animate-slide-up pb-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/providers">
          <Button variant="ghost" className="size-10 p-0 rounded-full hover:bg-slate-100 transition-all">
            <ArrowLeft className="size-5 text-slate-500" />
          </Button>
        </Link>
        <div className="flex flex-col">
          <h1 className="text-3xl font-black tracking-tight text-slate-800">Provider Profile</h1>
          <p className="text-slate-500 font-medium">Comprehensive clinical overview of medical professional.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Profile Card */}
        <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#67BA2E]/10 rounded-2xl shadow-inner border border-[#67BA2E]/20">
                <User className="size-8 text-[#67BA2E]" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">
                  Dr. {provider.firstName} {provider.lastName}
                </CardTitle>
                <p className="text-[#67BA2E] font-bold text-xs uppercase tracking-widest mt-0.5">
                  {provider.providerProfile?.specialty || "General Medicine"}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <DetailItem 
                icon={<Stethoscope className="size-4 text-[#67BA2E]" />} 
                label="Primary Specialty" 
                value={provider.providerProfile?.specialty || "Not Specified"} 
              />
              <DetailItem 
                icon={<IdCard className="size-4 text-[#67BA2E]" />} 
                label="Medical License / NPI" 
                value={provider.providerProfile?.licenseNumber || "Unverified"} 
              />
              <DetailItem 
                icon={<Mail className="size-4 text-[#67BA2E]" />} 
                label="Professional Email" 
                value={provider.email} 
              />
              <DetailItem 
                icon={<Phone className="size-4 text-[#67BA2E]" />} 
                label="Contact Status" 
                value={provider.isActive ? "Active / Authorized" : "Suspended / Restricted"} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Stats Card */}
        <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#67BA2E]/10 rounded-2xl shadow-inner border border-[#67BA2E]/20">
                <Activity className="size-8 text-[#67BA2E]" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">Clinical Performance</CardTitle>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-0.5">Real-time statistics</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatItem 
                icon={<Users className="size-6 text-[#67BA2E]" />} 
                label="Total Patients" 
                value={totalPatients} 
              />
              <StatItem 
                icon={<CalendarCheck className="size-6 text-[#67BA2E]" />} 
                label="Appointments" 
                value={totalAppointments} 
              />
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100">
              <Link href={`/admin/providers/${id}/access`}>
                <Button className="w-full h-12 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                  Manage Access Credentials
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/30 group hover:border-[#67BA2E]/30 transition-all">
      <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{label}</span>
        <span className="text-slate-700 font-bold text-sm tracking-tight">{value}</span>
      </div>
    </div>
  )
}

function StatItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) {
  return (
    <div className="flex flex-col p-6 rounded-3xl border border-slate-100 bg-slate-50/30 items-center text-center">
      <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 mb-4">
        {icon}
      </div>
      <span className="text-3xl font-black text-slate-800 mb-1">{value}</span>
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
  )
}
