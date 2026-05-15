"use client"

import * as React from "react"
import { 
  Clock, 
  Save,
  Loader2,
  CalendarDays
} from "lucide-react"
import { toast } from "sonner"

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateAvailabilityAction } from "@/app/actions/provider.actions"

const DAYS = [
  "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"
]

const TIME_SLOTS = Array.from({ length: 24 * 4 }, (_, i) => {
  const hours = Math.floor(i / 4).toString().padStart(2, '0')
  const minutes = ((i % 4) * 15).toString().padStart(2, '0')
  return `${hours}:${minutes}`
})

export function AvailabilityTable({ providerId, initialAvailability }: { providerId: string, initialAvailability: any[] }) {
  const [isPending, startTransition] = React.useTransition()
  
  // Initialize state with existing data or defaults
  const [availability, setAvailability] = React.useState(
    DAYS.map(day => {
      const existing = initialAvailability.find(a => a.day === day)
      return {
        day,
        isActive: existing ? existing.isActive : true,
        startTime: existing ? existing.startTime : "09:00",
        endTime: existing ? existing.endTime : "17:00"
      }
    })
  )

  const handleToggle = (day: string) => {
    setAvailability(prev => prev.map(item => 
      item.day === day ? { ...item, isActive: !item.isActive } : item
    ))
  }

  const handleTimeChange = (day: string, field: 'startTime' | 'endTime', value: string) => {
    setAvailability(prev => prev.map(item => 
      item.day === day ? { ...item, [field]: value } : item
    ))
  }

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateAvailabilityAction(providerId, availability)
      if (res.success) {
        toast.success("Schedule synchronized successfully")
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <div className="space-y-0">
      <Table>
        <TableHeader className="bg-slate-50/30">
          <TableRow className="border-b border-slate-100">
            <TableHead className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinical Day</TableHead>
            <TableHead className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</TableHead>
            <TableHead className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operating Window</TableHead>
            <TableHead className="px-8 py-4 text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {availability.map((item) => (
            <TableRow key={item.day} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
              <TableCell className="px-8 py-6">
                 <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                       <CalendarDays className="size-4" />
                    </div>
                    <span className="font-bold text-slate-700 tracking-tight">{item.day}</span>
                 </div>
              </TableCell>
              <TableCell className="py-6 text-center">
                 <div className="flex justify-center">
                    <Switch 
                      checked={item.isActive} 
                      onCheckedChange={() => handleToggle(item.day)}
                      className="data-[state=checked]:bg-[#67BA2E]"
                    />
                 </div>
              </TableCell>
              <TableCell className="py-6 min-w-[300px]">
                 <div className="flex items-center gap-3">
                    <Select 
                      disabled={!item.isActive}
                      value={item.startTime} 
                      onValueChange={(val) => handleTimeChange(item.day, 'startTime', val)}
                    >
                      <SelectTrigger className="h-12 w-32 rounded-xl border-slate-200 font-bold text-slate-700 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200">
                        {TIME_SLOTS.map(t => <SelectItem key={t} value={t} className="font-bold">{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    
                    <span className="text-slate-300 font-bold">to</span>
                    
                    <Select 
                      disabled={!item.isActive}
                      value={item.endTime} 
                      onValueChange={(val) => handleTimeChange(item.day, 'endTime', val)}
                    >
                      <SelectTrigger className="h-12 w-32 rounded-xl border-slate-200 font-bold text-slate-700 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200">
                        {TIME_SLOTS.map(t => <SelectItem key={t} value={t} className="font-bold">{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                 </div>
              </TableCell>
              <TableCell className="px-8 py-6 text-right">
                 {!item.isActive && <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Clinic Closed</span>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-4">
         <div className="flex items-center gap-2 text-slate-500">
            <Clock className="size-4" />
            <span className="text-xs font-medium italic">Synchronizing changes will update your public booking slots.</span>
         </div>
         <Button 
           onClick={handleSave} 
           disabled={isPending}
           className="h-12 px-10 bg-slate-900 hover:bg-black text-white font-black rounded-xl shadow-lg transition-all flex items-center gap-2 uppercase tracking-widest text-xs"
         >
           {isPending ? (
             <>
               <Loader2 className="size-4 animate-spin" />
               Synchronizing...
             </>
           ) : (
             <>
               <Save className="size-4" />
               Sync Schedule
             </>
           )}
         </Button>
      </div>
    </div>
  )
}
