"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Stethoscope, 
  Fingerprint, 
  ShieldCheck,
  Save,
  Loader2
} from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { updateProviderProfileAction } from "@/app/actions/provider.actions"
import { MFASetupModal } from "@/components/auth/MFASetupModal"

export function ProfileForm({ provider }: { provider: any }) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const data = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
    }

    startTransition(async () => {
      const res = await updateProviderProfileAction(provider.user.id, data)
      if (res.success) {
        toast.success("Profile updated successfully")
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Left Column: Personal Info */}
      <Card className="rounded-[2.5rem] border-slate-200 shadow-xl bg-white overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
          <div className="flex items-center gap-3">
             <div className="size-10 rounded-xl bg-[#67BA2E] flex items-center justify-center text-white">
                <UserIcon className="size-5" />
             </div>
             <div>
               <CardTitle className="text-lg font-black text-slate-800">Personal Information</CardTitle>
               <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">Update your identity</CardDescription>
             </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</Label>
               <Input 
                 name="firstName" 
                 defaultValue={provider.user.firstName} 
                 required
                 className="h-12 rounded-xl border-slate-200 focus:ring-[#67BA2E] focus:border-[#67BA2E] font-bold text-slate-700" 
               />
             </div>
             <div className="space-y-2">
               <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</Label>
               <Input 
                 name="lastName" 
                 defaultValue={provider.user.lastName} 
                 required
                 className="h-12 rounded-xl border-slate-200 focus:ring-[#67BA2E] focus:border-[#67BA2E] font-bold text-slate-700" 
               />
             </div>
          </div>

          <div className="space-y-2">
             <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</Label>
             <div className="relative">
                <Input 
                  name="email" 
                  type="email"
                  defaultValue={provider.user.email} 
                  required
                  disabled // Email change is often restricted
                  className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold text-slate-500 pl-10 cursor-not-allowed" 
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
             </div>
          </div>

          <Button 
            type="submit" 
            disabled={isPending}
            className="h-12 w-full bg-slate-900 hover:bg-black text-white font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs mt-2"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Updating Profile...
              </>
            ) : (
              <>
                <Save className="size-4" />
                Save Personal Details
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Right Column: Professional Info (Read-only) */}
      <Card className="rounded-[2.5rem] border-slate-200 shadow-xl bg-white overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
          <div className="flex items-center gap-3">
             <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                <Stethoscope className="size-5" />
             </div>
             <div>
               <CardTitle className="text-lg font-black text-slate-800">Professional Credentials</CardTitle>
               <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">Read-only verified data</CardDescription>
             </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
           <div className="space-y-2">
             <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clinical Specialty</Label>
             <div className="relative">
                <Input 
                  defaultValue={provider.specialty} 
                  disabled
                  className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold text-slate-500 pl-10 cursor-not-allowed" 
                />
                <Stethoscope className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
             </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Medical License</Label>
                <div className="relative">
                   <Input 
                     defaultValue={provider.licenseNumber} 
                     disabled
                     className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold text-slate-500 pl-10 cursor-not-allowed" 
                   />
                   <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NPI Number</Label>
                <div className="relative">
                   <Input 
                     defaultValue="1234567890" // Mock NPI
                     disabled
                     className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold text-slate-500 pl-10 cursor-not-allowed" 
                   />
                   <Fingerprint className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
                </div>
              </div>
           </div>

           <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 mt-2">
              <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider leading-relaxed">
                Notice: Professional credentials can only be updated by a system administrator after verification.
              </p>
           </div>
        </CardContent>
      </Card>
      {/* Security Section */}
      <div className="md:col-span-2 p-4 sm:p-6 bg-slate-50 border border-slate-100 rounded-[2rem] space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h3 className="text-base sm:text-lg font-black text-slate-800">Two-Factor Authentication</h3>
            <p className="text-[12px] sm:text-sm font-medium text-slate-500">Secure your professional account with TOTP protection.</p>
          </div>
          <MFASetupModal>
            <Button 
              type="button" 
              className="w-full sm:w-auto h-11 bg-[#67BA2E] hover:bg-[#5aa827] text-white rounded-xl font-bold px-8 shadow-lg shadow-[#67BA2E]/20 transition-all active:scale-[0.98]"
            >
              Set Up MFA
            </Button>
          </MFASetupModal>
        </div>
      </div>
    </form>
  )
}
