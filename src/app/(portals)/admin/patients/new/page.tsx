"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, UserPlus, ShieldCheck, Loader2, Calendar as CalendarIcon, Phone, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { PureCalendar } from "@/components/ui/pure-calendar"
import { createPatientAction } from "@/app/actions/patient.actions"

export default function NewPatientPage() {
  const router = useRouter()
  const [isPending, setIsPending] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [date, setDate] = React.useState<Date>(new Date())
  const [membershipStatus, setMembershipStatus] = React.useState("SILVER")

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      if (!date) {
        toast.error("Please select a valid Date of Birth.");
        return;
      }
      formData.set("dob", date.toISOString());
      formData.set("membershipStatus", membershipStatus);
      
      setIsPending(true);
      const res = await createPatientAction(formData);
      if (res?.error) { 
        toast.error(res.error); 
        setIsPending(false);
      } 
      else { 
        toast.success("Patient registered successfully.");
        router.push('/admin/patients'); 
        router.refresh();
      }
    } catch {
      toast.error("An unexpected error occurred."); 
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin/patients">
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
                <UserPlus className="size-7 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl sm:text-3xl font-black tracking-tight text-white">Register New Patient</CardTitle>
                <CardDescription className="text-emerald-50/90 font-medium mt-1">Create a secure electronic medical record for a new patient.</CardDescription>
              </div>
            </div>
          </div>
          
          <CardContent className="p-6 sm:p-10 bg-white/50">
            <form onSubmit={onSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">First Name</Label>
                  <Input 
                    id="firstName" 
                    name="firstName" 
                    placeholder="Jane" 
                    required 
                    className="input-premium"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Last Name</Label>
                  <Input 
                    id="lastName" 
                    name="lastName" 
                    placeholder="Smith" 
                    required 
                    className="input-premium"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="jane.smith@example.com" 
                    required 
                    className="input-premium"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Patient Portal Password</Label>
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
                  <Label htmlFor="phone" className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input 
                      id="phone" 
                      name="phone" 
                      type="tel" 
                      placeholder="+1 (555) 000-0000" 
                      required 
                      className="input-premium pl-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Date of Birth</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        type="button"
                        className="input-premium h-12 flex w-full items-center justify-between px-4 font-normal"
                      >
                        <div className="flex items-center">
                          <CalendarIcon className="mr-2 h-4 w-4 text-[#67BA2E]" />
                          {date ? format(date, "PPP") : <span>Pick a clinical date</span>}
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[9999] bg-white border-slate-200 shadow-2xl rounded-2xl overflow-hidden" align="start">
                      <PureCalendar selectedDate={date} onSelect={setDate} maxDate={new Date()} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="membershipStatus" className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Membership Status</Label>
                  <Select value={membershipStatus} onValueChange={setMembershipStatus}>
                    <SelectTrigger
                      id="membershipStatus"
                      className="input-premium h-12 rounded-md border-slate-200 bg-white font-bold text-slate-700 focus:ring-[#67BA2E]"
                    >
                      <SelectValue placeholder="Select membership tier" />
                    </SelectTrigger>
                    <SelectContent className="z-[9999] rounded-xl border-slate-100 bg-white shadow-2xl">
                      <SelectItem value="PLATINUM" className="cursor-pointer py-3 font-bold text-slate-700 focus:bg-emerald-50 focus:text-[#4A8A1C]">
                        PLATINUM
                      </SelectItem>
                      <SelectItem value="GOLD" className="cursor-pointer py-3 font-bold text-slate-700 focus:bg-emerald-50 focus:text-[#4A8A1C]">
                        GOLD
                      </SelectItem>
                      <SelectItem value="SILVER" className="cursor-pointer py-3 font-bold text-slate-700 focus:bg-emerald-50 focus:text-[#4A8A1C]">
                        SILVER
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Section 2: Clinical Snapshot */}
              <div className="space-y-6 pt-8 border-t border-slate-100">
                <div className="flex items-center gap-2 pb-2">
                  <ShieldCheck className="size-5 text-[#67BA2E]" />
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Clinical Snapshot (Optional)</h2>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="activeMedications" className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Active Medications</Label>
                    <Input 
                      id="activeMedications" 
                      name="activeMedications" 
                      placeholder="e.g. Aspirin, Lisinopril, Metformin (comma separated)" 
                      className="input-premium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="allergies" className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Allergies</Label>
                    <Input 
                      id="allergies" 
                      name="allergies" 
                      placeholder="e.g. Penicillin, Peanuts, Latex (comma separated)" 
                      className="input-premium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chronicConditions" className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Chronic Conditions</Label>
                    <Input 
                      id="chronicConditions" 
                      name="chronicConditions" 
                      placeholder="e.g. Hypertension, Type 2 Diabetes, Asthma (comma separated)" 
                      className="input-premium"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 flex flex-col items-start">
                <div className="flex flex-row gap-4 items-center">
                  <Link href="/admin/patients">
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
                      "Create Patient"
                    )}
                  </Button>
                </div>
                
                <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                  <ShieldCheck className="size-4 text-[#67BA2E]" />
                  HIPAA Compliant Data Entry
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
