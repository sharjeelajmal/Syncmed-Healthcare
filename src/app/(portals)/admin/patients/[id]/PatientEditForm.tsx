"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { 
  ShieldCheck, 
  Loader2, 
  Calendar as CalendarIcon, 
  Phone, 
  Mail, 
  User, 
  MapPin, 
  Save 
} from "lucide-react"
import { format } from "date-fns"
import { DISPLAY_DATE_FORMAT } from "@/lib/date-format"

import { Button } from "@/components/ui/button"
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
import { updatePatientDetailsAction } from "@/app/actions/patient.actions"
import { cn } from "@/lib/utils"

interface PatientEditFormProps {
  patient: {
    id: string
    dateOfBirth: Date | string
    phone: string
    address: string | null
    activeMedications?: string[]
    allergies?: string[]
    diagnoses?: string[]
    membershipStatus?: string | null
    user: {
      firstName: string
      lastName: string
      email: string
    }
  }
  isReadOnly?: boolean
}

export default function PatientEditForm({ patient, isReadOnly }: PatientEditFormProps) {
  const router = useRouter()
  const [isPending, setIsPending] = React.useState(false)
  const [date, setDate] = React.useState<Date>(new Date(patient.dateOfBirth))
  const [membershipStatus, setMembershipStatus] = React.useState(patient.membershipStatus ?? "SILVER")

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isReadOnly) return;
    setIsPending(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.set("dob", date.toISOString());
      formData.set("membershipStatus", membershipStatus);
      
      const res = await updatePatientDetailsAction(patient.id, formData);
      if (res?.error) { 
        toast.error(res.error); 
      } else { 
        toast.success("Clinical profile updated successfully.");
        router.push("/admin/patients");
        router.refresh();
      }
    } catch {
      toast.error("An unexpected system error occurred."); 
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* Basic Info */}
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">First Name</Label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-[#67BA2E] transition-colors" />
            <Input 
              id="firstName" 
              name="firstName" 
              defaultValue={patient.user.firstName}
              required 
              readOnly={isReadOnly}
              disabled={isReadOnly}
              className={cn("input-premium pl-11", isReadOnly && "bg-slate-50 border-slate-100 cursor-not-allowed opacity-80")}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Last Name</Label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-[#67BA2E] transition-colors" />
            <Input 
              id="lastName" 
              name="lastName" 
              defaultValue={patient.user.lastName}
              required 
              readOnly={isReadOnly}
              disabled={isReadOnly}
              className={cn("input-premium pl-11", isReadOnly && "bg-slate-50 border-slate-100 cursor-not-allowed opacity-80")}
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email Address</Label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-[#67BA2E] transition-colors" />
            <Input 
              id="email" 
              name="email" 
              type="email" 
              defaultValue={patient.user.email}
              required 
              readOnly={isReadOnly}
              disabled={isReadOnly}
              className={cn("input-premium pl-11", isReadOnly && "bg-slate-50 border-slate-100 cursor-not-allowed opacity-80")}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Phone Number</Label>
          <div className="relative group">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-[#67BA2E] transition-colors" />
            <Input 
              id="phone" 
              name="phone" 
              type="tel" 
              defaultValue={patient.phone}
              required 
              readOnly={isReadOnly}
              disabled={isReadOnly}
              className={cn("input-premium pl-11", isReadOnly && "bg-slate-50 border-slate-100 cursor-not-allowed opacity-80")}
            />
          </div>
        </div>

        {/* Date of Birth & Address */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Date of Birth</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                type="button"
                disabled={isReadOnly}
                className={cn(
                  "input-premium h-12 flex w-full items-center justify-between px-4 font-bold text-slate-700",
                  isReadOnly && "bg-slate-50 border-slate-100 cursor-not-allowed opacity-80"
                )}
              >
                <div className="flex items-center">
                  <CalendarIcon className="mr-2 h-4 w-4 text-[#67BA2E]" />
                  {date ? format(date, DISPLAY_DATE_FORMAT) : <span>Select Date</span>}
                </div>
              </Button>
            </PopoverTrigger>
            {!isReadOnly && (
              <PopoverContent className="w-auto p-0 z-[9999] bg-white border-slate-200 shadow-2xl rounded-2xl overflow-hidden" align="start">
                <PureCalendar selectedDate={date} onSelect={setDate} maxDate={new Date()} />
              </PopoverContent>
            )}
          </Popover>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Current Address</Label>
          <div className="relative group">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-[#67BA2E] transition-colors" />
            <Input 
              id="address" 
              name="address" 
              defaultValue={patient.address ?? ""}
              placeholder="e.g. 123 Health St, Medical City"
              readOnly={isReadOnly}
              disabled={isReadOnly}
              className={cn("input-premium pl-11", isReadOnly && "bg-slate-50 border-slate-100 cursor-not-allowed opacity-80")}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="membershipStatus" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Membership Status</Label>
          <Select value={membershipStatus} onValueChange={setMembershipStatus} disabled={isReadOnly}>
            <SelectTrigger
              id="membershipStatus"
              className={cn(
                "input-premium h-12 rounded-md border-slate-200 bg-white font-bold text-slate-700 focus:ring-[#67BA2E]",
                isReadOnly && "bg-slate-50 border-slate-100 cursor-not-allowed opacity-80"
              )}
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
      
      {/* Clinical Snapshot Section */}
      <div className="space-y-6 pt-8 border-t border-slate-100">
        <div className="flex items-center gap-2 pb-2">
          <ShieldCheck className="size-5 text-[#67BA2E]" />
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Clinical Snapshot (Optional)</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="activeMedications" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Active Medications</Label>
            <Input 
              id="activeMedications" 
              name="activeMedications" 
              defaultValue={patient.activeMedications?.join(', ')}
              placeholder="Aspirin, Lisinopril..." 
              readOnly={isReadOnly}
              disabled={isReadOnly}
              className={cn("input-premium", isReadOnly && "bg-slate-50 border-slate-100 opacity-80")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="allergies" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Allergies</Label>
            <Input 
              id="allergies" 
              name="allergies" 
              defaultValue={patient.allergies?.join(', ')}
              placeholder="Penicillin, Peanuts..." 
              readOnly={isReadOnly}
              disabled={isReadOnly}
              className={cn("input-premium", isReadOnly && "bg-slate-50 border-slate-100 opacity-80")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="diagnoses" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Diagnosis</Label>
            <Input 
              id="diagnoses" 
              name="diagnoses" 
              defaultValue={patient.diagnoses?.join(', ')}
              placeholder="Hypertension, Asthma..." 
              readOnly={isReadOnly}
              disabled={isReadOnly}
              className={cn("input-premium", isReadOnly && "bg-slate-50 border-slate-100 opacity-80")}
            />
          </div>
        </div>
      </div>

      {!isReadOnly && (
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] ml-1">
            <ShieldCheck className="size-4 text-[#67BA2E]" />
            Authorized Clinical Modification
          </div>
          <Button 
            type="submit" 
            disabled={isPending}
            className="h-12 px-10 bg-[#67BA2E] hover:bg-[#5aa827] text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-100 active:scale-[0.98] w-full sm:w-auto"
          >
            {isPending ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <div className="flex items-center gap-2">
                <Save className="size-4" />
                Save Patient Changes
              </div>
            )}
          </Button>
        </div>
      )}
    </form>
  )
}
