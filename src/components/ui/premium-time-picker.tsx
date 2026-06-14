"use client"

import * as React from "react"
import { Clock, ChevronUp, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

interface TimePickerProps {
  value: string // Format: "HH:mm" (24h)
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
}

export function PremiumTimePicker({ value, onChange, disabled, placeholder = "Select time" }: TimePickerProps) {
  const hasValue = Boolean(value && value.includes(":"))
  const normalizedValue = hasValue ? value : "00:00"
  // Convert 24h string to 12h components
  const [hours24, minutes] = normalizedValue.split(":").map(Number)
  const isPM = hours24 >= 12
  const hours12 = hours24 % 12 || 12

  const [isOpen, setIsOpen] = React.useState(false)

  const updateTime = (newH12: number, newM: number, newIsPM: boolean) => {
    let h24 = newH12 % 12
    if (newIsPM) h24 += 12
    const hStr = h24.toString().padStart(2, '0')
    const mStr = newM.toString().padStart(2, '0')
    onChange(`${hStr}:${mStr}`)
  }

  const hours = Array.from({ length: 12 }, (_, i) => i + 1)
  const mins = ["00", "15", "30", "45"]

  return (
    <Popover open={isOpen && !disabled} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-9 sm:h-12 w-full justify-start px-2 sm:px-4 font-bold text-slate-700 rounded-lg sm:rounded-xl border-slate-100 bg-slate-50 hover:bg-white hover:border-[#67BA2E]/40 transition-all text-[10px] sm:text-sm",
            disabled && "opacity-30 cursor-not-allowed"
          )}
        >
          <Clock className="mr-1.5 sm:mr-2 size-3 sm:size-4 text-[#67BA2E]" />
          {hasValue ? (
            <>
              {hours12.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')} {isPM ? "PM" : "AM"}
            </>
          ) : (
            <span className="font-normal text-slate-500">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4 rounded-3xl border-slate-100 shadow-2xl bg-white animate-in zoom-in-95 duration-200">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Time</span>
            <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-100">
              <button 
                onClick={() => updateTime(hours12, minutes, false)}
                className={cn(
                  "px-3 py-1 rounded-md text-[10px] font-black transition-all",
                  !isPM ? "bg-[#67BA2E] text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                AM
              </button>
              <button 
                onClick={() => updateTime(hours12, minutes, true)}
                className={cn(
                  "px-3 py-1 rounded-md text-[10px] font-black transition-all",
                  isPM ? "bg-[#67BA2E] text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                PM
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Hours Column */}
            <div className="space-y-2">
              <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest ml-1">Hour</span>
              <div className="h-32 overflow-y-auto custom-scrollbar pr-1 space-y-1">
                {hours.map((h) => (
                  <button
                    key={h}
                    onClick={() => updateTime(h, minutes, isPM)}
                    className={cn(
                      "w-full py-2 rounded-lg text-sm font-bold transition-all",
                      hours12 === h 
                        ? "bg-[#67BA2E]/10 text-[#67BA2E] border border-[#67BA2E]/20" 
                        : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {h.toString().padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes Column */}
            <div className="space-y-2">
              <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest ml-1">Minute</span>
              <div className="h-32 overflow-y-auto custom-scrollbar pr-1 space-y-1">
                {mins.map((m) => {
                  const mNum = parseInt(m)
                  return (
                    <button
                      key={m}
                      onClick={() => updateTime(hours12, mNum, isPM)}
                      className={cn(
                        "w-full py-2 rounded-lg text-sm font-bold transition-all",
                        minutes === mNum 
                          ? "bg-[#67BA2E]/10 text-[#67BA2E] border border-[#67BA2E]/20" 
                          : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {m}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <Button 
            className="w-full bg-[#67BA2E] hover:bg-[#5aa329] text-white font-bold rounded-xl h-10 text-xs uppercase tracking-wider mt-2"
            onClick={() => setIsOpen(false)}
          >
            Apply Time
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
