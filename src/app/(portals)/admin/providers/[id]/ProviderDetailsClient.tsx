"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { 
  User, 
  Stethoscope, 
  Mail, 
  IdCard, 
  Activity, 
  Users, 
  CalendarCheck,
  Phone,
  ArrowLeft,
  Edit3,
  Save,
  X,
  Loader2,
  Banknote
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { formatNaira } from "@/lib/currency"
import { Label } from "@/components/ui/label"
import { updateProviderAction } from "@/app/actions/provider.actions"
import { formatProviderDisplayNameFromUser } from "@/lib/format-provider-name"

interface ProviderDetailsClientProps {
  provider: any
  stats: {
    totalPatients: number
    totalAppointments: number
  }
}

export function ProviderDetailsClient({ provider, stats }: ProviderDetailsClientProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = React.useState(false)
  const [isPending, setIsPending] = React.useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsPending(true)

    const formData = new FormData(event.currentTarget)
    const result = await updateProviderAction(provider.id, formData)

    if (result.error) {
      toast.error(result.error)
      setIsPending(false)
    } else {
      toast.success("Healthcare Provider records updated.")
      setIsEditing(false)
      setIsPending(false)
      router.refresh()
    }
  }

  return (
    <div className="animate-slide-up">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/providers">
          <Button variant="ghost" className="size-10 p-0 rounded-full hover:bg-slate-100 transition-all">
            <ArrowLeft className="size-5 text-slate-500" />
          </Button>
        </Link>
        <div className="flex flex-col">
          <h1 className="text-3xl font-black tracking-tight text-slate-800">
            {isEditing ? "Edit Provider Profile" : "Provider Profile"}
          </h1>
          <p className="text-slate-500 font-medium">
            {isEditing ? "Update clinical and professional credentials." : "Comprehensive clinical overview of medical professional."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Profile Card */}
          <Card className={`rounded-3xl border-slate-200 shadow-sm overflow-hidden bg-white transition-all duration-500 ${isEditing ? 'ring-2 ring-[#67BA2E]/20' : ''}`}>
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#67BA2E]/10 rounded-2xl shadow-inner border border-[#67BA2E]/20">
                  <User className="size-8 text-[#67BA2E]" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">
                    {isEditing ? (
                      <div className="flex gap-3">
                        <Input 
                          name="firstName" 
                          defaultValue={provider.firstName} 
                          required 
                          className="h-10 rounded-xl border-slate-200 focus:ring-[#67BA2E] font-bold" 
                        />
                        <Input 
                          name="lastName" 
                          defaultValue={provider.lastName} 
                          required 
                          className="h-10 rounded-xl border-slate-200 focus:ring-[#67BA2E] font-bold" 
                        />
                      </div>
                    ) : (
                      formatProviderDisplayNameFromUser(
                        { firstName: provider.firstName, lastName: provider.lastName },
                        provider.providerProfile?.providerType
                      )
                    )}
                  </CardTitle>
                  {!isEditing && (
                    <p className="text-[#67BA2E] font-bold text-xs uppercase tracking-widest mt-0.5">
                      {provider.providerProfile?.specialty || "General Medicine"}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {isEditing ? (
                  <>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Professional Email (Locked)</Label>
                      <Input value={provider.email} disabled className="h-12 rounded-xl bg-slate-50 border-slate-200 opacity-70 font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Medical Specialty</Label>
                      <Input name="specialty" defaultValue={provider.providerProfile?.specialty} required className="h-12 rounded-xl border-slate-200 focus:ring-[#67BA2E] font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">License Number</Label>
                      <Input name="licenseNumber" defaultValue={provider.providerProfile?.licenseNumber} required className="h-12 rounded-xl border-slate-200 focus:ring-[#67BA2E] font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Consultation Fee (₦)</Label>
                      <Input name="consultationFee" type="number" step="0.01" defaultValue={provider.providerProfile?.consultationFee || 150} required className="h-12 rounded-xl border-slate-200 focus:ring-[#67BA2E] font-bold" />
                    </div>
                  </>
                ) : (
                  <>
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
                      icon={<Banknote className="size-4 text-[#67BA2E]" />} 
                      label="Consultation Fee" 
                      value={formatNaira(provider.providerProfile?.consultationFee || 150)} 
                    />
                    <DetailItem 
                      icon={<Mail className="size-4 text-[#67BA2E]" />} 
                      label="Professional Email" 
                      value={provider.email} 
                    />
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right Column: Stats Card */}
          <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden bg-white h-fit">
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
                  value={stats.totalPatients} 
                />
                <StatItem 
                  icon={<CalendarCheck className="size-6 text-[#67BA2E]" />} 
                  label="Appointments" 
                  value={stats.totalAppointments} 
                />
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
                {isEditing ? (
                  <div className="flex gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsEditing(false)}
                      className="flex-1 h-12 rounded-xl font-bold text-slate-500 border-slate-200 hover:bg-slate-50 transition-all uppercase tracking-widest text-[10px] gap-2"
                    >
                      <X className="size-4" />
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isPending}
                      className="flex-1 h-12 bg-[#67BA2E] hover:bg-[#5aa827] text-white font-black rounded-xl shadow-lg shadow-emerald-100 transition-all uppercase tracking-widest text-[10px] gap-2"
                    >
                      {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                      Save Changes
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button 
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="w-full h-12 bg-[#67BA2E] hover:bg-[#5aa827] text-white font-black rounded-xl shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]"
                    >
                      <Edit3 className="size-4" />
                      Edit Provider Profile
                    </Button>
                    <Link href={`/admin/providers/${provider.id}/access`} className="block">
                      <Button variant="outline" className="w-full h-12 border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]">
                        Manage Access Credentials
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
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
