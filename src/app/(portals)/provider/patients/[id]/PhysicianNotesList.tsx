"use client"

import * as React from "react"
import { format, startOfDay, endOfDay } from "date-fns"
import { FilePenLine } from "lucide-react"

import { DISPLAY_DATE_FORMAT } from "@/lib/date-format"
import { Button } from "@/components/ui/button"
import { DatePickerField } from "@/components/ui/date-picker-field"

export interface PhysicianNoteView {
  id: string
  noteDate: string
  chiefComplaint: string | null
  assessment: string
  plan: string | null
  authorName: string
}

export function PhysicianNotesList({ notes }: { notes: PhysicianNoteView[] }) {
  const [from, setFrom] = React.useState<Date | undefined>()
  const [to, setTo] = React.useState<Date | undefined>()

  const filtered = React.useMemo(() => {
    const fromTime = from ? startOfDay(from).getTime() : -Infinity
    const toTime = to ? endOfDay(to).getTime() : Infinity
    return notes.filter((n) => {
      const t = new Date(n.noteDate).getTime()
      return t >= fromTime && t <= toTime
    })
  }, [notes, from, to])

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FilePenLine className="size-10 text-slate-200 mb-3" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No physician notes yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label htmlFor="pn-from" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">From</label>
          <DatePickerField id="pn-from" size="sm" clearable value={from} onChange={setFrom} maxDate={to} placeholder="Any date" className="w-44" />
        </div>
        <div className="space-y-1">
          <label htmlFor="pn-to" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">To</label>
          <DatePickerField id="pn-to" size="sm" clearable value={to} onChange={setTo} minDate={from} placeholder="Any date" className="w-44" />
        </div>
        {(from || to) && (
          <Button variant="ghost" size="sm" onClick={() => { setFrom(undefined); setTo(undefined) }} className="h-9 text-xs font-bold text-slate-500">
            Clear
          </Button>
        )}
        <span className="ml-auto text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {filtered.length} of {notes.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm font-medium text-slate-500">No notes in this date range.</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((note) => (
            <li key={note.id} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-black text-slate-800 text-sm">
                  {format(new Date(note.noteDate), DISPLAY_DATE_FORMAT)}
                  <span className="ml-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    {format(new Date(note.noteDate), "hh:mm a")}
                  </span>
                </span>
                <span className="text-[10px] font-black text-[#67BA2E] uppercase tracking-widest">{note.authorName}</span>
              </div>
              {note.chiefComplaint ? <NoteField label="Chief Complaint" value={note.chiefComplaint} /> : null}
              <NoteField label="Note / Impression" value={note.assessment} />
              {note.plan ? <NoteField label="Treatment Plan" value={note.plan} /> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function NoteField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-medium text-slate-700 mt-0.5 whitespace-pre-wrap break-words">{value}</p>
    </div>
  )
}
