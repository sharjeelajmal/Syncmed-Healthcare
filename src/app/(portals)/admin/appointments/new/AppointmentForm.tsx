"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { 
  ArrowLeft, 
  CalendarPlus, 
  ShieldCheck, 
  Loader2, 
  Clock, 
  Calendar as CalendarIcon,
  Check,
  ChevronsUpDown
} from "lucide-react"
import Link from "next/link"
import { format, addDays, isSameDay } from "date-fns"
 
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import { PureCalendar } from "@/components/ui/pure-calendar"
import { createAppointmentAction, getProviderSlots } from "@/app/actions/appointment.actions"
import { cn } from "@/lib/utils"

export function AppointmentForm({ patients, providers }: { patients: any[], providers: any[] }) {
  const router = useRouter()
  const [isPending, setIsPending] = React.useState(false)
  const [patientId, setPatientId] = React.useState("")
  const [providerId, setProviderId] = React.useState("")
  const [openPatient, setOpenPatient] = React.useState(false)
  const [openProvider, setOpenProvider] = React.useState(false)
  const [openDate, setOpenDate] = React.useState(false)
  const [date, setDate] = React.useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = React.useState<string>("")
  const [availableSlots, setAvailableSlots] = React.useState<string[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = React.useState(false)

  React.useEffect(() => {
    if (!providerId || !date) {
      setAvailableSlots([])
      setSelectedTime("")
      return
    }

    let cancelled = false
    setIsLoadingSlots(true)
    setSelectedTime("")

    getProviderSlots(providerId, format(date, "yyyy-MM-dd"))
      .then((slots) => {
        if (!cancelled) setAvailableSlots(slots)
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("Failed to load provider schedule slots.")
          setAvailableSlots([])
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingSlots(false)
      })

    return () => {
      cancelled = true
    }
  }, [providerId, date])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!patientId || !providerId || !date || !selectedTime) {
      toast.error("Please fill in all clinical fields.");
      return;
    }
    setIsPending(true);
    try {
      const scheduledDateTime = new Date(date);
      const [timeStr, modifier] = selectedTime.split(" ");
      let [hours, minutes] = timeStr.split(":").map(Number);
      if (modifier === "PM" && hours < 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;
      scheduledDateTime.setHours(hours, minutes, 0, 0);

      const formData = new FormData(e.currentTarget);
      formData.set("patientId", patientId);
      formData.set("providerId", providerId);
      formData.set("scheduledAt", scheduledDateTime.toISOString());

      const res = await createAppointmentAction(formData);
      if (res?.error) {
        toast.error(res.error);
        setIsPending(false);
      } else {
        toast.success("Appointment booked successfully!");
        router.push("/admin/appointments");
        router.refresh();
      }
    } catch (err: any) {
      toast.error("Critical System Error.");
      setIsPending(false);
    }
  };

  const minDate = new Date();
  const maxDate = addDays(new Date(), 30);

  return (
    <div className="min-h-screen animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin/appointments">
          <Button variant="ghost" className="hover:bg-slate-100/50 transition-colors">
            <ArrowLeft className="mr-2 size-4" />
            <span className="hidden sm:inline">Back to Directory</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </Link>
      </div>

      <div className="mx-auto max-w-7xl">
        <Card className="glass-card overflow-hidden rounded-3xl border-0 shadow-2xl p-0">
          <div className="bg-gradient-to-br from-[#67BA2E] to-[#4A8A1C] p-6 sm:p-10 text-white">
            <div className="flex items-center gap-5">
              <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-md border border-white/30">
                <CalendarPlus className="size-7 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl sm:text-3xl font-black tracking-tight">Clinical Booking</CardTitle>
                <CardDescription className="text-emerald-50/90 font-medium mt-1">Coordinate a high-precision clinical interaction</CardDescription>
              </div>
            </div>
          </div>
          
          <CardContent className="p-6 sm:p-10 bg-white/50">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                
                {/* Patient Selection */}
                <div className="space-y-2 flex flex-col">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Select Patient</Label>
                  <Popover open={openPatient} onOpenChange={setOpenPatient}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="input-premium h-12 w-full flex items-center justify-between px-4 font-normal text-slate-600"
                      >
                        <span className="truncate">
                          {patientId ? patients.find(p => p.patientProfile?.id === patientId)?.firstName + ' ' + patients.find(p => p.patientProfile?.id === patientId)?.lastName : "Search patient..."}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] max-w-[calc(100vw-2rem)] p-0 z-[9999] border-slate-200 bg-white shadow-2xl rounded-2xl overflow-hidden mt-2" align="start" collisionPadding={16}>
                      <Command className="bg-white">
                        <CommandInput placeholder="Search..." className="h-12 border-b border-slate-100" />
                        <CommandEmpty>No records found.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-y-auto p-2">
                          {patients.map((patient) => (
                            <CommandItem
                              key={patient.patientProfile?.id}
                              value={`${patient.firstName} ${patient.lastName}`}
                              onSelect={() => {
                                setPatientId(patient.patientProfile?.id || "");
                                setOpenPatient(false);
                              }}
                              className="flex items-center px-3 py-3 rounded-xl cursor-pointer font-bold text-slate-700 data-[selected=true]:bg-emerald-50 data-[selected=true]:text-[#67BA2E] transition-all"
                            >
                              <Check className={cn("mr-3 h-4 w-4", patientId === patient.patientProfile?.id ? "opacity-100 text-[#67BA2E]" : "opacity-0")} />
                              {patient.firstName} {patient.lastName}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Provider Selection */}
                <div className="space-y-2 flex flex-col">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Assign Professional</Label>
                  <Popover open={openProvider} onOpenChange={setOpenProvider}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="input-premium h-12 w-full flex items-center justify-between px-4 font-normal text-slate-600"
                      >
                        <span className="truncate">
                          {providerId ? "Dr. " + providers.find(p => p.providerProfile?.id === providerId)?.firstName + ' ' + providers.find(p => p.providerProfile?.id === providerId)?.lastName : "Select provider..."}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] max-w-[calc(100vw-2rem)] p-0 z-[9999] border-slate-200 bg-white shadow-2xl rounded-2xl overflow-hidden mt-2" align="start" collisionPadding={16}>
                      <Command className="bg-white">
                        <CommandInput placeholder="Search..." className="h-12 border-b border-slate-100" />
                        <CommandEmpty>No professionals found.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-y-auto p-2">
                          {providers.map((provider) => (
                            <CommandItem
                              key={provider.providerProfile?.id}
                              value={`${provider.firstName} ${provider.lastName}`}
                              onSelect={() => {
                                setProviderId(provider.providerProfile?.id || "");
                                setSelectedTime("");
                                setOpenProvider(false);
                              }}
                              className="flex items-center px-3 py-3 rounded-xl cursor-pointer font-bold text-slate-700 data-[selected=true]:bg-emerald-50 data-[selected=true]:text-[#67BA2E] transition-all"
                            >
                              <Check className={cn("mr-3 h-4 w-4", providerId === provider.providerProfile?.id ? "opacity-100 text-[#67BA2E]" : "opacity-0")} />
                              <div className="flex flex-col text-left">
                                 <span className="text-sm font-bold">Dr. {provider.firstName} {provider.lastName}</span>
                                 <span className="text-[10px] opacity-60 uppercase tracking-tighter">{provider.providerProfile?.specialty}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Date Selection */}
                <div className="space-y-2 flex flex-col">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Appointment Date</Label>
                  <Popover open={openDate} onOpenChange={setOpenDate}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="input-premium h-12 w-full flex items-center justify-between px-4 font-normal text-slate-600 bg-white"
                      >
                        <div className="flex items-center">
                          <CalendarIcon className="mr-2 h-4 w-4 text-[#67BA2E]" />
                          {date ? format(date, "MMM dd, yyyy") : <span>Select Date</span>}
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[9999] bg-white border-slate-200 shadow-2xl rounded-2xl overflow-hidden" align="start">
                      <PureCalendar 
                        selectedDate={date} 
                        onSelect={(newDate) => {
                          setDate(newDate);
                          setSelectedTime("");
                          setOpenDate(false);
                        }} 
                        minDate={minDate} 
                        maxDate={maxDate} 
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Time Selection */}
                <div className="space-y-2 flex flex-col">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Time Slot</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="input-premium h-12 w-full flex items-center justify-between px-4 font-normal text-slate-600 bg-white"
                      >
                        <div className="flex items-center">
                          <Clock className="mr-2 size-4 text-[#67BA2E]" />
                          {selectedTime || "Pick Time"}
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent side="bottom" align="start" className="w-[--radix-popover-trigger-width] max-w-[calc(100vw-2rem)] sm:w-[450px] p-4 z-[99999] bg-white border border-slate-200 shadow-2xl rounded-2xl max-h-[350px] overflow-y-auto mt-2" collisionPadding={16}>
                      <div className="grid grid-cols-2 gap-3">
                        {!providerId ? (
                          <div className="col-span-2 text-[10px] font-bold text-slate-400 text-center py-4">
                            Select a provider first.
                          </div>
                        ) : isLoadingSlots ? (
                          <div className="col-span-2 flex items-center justify-center gap-2 py-6 text-slate-400">
                            <Loader2 className="size-4 animate-spin text-[#67BA2E]" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Loading schedule...</span>
                          </div>
                        ) : availableSlots.length > 0 ? (
                          availableSlots.map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setSelectedTime(slot)}
                              className={cn(
                                "w-full px-3 py-3 rounded-xl text-[11px] lg:text-[13px] font-bold text-center transition-all",
                                selectedTime === slot 
                                  ? "bg-[#67BA2E] text-white shadow-md" 
                                  : "text-slate-600 hover:bg-emerald-50 hover:text-[#67BA2E] border border-slate-100"
                              )}
                            >
                              {slot}
                            </button>
                          ))
                        ) : (
                          <div className="col-span-2 text-[10px] font-bold text-slate-400 text-center py-4">
                            {isSameDay(date, new Date())
                              ? "No open slots left today for this provider."
                              : `No availability on ${format(date, "EEEE")} — check the provider schedule.`}
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <input type="hidden" name="time" value={selectedTime} />
                </div>

                {/* Notes */}
                <div className="space-y-2 md:col-span-2 lg:col-span-4">
                  <Label htmlFor="notes" className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Clinical Annotations</Label>
                  <Textarea 
                    id="notes" 
                    name="notes" 
                    placeholder="Document clinical intent..." 
                    className="min-h-[140px] rounded-2xl border-slate-200 bg-slate-50/20 p-5 text-base font-medium focus:ring-[#67BA2E]/10 focus:bg-white transition-all outline-none resize-none border focus:border-[#67BA2E]/40"
                  />
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 flex flex-col items-start">
                <div className="flex flex-row gap-4 items-center">
                  <Link href="/admin/appointments">
                    <Button type="button" variant="outline" className="h-12 px-8 rounded-md border-slate-200 text-sm font-bold shadow-sm">Cancel</Button>
                  </Link>
                  <Button type="submit" className="h-12 px-8 bg-[#67BA2E] hover:bg-[#5aa827] text-white font-bold text-sm rounded-md transition-all shadow-md active:scale-[0.98]" disabled={isPending}>
                    {isPending ? <Loader2 className="size-5 animate-spin" /> : "Confirm Booking"}
                  </Button>
                </div>
                <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                  <ShieldCheck className="size-4 text-[#67BA2E]" />
                  Authorized Clinical Encounter
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
