"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { format, roundToNearestMinutes } from "date-fns"
import { FilePenLine, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DatePickerField } from "@/components/ui/date-picker-field"
import { PremiumTimePicker } from "@/components/ui/premium-time-picker"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createPhysicianNoteAction } from "@/app/actions/chart.actions"

const FIELD_LABEL = "text-[10px] font-black text-slate-400 uppercase tracking-widest"

export function PhysicianNoteDialog({ patientId }: { patientId: string }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [isPending, startTransition] = React.useTransition()
  const [date, setDate] = React.useState<Date | undefined>()
  const [time, setTime] = React.useState("")
  const [chiefComplaint, setChiefComplaint] = React.useState("")
  const [assessment, setAssessment] = React.useState("")
  const [plan, setPlan] = React.useState("")

  const resetForm = () => {
    const now = new Date()
    setDate(now)
    // The time picker offers quarter hours, so start on the nearest one.
    setTime(format(roundToNearestMinutes(now, { nearestTo: 15 }), "HH:mm"))
    setChiefComplaint("")
    setAssessment("")
    setPlan("")
  }

  const handleOpenChange = (next: boolean) => {
    if (next) resetForm()
    setOpen(next)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!assessment.trim()) {
      toast.error("Note / impression is required.")
      return
    }

    if (!date || !time) {
      toast.error("Please choose the encounter date and time.")
      return
    }
    // Built in the browser so the doctor's local time zone is preserved.
    const noteDate = new Date(`${format(date, "yyyy-MM-dd")}T${time}`)
    if (Number.isNaN(noteDate.getTime())) {
      toast.error("Please enter a valid date and time.")
      return
    }

    startTransition(async () => {
      const res = await createPhysicianNoteAction({
        patientId,
        noteDate: noteDate.toISOString(),
        chiefComplaint,
        assessment,
        plan,
      })
      if (res.success) {
        toast.success("Physician note saved.")
        setOpen(false)
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-10 px-6 border-[#67BA2E]/30 text-[#67BA2E] hover:bg-[#67BA2E]/10 rounded-lg font-black flex items-center gap-2 w-full md:w-auto text-xs uppercase tracking-wider"
        >
          <FilePenLine className="size-4" />
          Physician Note
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-1rem)] sm:max-w-[640px] max-h-[92dvh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-slate-800 tracking-tight">Physician Note</DialogTitle>
          <DialogDescription className="font-medium text-slate-500">
            Record the encounter note, impression and treatment plan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pn-date" className={FIELD_LABEL}>Date</Label>
              <DatePickerField id="pn-date" value={date} onChange={setDate} maxDate={new Date()} placeholder="Select date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pn-time" className={FIELD_LABEL}>Time</Label>
              <PremiumTimePicker
                value={time}
                onChange={setTime}
                className="h-11 sm:h-11 w-full sm:w-full px-4 sm:px-4 text-sm sm:text-sm rounded-xl sm:rounded-xl border-slate-200 bg-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pn-cc" className={FIELD_LABEL}>Chief Complaint</Label>
            <Input id="pn-cc" value={chiefComplaint} onChange={(e) => setChiefComplaint(e.target.value)} placeholder="Optional" className="h-11 rounded-xl" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pn-assessment" className={FIELD_LABEL}>Note / Impression *</Label>
            <Textarea id="pn-assessment" required value={assessment} onChange={(e) => setAssessment(e.target.value)} className="min-h-32 rounded-xl" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pn-plan" className={FIELD_LABEL}>Treatment Plan</Label>
            <Textarea id="pn-plan" value={plan} onChange={(e) => setPlan(e.target.value)} className="min-h-24 rounded-xl" />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="h-12 w-full bg-[#67BA2E] hover:bg-[#5aa827] text-white font-black rounded-xl"
          >
            {isPending ? <Loader2 className="size-5 animate-spin" /> : "Save Physician Note"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
