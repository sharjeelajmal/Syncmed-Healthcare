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
  Loader2
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
            <Key className="size-5 text-[#67BA2E]" />
            Multi-Factor Auth
          </CardTitle>
          <CardDescription className="font-medium text-slate-500 mt-1">
            Manage security verification methods for this account.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8 space-y-6">
          <div className="p-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center text-center">
            <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Lock className="size-6 text-slate-400" />
            </div>
            <span className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Security Status</span>
            <span className="text-slate-600 font-black">MFA Not Enabled</span>
            <p className="text-[10px] text-slate-400 mt-2 max-w-[200px]">The user has not configured additional security layers yet.</p>
          </div>

          <Button 
            variant="outline" 
            onClick={handleResetMFA}
            className="w-full h-12 border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="size-4" />
            Reset MFA Credentials
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
