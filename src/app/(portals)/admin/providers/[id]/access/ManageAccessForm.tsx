"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  ShieldCheck, 
  ShieldAlert, 
  Key, 
  Lock, 
  ArrowLeft,
  UserCheck,
  RefreshCw,
  Loader2,
  Laptop,
  Smartphone,
  LogOut,
  MonitorSmartphone
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateProviderAccessAction } from "@/app/actions/provider.actions"

interface ManageAccessFormProps {
  userId: string
  initialIsActive: boolean
}

export function ManageAccessForm({ userId, initialIsActive }: ManageAccessFormProps) {
  const [isActive, setIsActive] = React.useState(initialIsActive)
  const [isPending, startTransition] = React.useTransition()
  const router = useRouter()

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateProviderAccessAction(userId, { isActive })
      if (res.success) {
        toast.success("Security credentials updated successfully")
        router.refresh()
      } else {
        toast.error(res.error || "Failed to update access")
      }
    })
  }

  const handleResetMFA = () => {
    toast.info("MFA reset functionality is coming soon.")
  }

  const handleRevokeSessions = () => {
    toast.success("All active sessions revoked successfully")
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden bg-white">
        <CardHeader className="p-8">
          <CardTitle className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Lock className="size-5 text-[#67BA2E]" />
            Account Status
          </CardTitle>
          <CardDescription className="font-medium text-slate-500 mt-1">
            Control the professional's ability to access the platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8 space-y-6">
          <div className="space-y-3">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Authorization</Label>
            <Select 
              value={isActive ? "active" : "inactive"} 
              onValueChange={(val) => setIsActive(val === "active")}
            >
              <SelectTrigger className="h-12 rounded-xl border-slate-200 focus:ring-[#67BA2E] focus:border-[#67BA2E] font-bold text-slate-700">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                <SelectItem value="active" className="font-bold text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700 py-3 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4" />
                    Active / Authorized
                  </div>
                </SelectItem>
                <SelectItem value="inactive" className="font-bold text-red-500 focus:bg-red-50 focus:text-red-600 py-3 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="size-4" />
                    Inactive / Restricted
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Platform Role</Label>
            <div className="h-12 flex items-center gap-3 px-4 bg-slate-50 border border-slate-100 rounded-xl">
              <UserCheck className="size-4 text-slate-400" />
              <span className="font-bold text-slate-600">Provider (Medical Professional)</span>
            </div>
          </div>

          <div className="pt-4">
            <Button 
              onClick={handleSave} 
              disabled={isPending}
              className="w-full h-12 bg-[#67BA2E] hover:bg-[#5aa827] text-white font-black rounded-xl shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Synchronizing...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden bg-white">
        <CardHeader className="p-8">
          <CardTitle className="text-xl font-black text-slate-800 flex items-center gap-2">
            <MonitorSmartphone className="size-5 text-[#67BA2E]" />
            Session & Recovery
          </CardTitle>
          <CardDescription className="font-medium text-slate-500 mt-1">
            Manage active security sessions and devices for this account.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          {/* Active Devices List UI */}
          <div className="space-y-3 mb-6">
            {/* Session Item 1 (Current) */}
            <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50">
              <Laptop className="size-5 text-slate-400 shrink-0" />
              <div className="flex-1 flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-slate-700">Mac OS • Safari</p>
                  <p className="text-[10px] font-semibold text-slate-500 mt-0.5">IP: 192.168.1.1</p>
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider text-[#67BA2E] bg-[#67BA2E]/10 px-2.5 py-1 rounded-md shrink-0">
                  Current Session
                </span>
              </div>
            </div>

            {/* Session Item 2 */}
            <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50">
              <Smartphone className="size-5 text-slate-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-700">iOS • SyncMed App</p>
                <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Last active: 2 hrs ago</p>
              </div>
            </div>
          </div>

          {/* Revoke Sessions Action Button */}
          <button 
            onClick={handleRevokeSessions}
            className="w-full h-12 border border-red-100 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <LogOut className="size-4 transition-transform group-hover:scale-110" />
            Revoke All Active Sessions
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
