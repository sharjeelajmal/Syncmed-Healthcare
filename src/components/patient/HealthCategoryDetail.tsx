"use client"

import * as React from "react"
import Link from "next/link"
import { format } from "date-fns"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  ChevronRight,
  HeartPulse,
  Thermometer,
  Weight,
  Droplets,
} from "lucide-react"
import { DISPLAY_DATE_FORMAT } from "@/lib/date-format"
import { HEALTH_CATEGORY_CONFIG } from "@/lib/patient-health-categories"
import type { HealthCategory, PatientHealthData } from "@/types/patient-health"
import { ModalPagination } from "@/components/ui/modal-pagination"
import {
  HEALTH_LIST_PAGE_SIZE,
  HEALTH_VITALS_PAGE_SIZE,
} from "@/lib/pagination"
import { cn } from "@/lib/utils"

const pageVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" as const },
  },
}

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.12 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 22, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
}

interface HealthCategoryDetailProps {
  category: HealthCategory
  healthData: PatientHealthData
}

function ListItemCard({
  item,
  index,
  globalIndex,
  accentBg,
  accent,
}: {
  item: string
  index: number
  globalIndex: number
  accentBg: string
  accent: string
}) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden rounded-[1.5rem] border border-slate-200/90 bg-white/90 backdrop-blur-sm p-5 shadow-lg shadow-slate-200/30 transition-shadow hover:shadow-xl hover:border-[#67BA2E]/25"
    >
      <div className="absolute -right-6 -top-6 size-24 rounded-full bg-[#67BA2E]/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative flex items-start gap-4">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-2xl border font-black text-sm tabular-nums",
            accentBg,
            accent,
            "border-current/15"
          )}
        >
          {String(globalIndex + 1).padStart(2, "0")}
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-base font-black text-slate-800 tracking-tight leading-snug">
            {item}
          </p>
          <p className="mt-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Clinical record #{globalIndex + 1}
          </p>
        </div>
        <ChevronRight className="size-4 shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-[#67BA2E] mt-1" />
      </div>
    </motion.div>
  )
}

