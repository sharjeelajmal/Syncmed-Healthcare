"use client"
import * as React from "react"
import { useRouter } from "next/navigation"
import { Mail, ArrowLeft, Loader2, CheckCircle2, Lock, ShieldCheck, KeyRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { sendPasswordResetOTP, verifyResetOTP, updatePasswordAction } from "@/app/actions/auth.actions"

type Step = 'EMAIL' | 'OTP' | 'RESET'

export default function ForgotPasswordPage() {
  const [step, setStep] = React.useState<Step>('EMAIL')
  const [email, setEmail] = React.useState("")
  const [otp, setOtp] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const router = useRouter()

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return toast.error("Please enter your email address")
    setIsLoading(true)
    const res = await sendPasswordResetOTP(email)
    setIsLoading(false)
    if (res.success) {
      toast.success("OTP Sent", { description: "Please check your email for the 6-digit code." })
      setStep('OTP')
    } else {
      toast.error(res.error)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) return toast.error("Please enter a valid 6-digit code")
    setIsLoading(true)
    const res = await verifyResetOTP(email, otp)
    setIsLoading(false)
    if (res.success) {
      toast.success("Identity Verified", { description: "You can now reset your password." })
      setStep('RESET')
    } else {
      toast.error(res.error)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 8) return toast.error("Password must be at least 8 characters")
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match")
    
    setIsLoading(true)
    const res = await updatePasswordAction(email, newPassword)
    setIsLoading(false)
    
    if (res.success) {
      toast.success("Success!", { description: "Your password has been updated. Redirecting..." })
      setTimeout(() => router.push('/login'), 2000)
    } else {
      toast.error(res.error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-10 border border-slate-100">
        <Button variant="ghost" className="-ml-4 mb-8 text-slate-400 hover:text-slate-600 font-bold" onClick={() => step === 'EMAIL' ? router.push('/login') : setStep(step === 'OTP' ? 'EMAIL' : 'OTP')}>
          <ArrowLeft className="size-4 mr-2" /> {step === 'EMAIL' ? 'Back to Login' : 'Back'}
        </Button>

        {step === 'EMAIL' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Forgot Password?</h2>
            <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">No worries, it happens. Enter your email to receive a secure verification code.</p>
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="pl-12 h-14 bg-slate-50 border-slate-200 rounded-2xl focus-visible:ring-[#67BA2E] font-medium" />
                </div>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs bg-[#67BA2E] hover:bg-[#67BA2E]/90 text-white shadow-xl shadow-[#67BA2E]/20 transition-all">
                {isLoading ? <Loader2 className="size-5 animate-spin" /> : "Send Code"}
              </Button>
            </form>
          </div>
        )}

        {step === 'OTP' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="size-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6"><ShieldCheck className="size-8 text-blue-500" /></div>
            <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Verify Identity</h2>
            <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">We sent a 6-digit code to <span className="font-bold text-slate-800">{email}</span></p>
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Verification Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                  <Input maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="000000" className="pl-12 h-14 bg-slate-50 border-slate-200 rounded-2xl focus-visible:ring-[#67BA2E] font-black tracking-[0.5em] text-center text-lg" />
                </div>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs bg-slate-900 hover:bg-black text-white shadow-xl transition-all">
                {isLoading ? <Loader2 className="size-5 animate-spin" /> : "Verify Code"}
              </Button>
              <button type="button" onClick={handleSendOTP} className="w-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#67BA2E] transition-colors">Resend Code</button>
            </form>
          </div>
        )}

        {step === 'RESET' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">New Password</h2>
            <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">Create a strong, secure password for your clinical workspace.</p>
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="pl-12 h-14 bg-slate-50 border-slate-200 rounded-2xl focus-visible:ring-[#67BA2E] font-medium" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="pl-12 h-14 bg-slate-50 border-slate-200 rounded-2xl focus-visible:ring-[#67BA2E] font-medium" />
                  </div>
                </div>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs bg-[#67BA2E] hover:bg-[#67BA2E]/90 text-white shadow-xl shadow-[#67BA2E]/20 transition-all">
                {isLoading ? <Loader2 className="size-5 animate-spin" /> : "Update Password"}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
