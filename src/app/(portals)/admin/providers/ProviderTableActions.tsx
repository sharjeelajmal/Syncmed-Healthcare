"use client"

import * as React from "react"
import { 
  MoreVertical, 
  UserCog, 
  ShieldCheck, 
  ShieldAlert, 
  Loader2,
  Eye,
  Check
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toggleProviderStatusAction } from "@/app/actions/provider.actions"
import { cn } from "@/lib/utils"

interface ProviderTableActionsProps {
  userId: string
  isActive: boolean
}

export function ProviderTableActions({ userId, isActive }: ProviderTableActionsProps) {
  const [isPending, startTransition] = React.useTransition()

  const handleToggleStatus = () => {
    startTransition(async () => {
      const res = await toggleProviderStatusAction(userId, isActive)
      if (res.success) {
        toast.success(isActive ? "Provider suspended" : "Provider activated")
      } else {
        toast.error(res.error || "Failed to update status")
      }
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="size-8 p-0 rounded-full hover:bg-slate-100" disabled={isPending}>
          {isPending ? (
            <Loader2 className="size-4 animate-spin text-slate-400" />
          ) : (
            <MoreVertical className="size-4 text-slate-400" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-2xl border-slate-100 bg-white z-[9999]">
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
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
