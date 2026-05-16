"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Mail, 
  ArrowLeft, 
  Loader2, 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { 
  sendPasswordResetOTP, 
  verifyResetOTP, 
  updatePasswordAction 
} from "@/app/actions/auth.actions"

type Step = 'EMAIL' | 'OTP' | 'RESET'

export default function ForgotPasswordPage() {
  const [step, setStep] = React.useState<Step>('EMAIL')
  const [email, setEmail] = React.useState("")
  const [otp, setOtp] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const router = useRouter()

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return toast.error("Please enter your email address")
    setIsLoading(true)
    try {
      const res = await sendPasswordResetOTP(email)
      if (res.success) {
        toast.success("Security Code Sent", { 
          description: "Check your inbox for the 6-digit verification code." 
        })
        setStep('OTP')
      } else {
        toast.error(res.error || "Failed to send code")
      }
    } catch (err) {
      toast.error("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) return toast.error("Please enter the 6-digit code")
    setIsLoading(true)
    try {
      const res = await verifyResetOTP(email, otp)
      if (res.success) {
        toast.success("Identity Verified", { 
          description: "Security check passed. You can now reset your password." 
        })
        setStep('RESET')
      } else {
        toast.error(res.error || "Invalid verification code")
      }
    } catch (err) {
      toast.error("Verification failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 8) return toast.error("Password must be at least 8 characters")
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match")
    
    setIsLoading(true)
    try {
      const res = await updatePasswordAction(email, newPassword)
      if (res.success) {
        toast.success("Password Updated", { 
          description: "Your account is secure. Redirecting to login..." 
        })
        setTimeout(() => router.push('/login'), 2000)
      } else {
        toast.error(res.error || "Failed to update password")
      }
    } catch (err) {
      toast.error("System error during reset")
    } finally {
      setIsLoading(false)
    }
  }

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/50 p-4 selection:bg-green-100">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-50 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-slate-100 rounded-full blur-[120px] opacity-60" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo/Branding Header */}
        <div className="text-center mb-8">
           <img src="/logo.png" alt="SyncMed" className="h-10 mx-auto mb-2" />
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 p-8 md:p-10 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 'EMAIL' && (
              <motion.div
                key="email-step"
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Forgot Password?</h2>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed">
                    Enter your registered email and we'll send you a secure 6-digit code to reset your password.
                  </p>
                </div>

                <form onSubmit={handleSendOTP} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-300 group-focus-within:text-[#67BA2E] transition-colors" />
                      <Input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="doctor@syncmed.com" 
                        className="pl-12 h-14 bg-slate-50 border-slate-200 rounded-2xl focus-visible:ring-[#67BA2E] focus-visible:border-[#67BA2E] transition-all font-medium text-slate-700"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs bg-[#67BA2E] hover:bg-[#5aa827] text-white shadow-xl shadow-green-100 transition-all active:scale-[0.98]"
                  >
                    {isLoading ? <Loader2 className="size-5 animate-spin" /> : "Send Secure Code"}
                  </Button>
                </form>

                <button 
                  onClick={() => router.push('/login')}
                  className="flex items-center justify-center w-full text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors gap-2"
                >
                  <ArrowLeft className="size-3.5" /> Back to Login
                </button>
              </motion.div>
            )}

            {step === 'OTP' && (
              <motion.div
                key="otp-step"
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                <div className="flex justify-center">
                  <div className="size-16 bg-green-50 rounded-[1.25rem] flex items-center justify-center border border-green-100">
                    <ShieldCheck className="size-8 text-[#67BA2E]" />
                  </div>
                </div>

                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Check Your Email</h2>
                  <p className="text-sm font-medium text-slate-500">
                    We've sent a code to <span className="text-slate-900 font-bold">{email}</span>
                  </p>
                </div>

                <form onSubmit={handleVerifyOTP} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 text-center block">Verification Code</label>
                    <div className="relative group">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-300 group-focus-within:text-[#67BA2E] transition-colors" />
                      <Input 
                        maxLength={6} 
                        value={otp} 
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                        placeholder="000000" 
                        className="pl-12 h-14 bg-slate-50 border-slate-200 rounded-2xl focus-visible:ring-[#67BA2E] font-black tracking-[0.5em] text-center text-xl text-[#67BA2E]"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs bg-slate-900 hover:bg-black text-white shadow-xl transition-all active:scale-[0.98]"
                  >
                    {isLoading ? <Loader2 className="size-5 animate-spin" /> : "Verify Identity"}
                  </Button>

                  <div className="text-center">
                    <button 
                      type="button" 
                      onClick={handleSendOTP} 
                      className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 hover:text-[#67BA2E] transition-colors"
                    >
                      Didn't receive code? Resend
                    </button>
                  </div>
                </form>

                <button 
                  onClick={() => setStep('EMAIL')}
                  className="flex items-center justify-center w-full text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors gap-2"
                >
                  <ArrowLeft className="size-3.5" /> Use different email
                </button>
              </motion.div>
            )}

            {step === 'RESET' && (
              <motion.div
                key="reset-step"
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">New Password</h2>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed">
                    Your identity is verified. Please create a new strong password for your account.
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">New Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-300 group-focus-within:text-[#67BA2E] transition-colors" />
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          value={newPassword} 
                          onChange={(e) => setNewPassword(e.target.value)} 
                          placeholder="••••••••" 
                          className="pl-12 h-14 bg-slate-50 border-slate-200 rounded-2xl focus-visible:ring-[#67BA2E] font-medium"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#67BA2E] transition-colors"
                        >
                          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">Confirm Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-300 group-focus-within:text-[#67BA2E] transition-colors" />
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          value={confirmPassword} 
                          onChange={(e) => setConfirmPassword(e.target.value)} 
                          placeholder="••••••••" 
                          className="pl-12 h-14 bg-slate-50 border-slate-200 rounded-2xl focus-visible:ring-[#67BA2E] font-medium"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs bg-[#67BA2E] hover:bg-[#5aa827] text-white shadow-xl shadow-green-100 transition-all active:scale-[0.98]"
                  >
                    {isLoading ? <Loader2 className="size-5 animate-spin" /> : "Update Password"}
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer info */}
        <p className="mt-8 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          Secure Medical Infrastructure &bull; SyncMed &copy; 2026
        </p>
      </div>
    </div>
  )
}
