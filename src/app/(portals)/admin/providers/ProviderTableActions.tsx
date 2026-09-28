"use client"

import * as React from "react"
import {
  MoreVertical,
  UserCog,
  ShieldAlert,
  Loader2,
  Eye,
  Check,
  Globe,
  Trash2
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"
import {
  deleteProviderAction,
  toggleProviderStatusAction,
  updateProviderUniversalAccessAction,
} from "@/app/actions/provider.actions"
import { cn } from "@/lib/utils"

interface ProviderTableActionsProps {
  userId: string
  providerName: string
  isActive: boolean
  hasUniversalAccess: boolean
}

export function ProviderTableActions({
  userId,
  providerName,
  isActive,
  hasUniversalAccess,
}: ProviderTableActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()
  const [isDeleting, startDelete] = React.useTransition()
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)

  const handleToggleStatus = () => {
    startTransition(async () => {
      const res = await toggleProviderStatusAction(userId, isActive)
      if (res.success) {
        toast.success(isActive ? "Provider suspended" : "Provider activated")
        router.refresh()
      } else {
        toast.error(res.error || "Failed to update status")
      }
    })
  }

  const handleToggleUniversalAccess = () => {
    const enabled = !hasUniversalAccess
    startTransition(async () => {
      const res = await updateProviderUniversalAccessAction(userId, enabled)
      if (res.success) {
        toast.success(
          enabled
            ? `${providerName} can now view all patient charts`
            : `${providerName} limited to assigned patients`
        )
        router.refresh()
      } else {
        toast.error(res.error || "Failed to update chart access")
      }
    })
  }

  const handleDelete = () => {
    startDelete(async () => {
      const res = await deleteProviderAction(userId)
      if (res.success) {
        toast.success(`${providerName} was deleted.`)
        setShowDeleteDialog(false)
        router.refresh()
      } else {
        // Blockers (existing patient records) are explained in the message.
        toast.error(res.error || "Failed to delete provider", { duration: 8000 })
      }
    })
  }

  const busy = isPending || isDeleting

  return (
    <>
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="size-8 p-0 rounded-full hover:bg-slate-100" disabled={busy}>
          {busy ? (
            <Loader2 className="size-4 animate-spin text-slate-400" />
          ) : (
            <MoreVertical className="size-4 text-slate-400" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-2 rounded-xl shadow-2xl border-slate-100 bg-white z-[9999]">
        <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">Account Control</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-100" />

        <DropdownMenuItem
          asChild
          className="flex items-center gap-2 px-3 py-3 cursor-pointer rounded-lg font-bold text-slate-700 hover:bg-emerald-50 hover:text-[#67BA2E] focus:bg-emerald-50 focus:text-[#67BA2E] transition-all"
        >
          <Link href={`/admin/providers/${userId}`}>
            <Eye className="size-4" />
            View Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          asChild
          className="flex items-center gap-2 px-3 py-3 cursor-pointer rounded-lg font-bold text-slate-700 hover:bg-slate-50 focus:bg-slate-50 transition-all"
        >
          <Link href={`/admin/providers/${userId}/access`}>
            <UserCog className="size-4" />
            Manage Access
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault()
            handleToggleUniversalAccess()
          }}
          className="flex items-center gap-2 px-3 py-3 cursor-pointer rounded-lg font-bold text-slate-700 hover:bg-slate-50 focus:bg-slate-50 transition-all"
        >
          <Globe className="size-4 shrink-0" />
          <span className="flex-1 leading-tight">
            General Universal Access
            <span className="block text-[10px] font-medium text-slate-400">View all patient charts</span>
          </span>
          <Switch
            checked={hasUniversalAccess}
            disabled={busy}
            tabIndex={-1}
            aria-hidden
            className="pointer-events-none data-checked:bg-[#67BA2E]"
          />
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-slate-100" />

        <DropdownMenuItem
          className={cn(
            "flex items-center gap-2 px-3 py-3 cursor-pointer rounded-lg font-bold transition-all",
            isActive
              ? "text-red-600 hover:bg-red-50 focus:bg-red-50"
              : "text-[#67BA2E] hover:bg-emerald-50 focus:bg-emerald-50"
          )}
          onClick={handleToggleStatus}
        >
          {isActive ? (
            <>
              <ShieldAlert className="size-4" />
              Suspend Provider
            </>
          ) : (
            <>
              <Check className="size-4" />
              Activate Provider
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={() => setShowDeleteDialog(true)}
          className="flex items-center gap-2 px-3 py-3 cursor-pointer rounded-lg font-bold text-red-600 hover:bg-red-50 focus:bg-red-50 transition-all"
        >
          <Trash2 className="size-4" />
          Delete Provider
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <ConfirmDeleteDialog
      open={showDeleteDialog}
      onOpenChange={setShowDeleteDialog}
      title="Delete Provider?"
      description={
        <>
          This permanently deletes <strong>{providerName}</strong>&apos;s login, profile,
          availability and messages. Providers who still have appointments, assessments
          or notes on any patient can&apos;t be deleted. Suspend them instead.
        </>
      }
      confirmText={providerName}
      isPending={isDeleting}
      onConfirm={handleDelete}
    />
    </>
  )
}
