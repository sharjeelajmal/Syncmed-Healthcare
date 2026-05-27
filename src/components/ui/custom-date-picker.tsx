"use client"
 
 import * as React from "react"
 import { format } from "date-fns"
 import { Calendar as CalendarIcon } from "lucide-react"
 
 import { cn } from "@/lib/utils"
 import { Button } from "@/components/ui/button"
 import { Calendar } from "@/components/ui/calendar"
 import {
   Popover,
   PopoverContent,
   PopoverTrigger,
 } from "@/components/ui/popover"
 
 interface CustomDatePickerProps {
   value: Date | undefined
   onChange: (date: Date | undefined) => void
   placeholder?: string
  disabled?: boolean
 }
 
export function CustomDatePicker({ value, onChange, placeholder = "Pick a date", disabled = false }: CustomDatePickerProps) {
   return (
     <Popover>
       <PopoverTrigger asChild>
         <Button
           variant={"outline"}
          disabled={disabled}
           className={cn(
             "h-12 w-full justify-start text-left font-bold border-slate-300 bg-white hover:bg-slate-50 transition-all rounded-md",
            !value && "text-slate-400",
            disabled && "opacity-60 cursor-not-allowed"
           )}
         >
           <CalendarIcon className="mr-2 h-4 w-4 text-[#67BA2E]" />
           {value ? format(value, "PPP") : <span>{placeholder}</span>}
         </Button>
       </PopoverTrigger>
       <PopoverContent className="w-auto p-0 z-[100] bg-white border border-slate-200 shadow-xl rounded-md" align="start">
         <Calendar
           mode="single"
           selected={value}
           onSelect={onChange}
           captionLayout="dropdown"
           fromYear={1900}
           toYear={2050}
           className="bg-white rounded-md border border-slate-200"
           initialFocus
         />
       </PopoverContent>
     </Popover>
   )
 }
