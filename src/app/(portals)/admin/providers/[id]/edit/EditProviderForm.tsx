"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, UserCheck, ShieldCheck, Loader2 } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateProviderAction } from "@/app/actions/provider.actions"

export function EditProviderForm({ provider }: { provider: any }) {
  const router = useRouter()
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
      router.push("/admin/providers")
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen pb-20 md:pb-10 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin/providers">
          <Button variant="ghost" className="hover:bg-slate-100/50 transition-colors">
            <ArrowLeft className="mr-2 size-4" />
            <span className="hidden sm:inline">Back to Directory</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </Link>
      </div>

      <div className="mx-auto max-w-4xl">
        <Card className="glass-card overflow-hidden rounded-3xl border-0 shadow-2xl p-0">
          <div className="bg-gradient-to-br from-[#67BA2E] to-[#4A8A1C] p-6 sm:p-10 text-white">
            <div className="flex items-center gap-5">
              <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-md border border-white/30">
                <UserCheck className="size-7 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl sm:text-3xl font-black tracking-tight">Edit Provider Profile</CardTitle>
                <CardDescription className="text-emerald-50/90 font-medium mt-1">Update credentials for Dr. {provider.firstName} {provider.lastName}.</CardDescription>
              </div>
            </div>
          </div>
          
          <CardContent className="p-6 sm:p-10 bg-white/50">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">First Name</Label>
                  <Input 
                    id="firstName" 
                    name="firstName" 
                    defaultValue={provider.firstName}
                    required 
                    className="input-premium"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Last Name</Label>
                  <Input 
                    id="lastName" 
                    name="lastName" 
                    defaultValue={provider.lastName}
                    required 
                    className="input-premium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Professional Email (Locked)</Label>
                  <Input 
                    value={provider.email}
                    disabled
                    className="input-premium opacity-70 bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty" className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Medical Specialty</Label>
                  <Input 
                    id="specialty" 
                    name="specialty" 
                    defaultValue={provider.providerProfile?.specialty}
                    required 
                    className="input-premium"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="licenseNumber" className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">License Number</Label>
                  <Input 
                    id="licenseNumber" 
                    name="licenseNumber" 
                    defaultValue={provider.providerProfile?.licenseNumber}
                    required 
                    className="input-premium"
                  />
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 flex flex-col items-start">
                <div className="flex flex-row gap-4 items-center">
                  <Link href="/admin/providers">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="h-12 px-8 rounded-md border-slate-200 text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                    >
                      Cancel
                    </Button>
                  </Link>
                  <Button 
                    type="submit" 
                    className="h-12 px-8 bg-[#67BA2E] hover:bg-[#5aa827] text-white font-bold text-sm rounded-md transition-all shadow-md active:scale-[0.98] group"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
                
                <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                  <ShieldCheck className="size-4 text-[#67BA2E]" />
                  Verified Credentials Required
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
