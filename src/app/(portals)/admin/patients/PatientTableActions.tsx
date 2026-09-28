"use client"

import * as React from "react"
import { MoreVertical, Edit, Eye, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"
import { deletePatientAction } from "@/app/actions/patient.actions"

interface PatientTableActionsProps {
  patientId: string
  patientName: string
}

export function PatientTableActions({ patientId, patientName }: PatientTableActionsProps) {
  const [isPending, startTransition] = React.useTransition()
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const router = useRouter()

  function handleDelete() {
    startTransition(async () => {
      const res = await deletePatientAction(patientId)
      if (res.success) {
        toast.success(`${patientName} was deleted.`)
        setShowDeleteDialog(false)
        router.refresh()
      } else {
        toast.error(res.error || "Failed to delete patient.")
      }
    })
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="size-8 p-0 rounded-full hover:bg-slate-100 transition-colors" disabled={isPending}>
            {isPending ? (
              <Loader2 className="size-4 animate-spin text-slate-400" />
            ) : (
              <MoreVertical className="size-4 text-slate-400" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-2xl border-slate-100 bg-white z-[9999]">
          <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">Clinical Management</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-100" />

          <DropdownMenuItem
            className="flex items-center gap-2 px-3 py-3 cursor-pointer rounded-lg font-bold text-slate-700 hover:bg-emerald-50 hover:text-[#67BA2E] focus:bg-emerald-50 focus:text-[#67BA2E] transition-all"
            onClick={() => router.push(`/admin/patients/${patientId}`)}
          >
            <Edit className="size-4" />
            Edit Profile
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex items-center gap-2 px-3 py-3 cursor-pointer rounded-lg font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600 transition-all"
            onClick={() => router.push(`/admin/patients/${patientId}?mode=view`)}
          >
            <Eye className="size-4" />
            View Profile
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-slate-100" />

          <DropdownMenuItem
            onSelect={() => setShowDeleteDialog(true)}
            className="flex items-center gap-2 px-3 py-3 cursor-pointer rounded-lg font-bold text-red-600 hover:bg-red-50 focus:bg-red-50 transition-all"
          >
            <Trash2 className="size-4" />
            Delete Patient
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Patient?"
        description={
          <>
            This permanently deletes <strong>{patientName}</strong>&apos;s login and entire record:
            appointments, assessments, invoices, receipts, notes, lab results and messages.
            This cannot be undone.
          </>
        }
        confirmText={patientName}
        isPending={isPending}
        onConfirm={handleDelete}
      />
    </>
  )
}
