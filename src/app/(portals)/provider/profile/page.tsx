import * as React from "react"
import { 
  User, 
  Mail, 
  Phone, 
  Stethoscope, 
  Fingerprint, 
  ShieldCheck,
  KeyRound,
  Save,
  Loader2
} from "lucide-react"

import { getProviderProfileForSession } from "@/lib/portal-auth"

export const dynamic = "force-dynamic"
export const revalidate = 0
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ProfileForm } from "./ProfileForm"

export default async function ProviderProfilePage() {
  const provider = await getProviderProfileForSession()

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Provider Profile</h1>
        <p className="text-slate-500 font-medium italic">Manage your personal and professional clinical credentials.</p>
      </div>

      <ProfileForm provider={provider} />

      {/* Security Section */}
      <Card className="rounded-[2.5rem] border-slate-200 shadow-xl bg-white overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
          <div className="flex items-center gap-3">
             <div className="size-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                <KeyRound className="size-5" />
             </div>
             <div>
               <CardTitle className="text-lg font-black text-slate-800">Security & Access</CardTitle>
               <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">Update your credentials</CardDescription>
             </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
           <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1">
                 <p className="font-bold text-slate-700">Account Password</p>
                 <p className="text-sm text-slate-500">Ensure your account is using a long, random password to stay secure.</p>
              </div>
              <Button variant="outline" className="h-12 px-8 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all rounded-xl gap-2">
                 <KeyRound className="size-4" />
                 Change Password
              </Button>
           </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-2 text-slate-400">
         <ShieldCheck className="size-4" />
         <span className="text-[10px] font-black uppercase tracking-widest">Enterprise-Grade HIPAA Compliant Profile Management</span>
      </div>
    </div>
  )
}