function VitalTimelineCard({
  vital,
  index,
}: {
  vital: PatientHealthData["vitalSigns"][number]
  index: number
}) {
  const metrics = [
    { label: "Blood Pressure", value: vital.bp, icon: Droplets },
    { label: "Heart Rate", value: vital.hr, icon: HeartPulse },
    { label: "Temperature", value: vital.temp, icon: Thermometer },
    { label: "Weight", value: vital.weight, icon: Weight },
  ].filter((m) => m.value)

  return (
    <motion.div variants={itemVariants} className="relative pl-8 sm:pl-10">
      <div className="absolute left-[0.4rem] sm:left-[0.55rem] top-2 bottom-0 w-px bg-gradient-to-b from-[#67BA2E]/40 via-sky-200/60 to-transparent last:hidden" />
      <div className="absolute left-0 top-3 size-3 rounded-full border-2 border-white bg-[#67BA2E] shadow-[0_0_0_4px_rgba(103,186,46,0.15)]" />

      <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/90 bg-white/90 backdrop-blur-sm shadow-lg shadow-slate-200/30 transition-all hover:shadow-xl hover:border-sky-200/80">
        <div className="border-b border-slate-100 bg-gradient-to-r from-sky-50/80 to-white px-5 py-4 sm:px-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-600">
            Reading {String(index + 1).padStart(2, "0")}
          </p>
          <p className="mt-1 text-lg font-black text-slate-800 tracking-tight">
            {format(new Date(vital.date), DISPLAY_DATE_FORMAT)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4 sm:gap-4 sm:p-5">
          {metrics.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 sm:p-4 transition-colors hover:bg-white hover:border-sky-100"
            >
              <div className="mb-2 flex size-8 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm">
                <Icon className="size-4" />
              </div>
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                {label}
              </p>
              <p className="mt-1 text-sm font-black text-slate-800">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="rounded-[2rem] border-2 border-dashed border-slate-200 bg-white/60 px-8 py-20 text-center backdrop-blur-sm"
    >
      <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-[1.25rem] bg-slate-50 text-slate-300">
        <HeartPulse className="size-8" />
      </div>
      <h3 className="text-lg font-black uppercase tracking-tight text-slate-700">
        No {label} Yet
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm font-medium text-slate-400">
        Your clinician will add {label.toLowerCase()} here after your next visit or assessment.
      </p>
      <Link
        href="/patient/records"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#67BA2E] px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-200/50 transition-transform hover:-translate-y-0.5"
      >
        <ArrowLeft className="size-3.5" />
        Back to Records
      </Link>
    </motion.div>
  )
}

export function HealthCategoryDetail({
  category,
  healthData,
}: HealthCategoryDetailProps) {
  const config = HEALTH_CATEGORY_CONFIG[category]
  const [currentPage, setCurrentPage] = React.useState(1)
  const Icon = config.icon

  React.useEffect(() => {
    setCurrentPage(1)
  }, [category])

  const isVitals = category === "vitals"
  const stringItems = isVitals
    ? []
    : category === "diagnosis"
      ? healthData.diagnoses
      : category === "medications"
        ? healthData.medications
        : healthData.allergies

  const vitalItems = healthData.vitalSigns
  const totalItems = isVitals ? vitalItems.length : stringItems.length

  const pageSize = isVitals ? HEALTH_VITALS_PAGE_SIZE : HEALTH_LIST_PAGE_SIZE

  const pagedVitals = vitalItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )
  const pagedStrings = stringItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="w-full py-6 md:py-8"
    >
      <Link
        href="/patient/records"
        className="group mb-6 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 transition-colors hover:text-[#67BA2E]"
      >
        <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
        Back to Medical Records
      </Link>

      <section
        className={cn(
          "relative mb-8 overflow-hidden rounded-[2rem] border border-slate-200/80 bg-gradient-to-br p-6 sm:p-8 md:p-10 shadow-xl shadow-slate-200/40",
          config.heroGradient
        )}
      >
        <div
          className={cn(
            "pointer-events-none absolute -right-16 -top-16 size-56 rounded-full blur-3xl",
            config.glowColor
          )}
        />
        <div className="pointer-events-none absolute -bottom-20 -left-10 size-48 rounded-full bg-[#67BA2E]/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <div
              className={cn(
                "inline-flex size-14 items-center justify-center rounded-2xl border shadow-sm",
                config.accentBg,
                config.accent,
                config.accentBorder
              )}
            >
              <Icon className="size-7" strokeWidth={2.25} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#67BA2E]">
                Health Overview
              </p>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                {config.label}
              </h1>
              <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-slate-500">
                {config.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl border border-white/80 bg-white/70 px-5 py-3 backdrop-blur-md shadow-sm">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Total Records
              </p>
              <p className="text-2xl font-black tabular-nums text-slate-800">
                {totalItems}
              </p>
            </div>
            {isVitals && vitalItems[0] && (
              <div className="rounded-2xl border border-white/80 bg-white/70 px-5 py-3 backdrop-blur-md shadow-sm">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  Latest Reading
                </p>
                <p className="text-sm font-black text-slate-800">
                  {format(new Date(vitalItems[0].date), DISPLAY_DATE_FORMAT)}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {totalItems === 0 ? (
        <EmptyState label={config.label} />
      ) : isVitals ? (
        <div className="space-y-6">
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            {pagedVitals.map((vital, index) => (
              <VitalTimelineCard
                key={vital.date}
                vital={vital}
                index={(currentPage - 1) * pageSize + index}
              />
            ))}
          </motion.div>

          {totalItems > pageSize && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm">
              <ModalPagination
                currentPage={currentPage}
                totalItems={totalItems}
                itemsPerPage={pageSize}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="show"
            className="grid gap-4 sm:grid-cols-2"
          >
            {pagedStrings.map((item, index) => (
              <ListItemCard
                key={`${item}-${index}`}
                item={item}
                index={index}
                globalIndex={(currentPage - 1) * pageSize + index}
                accentBg={config.accentBg}
                accent={config.accent}
              />
            ))}
          </motion.div>

          {totalItems > pageSize && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm">
              <ModalPagination
                currentPage={currentPage}
                totalItems={totalItems}
                itemsPerPage={pageSize}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
