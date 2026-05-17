"use client"
import * as React from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ShieldCheck, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { verifyMfaLoginAction } from "@/app/actions/auth.actions"

export default function MFAVerifyPage() {
  const { data: session } = useSession()
  const [otp, setOtp] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const router = useRouter()

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) return toast.error("Code must be 6 digits")

    const searchParams = new URLSearchParams(window.location.search)
    const email = searchParams.get("email") || session?.user?.email
    if (!email) return toast.error("User email not found. Please log in again.")

    setIsLoading(true)
    const res = await verifyMfaLoginAction(email, otp)
    setIsLoading(false)

    if (res.success) {
      toast.success("Verification successful")
      
      // Secure role-based redirection
      const role = (session?.user as any)?.role || "PATIENT"
      const redirectPath =
        role === "ADMIN" ? "/admin/dashboard" :
        role === "PROVIDER" ? "/provider/dashboard" :
        "/patient/dashboard"
      
      window.location.href = redirectPath
    } else {
      toast.error(res.error || "Invalid code")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-[2rem] shadow-xl p-8 border border-slate-100 text-center">
        <div className="size-16 bg-[#67BA2E]/10 rounded-full flex items-center justify-center mx-auto mb-6"><ShieldCheck className="size-8 text-[#67BA2E]" /></div>
        <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Enter Auth Code</h2>
        <p className="text-sm font-medium text-slate-500 mb-8">Enter the 6-digit code from your authenticator app.</p>
        <form onSubmit={handleVerify} className="space-y-6">
          <Input type="text" maxLength={6} autoFocus value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="• • • • • •" className="text-center tracking-[1em] font-mono font-black text-2xl h-16 bg-slate-50 border-slate-200 rounded-2xl focus-visible:ring-[#67BA2E]" />
          <Button type="submit" disabled={isLoading || otp.length !== 6} className="w-full h-12 rounded-xl font-bold bg-[#67BA2E] hover:bg-[#67BA2E]/90 text-white shadow-lg shadow-[#67BA2E]/20 transition-all group">
            {isLoading ? <Loader2 className="size-5 animate-spin" /> : <span className="flex items-center justify-center">Verify Identity <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" /></span>}
          </Button>
        </form>
      </div>
    </div>
  )
}
