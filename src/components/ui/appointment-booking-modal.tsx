"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { addDays, format } from "date-fns"
import { 
  Calendar, 
  Clock, 
  Stethoscope, 
  ChevronRight, 
  ArrowLeft,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Search
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PureCalendar } from "@/components/ui/pure-calendar"
import { getProviderSlots, createAppointmentAction } from "@/app/actions/appointment.actions"
import { formatProviderDisplayName } from "@/lib/format-provider-name"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface AppointmentBookingModalProps {
  isOpen: boolean
  onClose: () => void
  patientId: string
  providers: any[]
}

export function AppointmentBookingModal({ isOpen, onClose, patientId, providers }: AppointmentBookingModalProps) {
  const router = useRouter()
  const [step, setStep] = React.useState(1)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedProvider, setSelectedProvider] = React.useState<any>(null)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null)
  const [availableSlots, setAvailableSlots] = React.useState<string[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setStep(1)
      setSearchTerm("")
      setSelectedProvider(null)
      setSelectedDate(undefined)
      setSelectedTime(null)
      setAvailableSlots([])
    }
  }, [isOpen])

  // Filter providers
  const filteredProviders = React.useMemo(() => {
    if (!searchTerm) return providers
    const term = searchTerm.toLowerCase()
    return providers.filter(p => 
      p.user.firstName.toLowerCase().includes(term) ||
      p.user.lastName.toLowerCase().includes(term) ||
      p.specialty.toLowerCase().includes(term)
    )
  }, [searchTerm, providers])

  // Step 1: Select Provider
  const handleSelectProvider = (provider: any) => {
    setSelectedProvider(provider)
    setStep(2)
  }

  // Step 2: Select Date
  const handleSelectDate = async (date: Date | undefined) => {
    setSelectedDate(date)
    setSelectedTime(null)
    if (date && selectedProvider) {
      setIsLoadingSlots(true)
      try {
        const slots = await getProviderSlots(selectedProvider.id, format(date, "yyyy-MM-dd"))
        setAvailableSlots(slots)
      } catch (error) {
        toast.error("Failed to fetch available slots.")
      } finally {
        setIsLoadingSlots(false)
      }
    }
  }

  // Step 3: Handle Final Booking
  const handleBook = async () => {
    if (!selectedProvider || !selectedDate || !selectedTime) return

    setIsSubmitting(true)
    try {
      const [time, modifier] = selectedTime.split(" ")
      let [hours, minutes] = time.split(":").map(Number)
      if (modifier === "PM" && hours < 12) hours += 12
      if (modifier === "AM" && hours === 12) hours = 0

      const scheduledAt = new Date(selectedDate)
      scheduledAt.setHours(hours, minutes, 0, 0)

      const formData = new FormData()
      formData.append("patientId", patientId)
      formData.append("providerId", selectedProvider.id)
      formData.append("scheduledAt", scheduledAt.toISOString())
      formData.append("notes", "Patient Portal Booking (Modal)")

      const res = await createAppointmentAction(formData)
      if (res.success) {
        toast.success("Appointment scheduled successfully!")
        onClose()
        router.refresh()
      } else {
        toast.error(res.error || "Failed to book appointment.")
      }
    } catch (error) {
      toast.error("An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] md:max-w-3xl p-0 overflow-hidden border-0 bg-slate-50 sm:rounded-[2.5rem] max-h-[90vh] flex flex-col shadow-2xl">
        <DialogHeader className="bg-white p-6 sm:p-8 border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between">
            <div className="space-y-1 pr-4">
              <DialogTitle className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Clinical Booking</DialogTitle>
              <DialogDescription className="text-slate-500 font-medium italic text-[10px] sm:text-xs">
                {step === 1 && "Choose your preferred healthcare professional."}
                {step === 2 && selectedProvider && `Schedule your encounter with ${formatProviderDisplayName(selectedProvider)}`}
              </DialogDescription>
            </div>
            {step > 1 && (
              <Button 
                variant="ghost" 
                onClick={() => setStep(step - 1)}
                className="text-slate-400 hover:text-slate-800 transition-colors font-black uppercase tracking-widest text-[9px] sm:text-[10px] gap-1 sm:gap-2 border-0 h-8 p-0 sm:px-4"
              >
                <ArrowLeft className="size-3" />
                Back
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
          {/* STEP 1: SELECT DOCTOR */}
          {step === 1 && (
            <div className="space-y-6 animate-slide-up">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input 
                  placeholder="Search by name or specialty..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 h-12 rounded-2xl bg-white border-slate-200 focus:ring-[#67BA2E]/10 focus:border-[#67BA2E]/40 transition-all font-bold text-sm"
                />
              </div>

              {/* Doctors List */}
              <div className="max-h-[350px] overflow-y-auto p-1 space-y-4 custom-scrollbar">
                {filteredProviders.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    {filteredProviders.map((p) => (
                      <Card 
                        key={p.id} 
                        className={cn(
                          "rounded-2xl border-2 transition-all cursor-pointer group bg-white overflow-hidden shadow-sm h-auto min-h-[100px] sm:min-h-[80px]",
                          selectedProvider?.id === p.id ? "border-[#67BA2E] bg-emerald-50/10" : "border-slate-50 hover:border-[#67BA2E]/30"
                        )}
                        onClick={() => handleSelectProvider(p)}
                      >
                        <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4 h-full text-center sm:text-left">
                          <div className={cn(
                            "size-10 sm:size-12 rounded-xl flex items-center justify-center transition-all duration-300 border shrink-0",
                            selectedProvider?.id === p.id ? "bg-[#67BA2E] text-white border-[#67BA2E]" : "bg-slate-50 text-[#67BA2E] border-slate-100 group-hover:bg-[#67BA2E] group-hover:text-white"
                          )}>
                            <Stethoscope className="size-4 sm:size-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-black text-slate-800 tracking-tight text-[11px] sm:text-sm leading-tight break-words">{formatProviderDisplayName(p)}</h3>
                            <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1 truncate">{p.specialty}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center space-y-4">
                    <Search className="size-10 text-slate-100 mx-auto" />
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No matching professionals found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: SELECT DATE & TIME */}
          {step === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 animate-slide-up">
              <Card className="rounded-[2rem] border-0 shadow-xl shadow-slate-200/50 bg-white overflow-hidden w-full">
                <div className="bg-slate-50/50 p-4 sm:p-6 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-[#67BA2E]/10 flex items-center justify-center text-[#67BA2E]">
                      <Calendar className="size-4" />
                    </div>
                    <span className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Clinical Calendar</span>
                  </div>
                </div>
                <CardContent className="p-4 sm:p-6">
                  <PureCalendar 
                    selectedDate={selectedDate} 
                    onSelect={handleSelectDate}
                    minDate={new Date()}
                    maxDate={addDays(new Date(), 30)}
                  />
                </CardContent>
              </Card>

              <div className="space-y-6 flex flex-col">
                <Card className="rounded-[2rem] border-0 shadow-xl shadow-slate-200/50 bg-white overflow-hidden flex flex-col min-h-[300px] max-h-[400px]">
                  <div className="bg-slate-50/50 p-4 sm:p-6 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-[#67BA2E]/10 flex items-center justify-center text-[#67BA2E]">
                        <Clock className="size-4" />
                      </div>
                      <span className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Available Windows</span>
                    </div>
                  </div>
                  <CardContent className="p-4 sm:p-6 flex-1 overflow-y-auto custom-scrollbar">
                    {!selectedDate ? (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                        <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                          <Calendar className="size-6 text-slate-200" />
                        </div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Select a date first</p>
                      </div>
                    ) : isLoadingSlots ? (
                      <div className="h-full flex flex-col items-center justify-center">
                        <Loader2 className="size-8 text-[#67BA2E] animate-spin" />
                      </div>
                    ) : availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-3 xl:grid-cols-3 gap-2">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => setSelectedTime(slot)}
                            className={cn(
                              "h-10 w-full rounded-xl text-[9px] sm:text-[10px] font-black transition-all border uppercase tracking-widest px-0.5",
                              selectedTime === slot 
                                ? "bg-[#67BA2E] text-white border-[#67BA2E] shadow-lg shadow-emerald-100" 
                                : "bg-white text-slate-600 border-slate-100 hover:border-[#67BA2E]/30 hover:bg-emerald-50/50"
                            )}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-10">
                        <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                          <Clock className="size-6 text-slate-200" />
                        </div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No slots available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="space-y-4 mt-auto">
                  <Button 
                    disabled={!selectedTime || isSubmitting}
                    onClick={handleBook}
                    className="w-full h-12 bg-[#67BA2E] hover:bg-[#5aa827] text-white font-black rounded-2xl shadow-xl shadow-emerald-200 transition-all uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 active:scale-[0.98] border-0 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="size-5 animate-spin" /> : (
                      <>
                        Confirm Interaction
                        <CheckCircle2 className="size-4" />
                      </>
                    )}
                  </Button>
                  
                  <div className="flex items-center justify-center gap-2 text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
                    <ShieldCheck className="size-3.5 text-[#67BA2E]" />
                    HIPAA Secure
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
