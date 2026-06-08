"use client"

import * as React from "react"
import { Pill, AlertTriangle, Stethoscope, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PaginatedListModal } from "@/components/ui/paginated-list-modal"

type ClinicalCategory = "diagnosis" | "medications" | "allergies"

interface ClinicalSnapshotProps {
  diagnoses: string[]
  activeMedications: string[]
  allergies: string[]
}

const CATEGORIES: {
  key: ClinicalCategory
  title: string
  icon: typeof Pill
  itemsKey: keyof ClinicalSnapshotProps
}[] = [
  { key: "diagnosis", title: "Diagnosis", icon: Stethoscope, itemsKey: "diagnoses" },
  { key: "medications", title: "Medications", icon: Pill, itemsKey: "activeMedications" },
  { key: "allergies", title: "Allergies", icon: AlertTriangle, itemsKey: "allergies" },
]

export function ClinicalSnapshot({
  diagnoses,
  activeMedications,
  allergies,
}: ClinicalSnapshotProps) {
  const [openCategory, setOpenCategory] = React.useState<ClinicalCategory | null>(null)

  const data: ClinicalSnapshotProps = { diagnoses, activeMedications, allergies }

  const activeConfig = CATEGORIES.find((c) => c.key === openCategory)

  return (
    <>
      <div className="space-y-6">
        {CATEGORIES.map(({ key, title, icon: Icon, itemsKey }) => {
          const items = data[itemsKey]
          const count = items?.length ?? 0

          return (
            <div key={key} className="space-y-3">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center justify-between">
                {title}
                <span className="text-[10px] font-bold text-slate-400 normal-case tracking-normal">
                  {count} {count === 1 ? "item" : "items"}
                </span>
              </h4>
              <div className="p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-slate-500">
                  <Icon className="size-4 text-[#67BA2E]" />
                  <span className="text-xs font-bold">
                    {count > 0
                      ? `${count} record${count === 1 ? "" : "s"} on file`
                      : "No clinical records found"}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOpenCategory(key)}
                  className="h-8 rounded-lg border-[#67BA2E]/30 text-[#67BA2E] font-black text-[10px] uppercase tracking-wider hover:bg-[#67BA2E]/10 gap-1.5 shrink-0"
                >
                  <Eye className="size-3.5" />
                  View Details
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {activeConfig && (
        <PaginatedListModal
          isOpen={openCategory !== null}
          onClose={() => setOpenCategory(null)}
          title={activeConfig.title}
          icon={activeConfig.icon}
          items={data[activeConfig.itemsKey] ?? []}
        />
      )}
    </>
  )
}
