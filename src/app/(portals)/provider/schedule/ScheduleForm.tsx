"use client"

import * as React from "react"
import { useTransition } from "react"
import { Clock, Save, Loader2, Calendar, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { updateProviderAvailability } from "@/app/actions/provider.actions"
import { cn } from "@/lib/utils"
import { PremiumTimePicker } from "@/components/ui/premium-time-picker"

interface AvailabilityRule {
  day: string
  startTime: string
  endTime: string
  isActive: boolean
}

interface ScheduleFormProps {
  initialAvailability: AvailabilityRule[]
}

const DAYS = [
  "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"
]

export function ScheduleForm({ initialAvailability }: ScheduleFormProps) {
  const [isPending, startTransition] = useTransition()
  const [availability, setAvailability] = React.useState<AvailabilityRule[]>(() => {
    if (initialAvailability.length > 0) {
      // Ensure all days are present, fill missing with defaults
      return DAYS.map(day => {
        const existing = initialAvailability.find(a => a.day === day)
        if (existing) return existing
        return {
          day,
          startTime: "09:00",
          endTime: "17:00",
          isActive: !["SATURDAY", "SUNDAY"].includes(day)
        }
      })
    }
    // Standard defaults
    return DAYS.map(day => ({
      day,
      startTime: "09:00",
      endTime: "17:00",
      isActive: !["SATURDAY", "SUNDAY"].includes(day)
    }))
  })

  const handleToggle = (day: string) => {
    setAvailability(prev => prev.map(a => 
      a.day === day ? { ...a, isActive: !a.isActive } : a
    ))
  }

  const handleTimeChange = (day: string, field: 'startTime' | 'endTime', value: string) => {
    setAvailability(prev => prev.map(a => 
      a.day === day ? { ...a, [field]: value } : a
    ))
  }

  const onSave = () => {
    startTransition(async () => {
      const res = await updateProviderAvailability(availability)
      if (res.success) {
        toast.success(res.message || "Schedule updated successfully!")
      } else {
        toast.error(res.error || "Failed to update schedule.")
      }
    })
  }

  return (
    <div className="space-y-4 sm:space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        {availability.map((item) => (
          <div 
            key={item.day}
            className={cn(
              "flex flex-col md:flex-row md:items-center justify-between p-4 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all duration-300",
              item.isActive 
                ? "bg-white border-slate-100 shadow-sm" 
                : "bg-slate-50/50 border-slate-50 opacity-60"
            )}
          >
            <div className="flex items-center justify-between md:justify-start gap-3 sm:gap-4 mb-4 md:mb-0">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "size-8 sm:size-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-all",
                  item.isActive ? "bg-[#67BA2E]/10 text-[#67BA2E]" : "bg-slate-200 text-slate-400"
                )}>
                  <Calendar className="size-4 sm:size-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-slate-800 tracking-tight text-xs sm:text-sm uppercase">{item.day}</span>
                  <span className={cn(
                    "text-[8px] sm:text-[10px] font-black uppercase tracking-widest",
                    item.isActive ? "text-[#67BA2E]" : "text-slate-400"
                  )}>
                    {item.isActive ? "Available" : "Closed"}
                  </span>
                </div>
              </div>
              
              {/* Mobile Toggle */}
              <div className="md:hidden">
                <Switch 
                   checked={item.isActive} 
                   onCheckedChange={() => handleToggle(item.day)}
                   className="scale-75 data-[state=checked]:bg-[#67BA2E]"
                 />
              </div>
            </div>

            <div className="flex flex-row items-center justify-between md:justify-end gap-3 sm:gap-6">
              <div className="flex items-center gap-2 sm:gap-4 flex-1 md:flex-initial">
                <div className="flex flex-col gap-1 flex-1 md:flex-initial">
                  <Label className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Start</Label>
                  <PremiumTimePicker 
                    value={item.startTime}
                    disabled={!item.isActive}
                    onChange={(val) => handleTimeChange(item.day, 'startTime', val)}
                  />
                </div>
                <div className="pt-4 text-slate-300 font-black">-</div>
                <div className="flex flex-col gap-1 flex-1 md:flex-initial">
                  <Label className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">End</Label>
                  <PremiumTimePicker 
                    value={item.endTime}
                    disabled={!item.isActive}
                    onChange={(val) => handleTimeChange(item.day, 'endTime', val)}
                  />
                </div>
              </div>

              <div className="h-8 w-[1px] bg-slate-100 hidden md:block" />

              <div className="hidden md:block">
                 <Switch 
                   checked={item.isActive} 
                   onCheckedChange={() => handleToggle(item.day)}
                   className="data-[state=checked]:bg-[#67BA2E]"
                 />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-3 bg-amber-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-amber-100 max-w-lg w-full">
          <AlertCircle className="size-4 sm:size-5 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-[8px] sm:text-[10px] text-amber-700 font-bold uppercase tracking-wider leading-relaxed">
            Note: Updates take effect immediately for future bookings.
          </p>
        </div>

        <Button 
          onClick={onSave}
          disabled={isPending}
          className="h-12 sm:h-14 px-8 sm:px-10 bg-[#67BA2E] hover:bg-[#5aa329] text-white font-black rounded-xl sm:rounded-2xl shadow-xl shadow-emerald-100 transition-all active:scale-[0.98] w-full md:w-auto flex items-center justify-center gap-3 text-[10px] sm:text-xs uppercase tracking-[0.2em]"
        >
          {isPending ? <Loader2 className="size-5 animate-spin" /> : (
            <>
              <Save className="size-4" />
              Save Work Schedule
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
