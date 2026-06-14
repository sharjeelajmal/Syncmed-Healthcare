"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { DISPLAY_DATE_FORMAT } from "@/lib/date-format"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { PureCalendar } from "@/components/ui/pure-calendar"

function parseDateValue(value?: string): Date | undefined {
  if (!value) return undefined
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return undefined
  return parsed
}

function formatDateValue(date?: Date): string {
  if (!date) return ""
  return date.toISOString().split("T")[0] ?? ""
}

const DEFAULT_MIN_DATE = new Date(1900, 0, 1)
const DEFAULT_MAX_DATE = new Date()

interface AssessmentDateFieldProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  minDate?: Date
  maxDate?: Date
}

export function AssessmentDateField({
  value,
  onChange,
  disabled = false,
  placeholder = "Select Date",
  minDate = DEFAULT_MIN_DATE,
  maxDate = DEFAULT_MAX_DATE,
}: AssessmentDateFieldProps) {
  const [open, setOpen] = React.useState(false)
  const selectedDate = parseDateValue(value)

  return (
    <Popover open={open} onOpenChange={(nextOpen) => !disabled && setOpen(nextOpen)}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="input-premium h-12 w-full flex items-center justify-between px-4 font-normal text-slate-600 bg-white border-slate-200"
        >
          <div className="flex items-center">
            <CalendarIcon className="mr-2 h-4 w-4 text-[#67BA2E]" />
            {selectedDate ? format(selectedDate, DISPLAY_DATE_FORMAT) : <span>{placeholder}</span>}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 z-[9999] bg-white border-slate-200 shadow-2xl rounded-2xl overflow-hidden"
        align="start"
      >
        <PureCalendar
          selectedDate={selectedDate}
          onSelect={(newDate) => {
            onChange(formatDateValue(newDate))
            setOpen(false)
          }}
          minDate={minDate}
          maxDate={maxDate}
        />
      </PopoverContent>
    </Popover>
  )
}
