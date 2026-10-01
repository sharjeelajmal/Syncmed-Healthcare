"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { DISPLAY_DATE_FORMAT } from "@/lib/date-format"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { PureCalendar } from "@/components/ui/pure-calendar"

interface DatePickerFieldProps {
  id?: string
  value: Date | undefined
  onChange: (date: Date | undefined) => void
  placeholder?: string
  minDate?: Date
  maxDate?: Date
  /** Shows an × to clear the date (for optional filters). */
  clearable?: boolean
  size?: "default" | "sm"
  className?: string
  disabled?: boolean
}

/**
 * The app's custom date picker: a trigger button that opens PureCalendar in a
 * popover (same look as the admin patient forms) and closes once a day is picked.
 */
export function DatePickerField({
  id,
  value,
  onChange,
  placeholder = "Pick a date",
  minDate,
  maxDate,
  clearable = false,
  size = "default",
  className,
  disabled = false,
}: DatePickerFieldProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className={cn("relative", className)}>
      <Popover open={open && !disabled} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              // sm:w-full overrides Button's default-size "sm:w-auto".
              "w-full sm:w-full justify-start rounded-xl border-slate-200 bg-white text-left font-bold text-slate-700 transition-all hover:border-[#67BA2E]/40 hover:bg-slate-50 data-[state=open]:border-[#67BA2E]",
              size === "sm" ? "h-9 px-3 text-xs" : "h-11 px-4 text-sm",
              !value && "font-medium text-slate-400",
              clearable && value && "pr-9"
            )}
          >
            <CalendarIcon className={cn("shrink-0 text-[#67BA2E]", size === "sm" ? "mr-1.5 size-3.5" : "mr-2 size-4")} />
            <span className="truncate">{value ? format(value, DISPLAY_DATE_FORMAT) : placeholder}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={6}
          collisionPadding={12}
          className="w-auto overflow-hidden rounded-2xl border-slate-200 bg-white p-0 shadow-2xl"
        >
          <PureCalendar
            initialView="day"
            selectedDate={value}
            minDate={minDate}
            maxDate={maxDate}
            onSelect={(date) => {
              onChange(date)
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>

      {clearable && value && !disabled ? (
        <button
          type="button"
          aria-label="Clear date"
          onClick={() => onChange(undefined)}
          className="absolute right-2 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="size-3.5" />
        </button>
      ) : null}
    </div>
  )
}
