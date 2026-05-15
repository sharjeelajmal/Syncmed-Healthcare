"use client"

import * as React from "react"
import { MoreVertical, Edit, Eye, Trash2, Loader2, AlertTriangle } from "lucide-react"
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
import { deletePatientAction } from "@/app/actions/patient.actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PatientTableActionsProps {
  patientId: string
}

export function PatientTableActions({ patientId }: PatientTableActionsProps) {
  const [isPending, setIsPending] = React.useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const router = useRouter()

  async function handleDelete() {
    setIsPending(true);
    const res = await deletePatientAction(patientId);
    if (res.success) {
      toast.success("Patient record purged successfully.");
      setShowDeleteDialog(false);
    } else {
      toast.error((res as any).error || "Failed to delete record.");
    }
    setIsPending(false);
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
            Archive Record
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-0 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-red-50 p-6 flex flex-col items-center text-center">
            <div className="size-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertTriangle className="size-8 text-red-600" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">Purge Patient Record?</DialogTitle>
              <DialogDescription className="text-slate-500 font-medium mt-2">
                This will permanently remove the patient's electronic medical record and all associated history.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6 bg-white flex flex-col gap-3">
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Protocol Notice</p>
                <p className="text-xs text-slate-600 font-bold text-center">Archiving follows HIPAA data retention and purging guidelines.</p>
             </div>
             <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteDialog(false)}
                  className="flex-1 h-12 rounded-xl font-bold border-slate-200"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleDelete}
                  disabled={isPending}
                  className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-200"
                >
                  {isPending ? <Loader2 className="size-4 animate-spin" /> : "Confirm Archive"}
                </Button>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
