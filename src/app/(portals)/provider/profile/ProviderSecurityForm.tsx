"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  KeyRound,
  Lock,
  Key,
  Save,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updatePassword } from "@/app/actions/settings.actions"
import { cn } from "@/lib/utils"

const strengthChecks = [
  { key: "length" as const, label: "8+ Characters", desc: "Min length" },
  { key: "upper" as const, label: "Uppercase", desc: "Capital letter" },
  { key: "number" as const, label: "Number", desc: "Numeric value" },
  { key: "special" as const, label: "Special Char", desc: "Symbol (@#$)" },
]

export function ProviderSecurityForm() {
  const [isPending, startTransition] = React.useTransition()
  const [showCurrent, setShowCurrent] = React.useState(false)
  const [showNew, setShowNew] = React.useState(false)
  const [showConfirm, setShowConfirm] = React.useState(false)

  const [passwords, setPasswords] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const checks = {
    length: passwords.newPassword.length >= 8,
    number: /[0-9]/.test(passwords.newPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(passwords.newPassword),
    upper: /[A-Z]/.test(passwords.newPassword),
  }
  const strengthScore = Object.values(checks).filter(Boolean).length
  const passwordsMatch =
    passwords.confirmPassword.length > 0 &&
    passwords.newPassword === passwords.confirmPassword

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    if (strengthScore < 4) {
      toast.error("Please meet all password strength requirements.")
      return
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match.")
      return
    }
    if (passwords.currentPassword === passwords.newPassword) {
      toast.error("New password must be different from your current password.")
      return
    }

    startTransition(async () => {
      const result = await updatePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      })

      if (result.success) {
        toast.success("Password updated successfully.", {
          description: "Use your new password the next time you sign in.",
          icon: <ShieldCheck className="size-4 text-[#67BA2E]" />,
        })
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" })
        setShowCurrent(false)
        setShowNew(false)
        setShowConfirm(false)
      } else {
        toast.error(result.message || "Failed to update password.", {
          description: result.message?.toLowerCase().includes("current")
            ? "Verify your current password and try again."
            : "Something went wrong. Please try again.",
        })
      }
    })
  }

  return (
    <Card className="overflow-hidden rounded-[2.5rem] border-slate-200 bg-white shadow-xl">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-slate-900 text-white">
            <KeyRound className="size-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-black text-slate-800">
              Security & Access
            </CardTitle>
            <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Update your credentials
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <p className="text-sm font-medium text-slate-500">
            Change your portal password securely. Your session stays active after
            updating — use the new password on your next sign-in.
          </p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <PasswordField
              id="currentPassword"
              label="Current Password"
              icon={<Lock className="size-4" />}
              value={passwords.currentPassword}
              onChange={(value) =>
                setPasswords((prev) => ({ ...prev, currentPassword: value }))
              }
              show={showCurrent}
              onToggleShow={() => setShowCurrent((prev) => !prev)}
              autoComplete="current-password"
            />
            <PasswordField
              id="newPassword"
              label="New Password"
              icon={<Key className="size-4" />}
              value={passwords.newPassword}
              onChange={(value) =>
                setPasswords((prev) => ({ ...prev, newPassword: value }))
              }
              show={showNew}
              onToggleShow={() => setShowNew((prev) => !prev)}
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-5 rounded-[2rem] border border-slate-100 bg-slate-50/80 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Password Strength
                </span>
                <p className="text-[9px] font-medium tracking-tight text-slate-400">
                  Clinical-grade encryption requirements
                </p>
              </div>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest",
                  strengthScore === 0 && "bg-slate-100 text-slate-300",
                  strengthScore > 0 &&
                    strengthScore <= 2 &&
                    "bg-red-50 text-red-500",
                  strengthScore === 3 && "bg-orange-50 text-orange-500",
                  strengthScore === 4 && "bg-emerald-50 text-[#67BA2E]"
                )}
              >
                {strengthScore === 0
                  ? "None"
                  : strengthScore <= 2
                    ? "Weak"
                    : strengthScore === 3
                      ? "Good"
                      : "Strong"}
              </span>
            </div>

            <div className="flex h-1.5 gap-1.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "flex-1 rounded-full transition-all duration-500",
                    i <= strengthScore
                      ? strengthScore <= 2
                        ? "bg-red-500"
                        : strengthScore === 3
                          ? "bg-orange-500"
                          : "bg-[#67BA2E]"
                      : "bg-slate-200"
                  )}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {strengthChecks.map((check) => {
                const passed = checks[check.key]
                return (
                  <motion.div
                    key={check.key}
                    initial={false}
                    animate={{ opacity: passed ? 1 : 0.65 }}
                    className="flex flex-col gap-1.5 rounded-2xl border border-slate-100 bg-white p-3"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex size-4 items-center justify-center rounded-full border-2 transition-colors",
                          passed
                            ? "border-[#67BA2E] bg-[#67BA2E]"
                            : "border-slate-200 bg-white"
                        )}
                      >
                        {passed && (
                          <div className="size-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-[10px] font-black uppercase tracking-tight",
                          passed ? "text-slate-900" : "text-slate-400"
                        )}
                      >
                        {check.label}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "pl-6 text-[9px] font-bold tracking-tight",
                        passed ? "text-[#67BA2E]" : "text-slate-400"
                      )}
                    >
                      {passed ? "Requirement met" : `Need: ${check.desc}`}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400"
            >
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                value={passwords.confirmPassword}
                onChange={(e) =>
                  setPasswords((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                placeholder="Re-enter new password"
                autoComplete="new-password"
                className="h-12 rounded-xl border-slate-200 pr-11 font-bold text-slate-700 focus:border-[#67BA2E] focus:ring-[#67BA2E]"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-[#67BA2E]"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {passwords.confirmPassword.length > 0 && (
              <p
                className={cn(
                  "ml-1 text-[10px] font-bold",
                  passwordsMatch ? "text-[#67BA2E]" : "text-red-500"
                )}
              >
                {passwordsMatch
                  ? "Passwords match"
                  : "Passwords do not match yet"}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-md text-[10px] font-bold uppercase leading-relaxed tracking-wider text-slate-400">
              Never share your credentials. SyncMed staff will never ask for your
              password.
            </p>
            <Button
              type="submit"
              disabled={
                isPending ||
                !passwords.currentPassword ||
                strengthScore < 4 ||
                !passwordsMatch
              }
              className="h-12 gap-2 rounded-xl bg-slate-900 px-8 font-black uppercase tracking-widest text-xs text-white shadow-lg transition-all hover:bg-black"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Update Password
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function PasswordField({
  id,
  label,
  icon,
  value,
  onChange,
  show,
  onToggleShow,
  autoComplete,
}: {
  id: string
  label: string
  icon: React.ReactNode
  value: string
  onChange: (value: string) => void
  show: boolean
  onToggleShow: () => void
  autoComplete: string
}) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400"
      >
        {label}
      </Label>
      <div className="relative">
        <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300">
          {icon}
        </div>
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          autoComplete={autoComplete}
          className="h-12 rounded-xl border-slate-200 pl-10 pr-11 font-bold text-slate-700 focus:border-[#67BA2E] focus:ring-[#67BA2E]"
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-[#67BA2E]"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  )
}
