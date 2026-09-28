"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Pill, AlertTriangle, Stethoscope, Eye, Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PaginatedListModal } from "@/components/ui/paginated-list-modal"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { addDiagnosisAction } from "@/app/actions/chart.actions"

type ClinicalCategory = "diagnosis" | "medications" | "allergies"

interface ClinicalLists {
  diagnoses: string[]
  activeMedications: string[]
  allergies: string[]
}

interface ClinicalSnapshotProps extends ClinicalLists {
  patientId: string
}

const CATEGORIES: {
  key: ClinicalCategory
  title: string
  icon: typeof Pill
  itemsKey: keyof ClinicalLists
}[] = [
  { key: "diagnosis", title: "Diagnosis", icon: Stethoscope, itemsKey: "diagnoses" },
  { key: "medications", title: "Medications", icon: Pill, itemsKey: "activeMedications" },
  { key: "allergies", title: "Allergies", icon: AlertTriangle, itemsKey: "allergies" },
]

export function ClinicalSnapshot({
  patientId,
  diagnoses,
  activeMedications,
  allergies,
}: ClinicalSnapshotProps) {
  const [openCategory, setOpenCategory] = React.useState<ClinicalCategory | null>(null)

  const data: ClinicalLists = { diagnoses, activeMedications, allergies }

  const activeConfig = CATEGORIES.find((c) => c.key === openCategory)

  return (
    <>
      <div className="space-y-6">
        {CATEGORIES.map(({ key, title, icon: Icon, itemsKey }) => {
          const items = data[itemsKey]
          const count = items?.length ?? 0

          return (
            <div key={key} className="space-y-3">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center justify-between gap-2">
                {title}
                <span className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 normal-case tracking-normal">
                    {count} {count === 1 ? "item" : "items"}
                  </span>
                  {key === "diagnosis" ? <AddDiagnosisDialog patientId={patientId} /> : null}
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

function AddDiagnosisDialog({ patientId }: { patientId: string }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [isPending, startTransition] = React.useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Diagnosis is required.")
      return
    }
    startTransition(async () => {
      const res = await addDiagnosisAction(patientId, name)
      if (res.success) {
        toast.success("Diagnosis added.")
        setName("")
        setOpen(false)
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-[#67BA2E] hover:bg-[#67BA2E]/10 font-black text-[10px] uppercase tracking-wider gap-1"
        >
          <Plus className="size-3" />
          Add
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-1rem)] sm:max-w-[440px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-slate-800 tracking-tight">Add Diagnosis</DialogTitle>
          <DialogDescription className="font-medium text-slate-500">
            Adds a clinical diagnosis to this patient&apos;s chart.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            autoFocus
            required
            maxLength={200}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Type 2 diabetes mellitus (E11.9)"
            className="h-11 rounded-xl"
          />
          <Button type="submit" disabled={isPending} className="h-11 w-full bg-[#67BA2E] hover:bg-[#5aa827] text-white font-black rounded-xl">
            {isPending ? <Loader2 className="size-5 animate-spin" /> : "Add Diagnosis"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
