"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { format, formatDistanceToNow } from "date-fns"
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  UserCheck,
  Loader2,
  Mail,
  Clock,
  RefreshCw,
  Key,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  updateProviderAccessAction,
  sendProviderPasswordResetAction,
  sendProviderSecurityWarningAction,
} from "@/app/actions/provider.actions"
import { cn } from "@/lib/utils"

export type ProviderAccessSnapshot = {
  userId: string
  firstName: string
  lastName: string
  email: string
  isActive: boolean
  mfaEnabled: boolean
  lastActive: string
  createdAt: string
  updatedAt: string
  specialty: string
  licenseNumber: string
}

type AccessLiveData = {
  isActive: boolean
  mfaEnabled: boolean
  lastActive: string
  updatedAt: string
}

function applyLivePatch(
  prev: ProviderAccessSnapshot,
  patch?: AccessLiveData
): ProviderAccessSnapshot {
  if (!patch) return prev
  return {
    ...prev,
    isActive: patch.isActive,
    mfaEnabled: patch.mfaEnabled,
    lastActive: patch.lastActive,
    updatedAt: patch.updatedAt,
  }
}

interface ManageAccessFormProps {
  initialData: ProviderAccessSnapshot
}

export function ManageAccessForm({ initialData }: ManageAccessFormProps) {
  const router = useRouter()
  const [data, setData] = React.useState(initialData)
  const [isActive, setIsActive] = React.useState(initialData.isActive)
  const [isSaving, startSave] = React.useTransition()
  const [isSendingReset, startSendReset] = React.useTransition()
  const [isSendingWarning, startSendWarning] = React.useTransition()

  React.useEffect(() => {
    setData(initialData)
    setIsActive(initialData.isActive)
  }, [initialData])

  const hasUnsavedStatus = isActive !== data.isActive

  const handleSave = () => {
    startSave(async () => {
      const res = await updateProviderAccessAction(data.userId, { isActive })
      if (res.success && res.data) {
        setData((prev) => applyLivePatch(prev, res.data))
        setIsActive(res.data.isActive)
        toast.success(
          res.data.isActive
            ? "Provider authorized for platform access"
            : "Provider access restricted"
        )
        router.refresh()
      } else {
        toast.error(res.error || "Failed to update access")
      }
    })
  }

  const handleSendPasswordReset = () => {
    startSendReset(async () => {
      const res = await sendProviderPasswordResetAction(data.userId)
      if (res.success) {
        toast.success(`Password reset email sent to ${data.email}`)
      } else {
        toast.error(res.error || "Failed to send password reset email")
      }
    })
  }

  const handleSendSecurityWarning = () => {
    if (
      !confirm(
        `Send a high-priority security alert to ${data.email}? The provider will be advised to review their account immediately.`
      )
    ) {
      return
    }

    startSendWarning(async () => {
      const res = await sendProviderSecurityWarningAction(data.userId)
      if (res.success) {
        toast.success(`Security warning sent to ${data.email}`)
      } else {
        toast.error(res.error || "Failed to send security warning")
      }
    })
  }

  const lastActiveLabel = formatDistanceToNow(new Date(data.lastActive), {
    addSuffix: true,
  })

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <Card className="overflow-hidden rounded-3xl border-slate-200 bg-white shadow-sm lg:col-span-2">
        <CardHeader className="border-b border-slate-50 p-8">
          <CardTitle className="flex items-center gap-2 text-xl font-black text-slate-800">
            <Lock className="size-5 text-[#67BA2E]" />
            Account Status
          </CardTitle>
          <CardDescription className="mt-1 font-medium text-slate-500">
            Control platform authorization for this medical professional.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-8">
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              variant="outline"
              className={cn(
                "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest",
                data.isActive
                  ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                  : "border-red-200 bg-red-50 text-red-600"
              )}
            >
              {data.isActive ? "Authorized" : "Restricted"}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest",
                data.mfaEnabled
                  ? "border-[#67BA2E]/30 bg-emerald-50 text-[#67BA2E]"
                  : "border-slate-200 bg-slate-50 text-slate-500"
              )}
            >
              MFA {data.mfaEnabled ? "Enabled" : "Disabled"}
            </Badge>
            {hasUnsavedStatus && (
              <Badge className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-700">
                Unsaved changes
              </Badge>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Current Authorization
              </Label>
              <Select
                value={isActive ? "active" : "inactive"}
                onValueChange={(val) => setIsActive(val === "active")}
                disabled={isSaving || isSendingReset || isSendingWarning}
              >
                <SelectTrigger className="h-12 rounded-xl border-slate-200 font-bold text-slate-700 focus:border-[#67BA2E] focus:ring-[#67BA2E]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                  <SelectItem
                    value="active"
                    className="cursor-pointer py-3 font-bold text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="size-4" />
                      Active / Authorized
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="inactive"
                    className="cursor-pointer py-3 font-bold text-red-500 focus:bg-red-50 focus:text-red-600"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="size-4" />
                      Inactive / Restricted
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Platform Role
              </Label>
              <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4">
                <UserCheck className="size-4 text-slate-400" />
                <span className="font-bold text-slate-600">
                  Provider (Medical Professional)
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-5 md:grid-cols-2">
            <DetailRow
              icon={<Mail className="size-4 text-[#67BA2E]" />}
              label="Login email"
              value={data.email}
            />
            <DetailRow
              icon={<UserCheck className="size-4 text-[#67BA2E]" />}
              label="License"
              value={data.licenseNumber}
            />
            <DetailRow
              icon={<ShieldCheck className="size-4 text-[#67BA2E]" />}
              label="Specialty"
              value={data.specialty}
            />
            <DetailRow
              icon={<Clock className="size-4 text-[#67BA2E]" />}
              label="Last activity"
              value={lastActiveLabel}
            />
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button
              onClick={handleSave}
              disabled={isSaving || isSendingReset || isSendingWarning || !hasUnsavedStatus}
              className="h-12 md:flex-1 rounded-xl bg-[#67BA2E] font-black text-white shadow-lg shadow-emerald-100 hover:bg-[#5aa827]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 size-5 animate-spin" />
                  Synchronizing...
                </>
              ) : (
                "Save Authorization"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.refresh()}
              className="h-12 rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw className="mr-2 size-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-3xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-50 p-8">
          <CardTitle className="flex items-center gap-2 text-xl font-black text-slate-800">
            <Key className="size-5 text-[#67BA2E]" />
            Credential Management
          </CardTitle>
          <CardDescription className="mt-1 font-medium text-slate-500">
            Handle account recovery and security alerts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-8">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-bold text-slate-700">Delivery address</p>
            <p className="mt-1 truncate text-sm font-bold text-slate-800">{data.email}</p>
            <p className="mt-3 text-[10px] leading-relaxed text-slate-400">
              Account enrolled{" "}
              {format(new Date(data.createdAt), "MMM dd, yyyy · hh:mm a")}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={isSendingReset || isSendingWarning || isSaving}
            onClick={handleSendPasswordReset}
            className="h-12 w-full rounded-xl border-slate-200 font-bold text-slate-700 hover:border-[#67BA2E]/30 hover:bg-emerald-50 hover:text-[#67BA2E]"
          >
            {isSendingReset ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Key className="mr-2 size-4" />
            )}
            Send Password Reset
          </Button>

          <button
            type="button"
            onClick={handleSendSecurityWarning}
            disabled={isSendingWarning || isSendingReset || isSaving}
            className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 font-bold text-red-600 transition-all hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSendingWarning ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ShieldAlert className="size-4" />
            )}
            Send Security Warning
          </button>
        </CardContent>
      </Card>
    </div>
  )
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {label}
        </p>
        <p className="truncate text-sm font-bold text-slate-700">{value}</p>
      </div>
    </div>
  )
}
