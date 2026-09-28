"use client"

import * as React from "react"
import { AlertTriangle, Loader2 } from "lucide-react"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ConfirmDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: React.ReactNode
  /** Text the admin must type to enable the delete button. */
  confirmText: string
  isPending: boolean
  onConfirm: () => void
}

/** Irreversible-delete confirmation that requires typing the record's name. */
export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  isPending,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  const [typed, setTyped] = React.useState("")
  const matches = typed.trim().toLowerCase() === confirmText.trim().toLowerCase()

  const handleOpenChange = (next: boolean) => {
    if (isPending) return
    if (!next) setTyped("")
    onOpenChange(next)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md rounded-2xl">
        <AlertDialogHeader>
          <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="size-7 text-red-600" />
          </div>
          <AlertDialogTitle className="text-xl font-black tracking-tight text-slate-900">{title}</AlertDialogTitle>
          <AlertDialogDescription className="font-medium text-slate-500">{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <label htmlFor="confirm-delete-input" className="text-xs font-bold text-slate-600">
            Type <span className="font-black text-slate-900">{confirmText}</span> to confirm
          </label>
          <Input
            id="confirm-delete-input"
            autoComplete="off"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            disabled={isPending}
            className="h-11 rounded-xl"
          />
        </div>

        <AlertDialogFooter className="gap-3">
          <AlertDialogCancel disabled={isPending} className="h-11 flex-1 rounded-xl font-bold">
            Cancel
          </AlertDialogCancel>
          <Button
            onClick={onConfirm}
            disabled={!matches || isPending}
            className="h-11 flex-1 rounded-xl bg-red-600 font-bold text-white hover:bg-red-700"
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : "Delete Permanently"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
