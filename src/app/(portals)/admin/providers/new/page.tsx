"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, UserPlus, ShieldCheck, Loader2, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createProviderAction } from "@/app/actions/provider.actions"

export default function NewProviderPage() {
  const router = useRouter()
  const [isPending, setIsPending] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsPending(true)

    const formData = new FormData(event.currentTarget)
    const result = await createProviderAction(formData)

    if (result.error) {
      toast.error(result.error)
      setIsPending(false)
    } else {
      toast.success("Healthcare Provider registered successfully.")
      router.push("/admin/providers")
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen pb-20 md:pb-10 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin/dashboard">
          <Button variant="ghost" className="hover:bg-slate-100/50 transition-colors">
            <ArrowLeft className="mr-2 size-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </Link>
      </div>

      <div className="mx-auto max-w-4xl">
        <Card className="glass-card overflow-hidden rounded-3xl border-0 shadow-2xl p-0">
          <div className="bg-gradient-to-br from-[#67BA2E] to-[#4A8A1C] p-6 sm:p-10 text-white">
            <div className="flex items-center gap-5">
              <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-md border border-white/30">
                <UserPlus className="size-7 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl sm:text-3xl font-black tracking-tight">Add New Provider</CardTitle>
                <CardDescription className="text-emerald-50/90 font-medium mt-1">Register a verified healthcare professional</CardDescription>
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
                    placeholder="John" 
                    required 
                    className="input-premium"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Last Name</Label>
                  <Input 
                    id="lastName" 
                    name="lastName" 
                    placeholder="Doe" 
                    required 
                    className="input-premium"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Professional Email</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="john.doe@hospital.com" 
                    required 
                    className="input-premium"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Initial Password</Label>
                  <div className="relative group">
                    <Input 
                      id="password" 
                      name="password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      required 
                      className="input-premium pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#67BA2E] transition-colors"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty" className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Medical Specialty</Label>
                  <Input 
                    id="specialty" 
                    name="specialty" 
                    placeholder="e.g. Cardiology" 
                    required 
                    className="input-premium"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber" className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">License Number</Label>
                  <Input 
                    id="licenseNumber" 
                    name="licenseNumber" 
                    placeholder="MED-12345678" 
                    required 
                    className="input-premium"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="consultationFee" className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Consultation Fee ($)</Label>
                  <Input 
                    id="consultationFee" 
                    name="consultationFee" 
                    type="number"
                    step="0.01"
                    placeholder="150.00" 
                    required 
                    className="input-premium"
                  />
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 flex flex-col items-start">
                <div className="flex flex-row gap-4 items-center">
                  <Link href="/admin/dashboard">
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
                      "Register Provider"
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
