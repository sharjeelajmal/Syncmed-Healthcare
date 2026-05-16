"use client"
 
 import * as React from "react"
 import { 
   format, 
   getDaysInMonth, 
   startOfMonth, 
   setMonth, 
   setYear, 
   isSameDay,
   getDay
 } from "date-fns"
 import { cn } from "@/lib/utils"
 import { ChevronLeft } from "lucide-react"
 
 interface PureCalendarProps {
   selectedDate?: Date
   onSelect: (date: Date) => void
   minDate?: Date
   maxDate?: Date
 }
 
 export function PureCalendar({ selectedDate, onSelect, minDate, maxDate }: PureCalendarProps) {
   const [view, setView] = React.useState<'year' | 'month' | 'day'>('year')
   const [activeDate, setActiveDate] = React.useState(selectedDate || new Date())
 
   const currentYear = new Date().getFullYear()
   const years = Array.from({ length: currentYear - 1899 }, (_, i) => currentYear - i)
   
   const months = [
     "Jan", "Feb", "Mar", "Apr", "May", "Jun",
     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
   ]
 
   const isDateDisabled = (date: Date) => {
     if (minDate && date < new Date(new Date(minDate).setHours(0,0,0,0))) return true
     if (maxDate && date > new Date(new Date(maxDate).setHours(23,59,59,999))) return true
     return false
   }

   const handleYearSelect = (year: number) => {
     const newDate = setYear(activeDate, year)
     setActiveDate(newDate)
     setView('month')
   }
 
   const handleMonthSelect = (index: number) => {
     const newDate = setMonth(activeDate, index)
     setActiveDate(newDate)
     setView('day')
   }
 
   const handleDaySelect = (day: number) => {
     const newDate = new Date(activeDate.getFullYear(), activeDate.getMonth(), day)
     if (isDateDisabled(newDate)) return
     onSelect(newDate)
   }
 
   if (view === 'year') {
     return (
       <div className="p-4 bg-white rounded-md w-full max-w-[320px] mx-auto">
         <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Select Year</div>
         <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
           {years.map((year) => {
             const isDisabled = (maxDate && year > maxDate.getFullYear()) || (minDate && year < minDate.getFullYear())
             return (
               <button
                 key={year}
                 disabled={isDisabled}
                 onClick={() => handleYearSelect(year)}
                 className={cn(
                   "p-2 text-sm font-bold rounded-md transition-all",
                   activeDate.getFullYear() === year 
                     ? "bg-[#67BA2E] text-white shadow-md" 
                     : "text-slate-600 hover:bg-[#67BA2E]/10 hover:text-[#67BA2E]",
                   isDisabled && "opacity-20 cursor-not-allowed grayscale"
                 )}
               >
                 {year}
               </button>
             )
           })}
         </div>
       </div>
     )
   }
 
   if (view === 'month') {
     return (
       <div className="p-4 bg-white rounded-md w-full max-w-[320px] mx-auto">
         <div className="flex items-center justify-between mb-4">
           <button onClick={() => setView('year')} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
             <ChevronLeft size={16} className="text-slate-400" />
           </button>
           <div className="text-xs font-black text-slate-400 uppercase tracking-widest">{activeDate.getFullYear()}</div>
           <div className="w-6" />
         </div>
         <div className="grid grid-cols-3 gap-2">
           {months.map((month, i) => {
             const isDisabled = (maxDate && (activeDate.getFullYear() > maxDate.getFullYear() || (activeDate.getFullYear() === maxDate.getFullYear() && i > maxDate.getMonth()))) ||
                              (minDate && (activeDate.getFullYear() < minDate.getFullYear() || (activeDate.getFullYear() === minDate.getFullYear() && i < minDate.getMonth())))
             
             return (
               <button
                 key={month}
                 disabled={isDisabled}
                 onClick={() => handleMonthSelect(i)}
                 className={cn(
                   "p-3 text-sm font-bold rounded-md transition-all",
                   activeDate.getMonth() === i 
                     ? "bg-[#67BA2E] text-white shadow-md" 
                     : "text-slate-600 hover:bg-[#67BA2E]/10 hover:text-[#67BA2E]",
                   isDisabled && "opacity-20 cursor-not-allowed grayscale"
                 )}
               >
                 {month}
               </button>
             )
           })}
         </div>
       </div>
     )
   }
 
   // Day View
   const daysInMonth = getDaysInMonth(activeDate)
   const firstDayOfMonth = getDay(startOfMonth(activeDate))
   const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
   const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i)
 
   return (
     <div className="p-4 bg-white rounded-md w-full max-w-[320px] mx-auto">
       <div className="flex items-center justify-between mb-4">
         <button onClick={() => setView('month')} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
           <ChevronLeft size={16} className="text-slate-400" />
         </button>
         <div className="text-xs font-black text-slate-900 uppercase tracking-widest">
           {months[activeDate.getMonth()]} {activeDate.getFullYear()}
         </div>
         <div className="w-6" />
       </div>
 
       <div className="grid grid-cols-7 mb-2 text-center">
         {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
           <div key={d} className="text-[10px] font-black text-slate-400 uppercase">{d}</div>
         ))}
       </div>
 
       <div className="grid grid-cols-7 gap-1">
         {blanks.map((i) => <div key={`b-${i}`} className="p-2" />)}
         {days.map((day) => {
           const d = new Date(activeDate.getFullYear(), activeDate.getMonth(), day)
           const isSelected = selectedDate && isSameDay(d, selectedDate)
           const isDisabled = isDateDisabled(d)
           
           return (
             <button
               key={day}
               disabled={isDisabled}
               onClick={() => handleDaySelect(day)}
               className={cn(
                 "p-2 text-xs font-bold rounded-md transition-all hover:scale-110",
                 isSelected 
                   ? "bg-[#67BA2E] text-white shadow-md" 
                   : "text-slate-600 hover:bg-[#67BA2E]/10 hover:text-[#67BA2E]",
                 isDisabled && "opacity-20 cursor-not-allowed grayscale"
               )}
             >
               {day}
             </button>
           )
         })}
       </div>
     </div>
   )
 }
