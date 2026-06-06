import * as React from "react"
import { ShieldCheck } from "lucide-react"

import { getProviderProfileForSession } from "@/lib/portal-auth"

export const dynamic = "force-dynamic"
export const revalidate = 0
import { ProfileForm } from "./ProfileForm"
import { ProviderSecurityForm } from "./ProviderSecurityForm"

export default async function ProviderProfilePage() {
  const provider = await getProviderProfileForSession()

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Provider Profile</h1>
        <p className="text-slate-500 font-medium italic">Manage your personal and professional clinical credentials.</p>
      </div>

      <ProfileForm provider={provider} />

      <ProviderSecurityForm />

      <div className="flex items-center justify-center gap-2 text-slate-400">
         <ShieldCheck className="size-4" />
         <span className="text-[10px] font-black uppercase tracking-widest">Enterprise-Grade HIPAA Compliant Profile Management</span>
      </div>
    </div>
  )
}
