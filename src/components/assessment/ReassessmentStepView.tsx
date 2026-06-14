"use client"

import { format } from "date-fns"

import { DISPLAY_DATE_FORMAT } from "@/lib/date-format"
import {
  reassessmentFieldsByStep,
  type ReassessmentFieldDefinition,
  type RoutineReassessmentWizardStep,
} from "@/lib/assessment-reassessment-fields"
import type { RoutineHomeVisitReassessment } from "@/types/assessment"

type SectionRecord = Record<string, string | boolean | undefined>

function getSectionValue(
  reassessment: RoutineHomeVisitReassessment,
  sectionKey: string
): SectionRecord {
  const section = reassessment[sectionKey as keyof RoutineHomeVisitReassessment]
  if (typeof section === "object" && section !== null && !Array.isArray(section)) {
    return section as SectionRecord
  }
  return {}
}

function formatTime12h(value: string): string {
  if (!/^\d{2}:\d{2}$/.test(value)) return value
  const [hours24, minutes] = value.split(":").map(Number)
  const isPM = hours24 >= 12
  const hours12 = hours24 % 12 || 12
  return `${hours12.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${isPM ? "PM" : "AM"}`
}

function formatMaybeDate(raw: string): string {
  const parsed = new Date(raw)
  if (!Number.isNaN(parsed.getTime()) && /\d{4}-\d{2}-\d{2}/.test(raw)) {
    return format(parsed, DISPLAY_DATE_FORMAT)
  }
  return raw
}

function formatReassessmentFieldValue(
  field: ReassessmentFieldDefinition,
  raw: string | boolean | undefined
): string {
  if (raw === undefined || raw === null || raw === "") return ""

  if (field.type === "boolean") {
    return raw === true ? "Yes" : raw === false ? "No" : ""
  }

  const text = String(raw).trim()
  if (!text) return ""

  if (field.type === "date") return formatMaybeDate(text)
  if (field.type === "time") return formatTime12h(text)

  if (field.type === "select" && field.options) {
    return field.options.find((option) => option.value === text)?.label ?? text
  }

  return text
}

function hasDisplayValue(value: string | boolean | undefined): boolean {
  if (value === undefined || value === null) return false
  if (typeof value === "boolean") return true
  return String(value).trim() !== ""
}

export function getReassessmentDisplayRows(
  step: RoutineReassessmentWizardStep,
  reassessment: RoutineHomeVisitReassessment
): { key: string; label: string; value: string }[] {
  const fields = reassessmentFieldsByStep[step]

  return fields
    .map((field) => {
      const section = getSectionValue(reassessment, field.sectionKey)
      const raw = section[field.fieldKey]
      if (!hasDisplayValue(raw)) return null

      const value = formatReassessmentFieldValue(field, raw)
      if (!value) return null

      return {
        key: `${field.sectionKey}.${field.fieldKey}`,
        label: field.label,
        value,
      }
    })
    .filter((row): row is { key: string; label: string; value: string } => row !== null)
}

interface ReassessmentStepViewProps {
  step: RoutineReassessmentWizardStep
  reassessment: RoutineHomeVisitReassessment
}

export function ReassessmentStepView({ step, reassessment }: ReassessmentStepViewProps) {
  const rows = getReassessmentDisplayRows(step, reassessment)

  if (rows.length === 0) {
    return (
      <div className="p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          No {step.toLowerCase()} data recorded
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {rows.map((row) => (
        <div
          key={row.key}
          className={`p-3 bg-slate-50 rounded-xl border border-slate-100 ${
            row.value.length > 80 ? "sm:col-span-2" : ""
          }`}
        >
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{row.label}</p>
          <p className="text-sm font-bold text-slate-800 mt-0.5 break-words whitespace-pre-wrap">{row.value}</p>
        </div>
      ))}
    </div>
  )
}

export function isRoutineReassessmentWizardStep(step: string): step is RoutineReassessmentWizardStep {
  return step in reassessmentFieldsByStep
}
