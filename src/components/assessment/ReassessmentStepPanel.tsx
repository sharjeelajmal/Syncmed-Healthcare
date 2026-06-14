"use client"

import * as React from "react"
import { motion } from "framer-motion"

import type { RoutineHomeVisitReassessment } from "@/types/assessment"
import {
  reassessmentFieldsByStep,
  type ReassessmentFieldDefinition,
  type RoutineReassessmentWizardStep,
} from "@/lib/assessment-reassessment-fields"
import { AssessmentDateField } from "@/components/assessment/AssessmentDateField"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PremiumTimePicker } from "@/components/ui/premium-time-picker"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type ReassessmentSectionValue = Record<string, string | boolean | undefined>

interface ReassessmentStepPanelProps {
  step: RoutineReassessmentWizardStep
  value: RoutineHomeVisitReassessment
  onChange: (next: RoutineHomeVisitReassessment) => void
}

function getSectionValue(
  reassessment: RoutineHomeVisitReassessment,
  sectionKey: string
): ReassessmentSectionValue {
  const section = reassessment[sectionKey as keyof RoutineHomeVisitReassessment]
  if (typeof section === "object" && section !== null && !Array.isArray(section)) {
    return section as ReassessmentSectionValue
  }
  return {}
}

function isFieldVisible(
  field: ReassessmentFieldDefinition,
  reassessment: RoutineHomeVisitReassessment
): boolean {
  if (!field.showWhen) return true

  const section = getSectionValue(reassessment, field.showWhen.sectionKey)
  const current = section[field.showWhen.fieldKey]
  return current === field.showWhen.equals
}

function BooleanRadioField({
  fieldId,
  label,
  helperText,
  value,
  onChange,
}: {
  fieldId: string
  label: string
  helperText?: string
  value: boolean | undefined
  onChange: (next: boolean | undefined) => void
}) {
  const radioValue =
    value === true ? "yes" : value === false ? "no" : undefined

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
      <div>
        <Label htmlFor={fieldId} className="text-sm font-semibold text-slate-700 leading-relaxed">
          {label}
        </Label>
        {helperText ? <p className="mt-1 text-xs text-slate-500">{helperText}</p> : null}
      </div>
      <RadioGroup
        value={radioValue}
        onValueChange={(next) => onChange(next === "yes")}
        className="grid gap-2 sm:grid-cols-2"
      >
        <label
          htmlFor={`${fieldId}-yes`}
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition ${
            radioValue === "yes"
              ? "border-[#67BA2E] bg-emerald-50"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <RadioGroupItem value="yes" id={`${fieldId}-yes`} />
          <span className="text-sm font-medium text-slate-700">Yes</span>
        </label>
        <label
          htmlFor={`${fieldId}-no`}
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition ${
            radioValue === "no"
              ? "border-[#67BA2E] bg-emerald-50"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <RadioGroupItem value="no" id={`${fieldId}-no`} />
          <span className="text-sm font-medium text-slate-700">No</span>
        </label>
      </RadioGroup>
    </div>
  )
}

export function ReassessmentStepPanel({ step, value, onChange }: ReassessmentStepPanelProps) {
  const fields = reassessmentFieldsByStep[step]

  const updateField = (
    sectionKey: string,
    fieldKey: string,
    fieldValue: string | boolean | undefined
  ) => {
    const currentSection = getSectionValue(value, sectionKey)
    onChange({
      ...value,
      [sectionKey]: {
        ...currentSection,
        [fieldKey]: fieldValue,
      },
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-slate-700">Routine Home Visit — {step}</h3>
        <p className="text-sm text-slate-500 mt-1">
          Capture changes since the previous visit for ongoing home health reassessment.
        </p>
      </div>

      {fields.map((field) => {
        if (!isFieldVisible(field, value)) return null

        const section = getSectionValue(value, field.sectionKey)
        const fieldValue = section[field.fieldKey]
        const fieldId = `${field.sectionKey}-${field.fieldKey}`

        if (field.type === "boolean") {
          return (
            <BooleanRadioField
              key={fieldId}
              fieldId={fieldId}
              label={field.label}
              helperText={field.helperText}
              value={typeof fieldValue === "boolean" ? fieldValue : undefined}
              onChange={(next) => updateField(field.sectionKey, field.fieldKey, next)}
            />
          )
        }

        return (
          <motion.div
            key={fieldId}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3"
          >
            <div>
              <Label htmlFor={fieldId} className="text-sm font-semibold text-slate-700 leading-relaxed">
                {field.label}
              </Label>
              {field.helperText ? <p className="mt-1 text-xs text-slate-500">{field.helperText}</p> : null}
            </div>

            {field.type === "textarea" ? (
              <Textarea
                id={fieldId}
                value={typeof fieldValue === "string" ? fieldValue : ""}
                onChange={(event) =>
                  updateField(field.sectionKey, field.fieldKey, event.target.value)
                }
                placeholder={field.placeholder ?? "Enter response"}
                className="min-h-28 text-slate-700 border-slate-200"
              />
            ) : null}

            {field.type === "date" ? (
              <AssessmentDateField
                value={typeof fieldValue === "string" ? fieldValue : ""}
                onChange={(next) => updateField(field.sectionKey, field.fieldKey, next)}
                placeholder="Select date of visit"
                maxDate={new Date()}
              />
            ) : null}

            {field.type === "time" ? (
              <PremiumTimePicker
                value={typeof fieldValue === "string" ? fieldValue : ""}
                onChange={(next) => updateField(field.sectionKey, field.fieldKey, next)}
                placeholder={`Select ${field.label.toLowerCase()}`}
              />
            ) : null}

            {field.type === "text" ? (
              <Input
                id={fieldId}
                type="text"
                value={typeof fieldValue === "string" ? fieldValue : ""}
                onChange={(event) =>
                  updateField(field.sectionKey, field.fieldKey, event.target.value)
                }
                placeholder={field.placeholder ?? "Enter response"}
                className="h-11 text-slate-700 border-slate-200"
              />
            ) : null}

            {field.type === "select" && field.options ? (
              <Select
                value={typeof fieldValue === "string" ? fieldValue : ""}
                onValueChange={(next) => updateField(field.sectionKey, field.fieldKey, next)}
              >
                <SelectTrigger id={fieldId} className="h-11 border-slate-200 text-slate-700">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
          </motion.div>
        )
      })}
    </div>
  )
}

export function isRoutineReassessmentStep(step: string): step is RoutineReassessmentWizardStep {
  return step in reassessmentFieldsByStep
}
