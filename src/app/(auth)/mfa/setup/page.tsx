"use client"
import * as React from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ShieldAlert, Loader2, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { generateMfaSecretAction, verifyAndEnableMfaAction } from "@/app/actions/auth.actions"

export default function MFASetupPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [otp, setOtp] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [qrData, setQrData] = React.useState<{ secret: string, url: string } | null>(null)
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    async function initMfa() {
      if (!session?.user?.email) return
      const res = await generateMfaSecretAction(session.user.email)
      if (res.success && res.secret && res.qrCodeDataUrl) {
        setQrData({ secret: res.secret, url: res.qrCodeDataUrl })
      } else {
        toast.error("Failed to generate MFA setup")
      }
    }
    initMfa()
  }, [session])

  const handleCopy = () => { 
    if(qrData?.secret) {
      navigator.clipboard.writeText(qrData.secret); 
      setCopied(true); setTimeout(() => setCopied(false), 2000); 
      toast.success("Copied!"); 
    }
  }

  const handleVerify = async () => {
    if (otp.length !== 6) return toast.error("Enter a valid 6-digit code")
    if (!session?.user?.email) return toast.error("Session expired")
    
    setIsLoading(true)
    const res = await verifyAndEnableMfaAction(session.user.email, otp)
    setIsLoading(false)
    
    if (res.success) {
      toast.success("MFA Enabled Successfully!")
      router.push('/dashboard') // Handle role-based redirect if needed
    } else {
      toast.error(res.error || "Invalid code")
    }
  }

  if (!qrData) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="size-8 animate-spin text-[#67BA2E]" /></div>

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl p-8 border border-slate-100 text-center">
        <div className="size-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6"><ShieldAlert className="size-8 text-blue-500" /></div>
        <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Setup Two-Factor Auth</h2>
        <p className="text-sm font-medium text-slate-500 mb-8">Scan this QR code with Google Authenticator or Authy.</p>
        <div className="flex justify-center mb-6"><div className="p-4 bg-white border-2 border-slate-100 rounded-2xl shadow-sm inline-block"><img src={qrData.url} alt="QR" className="size-48" /></div></div>
        <div className="mb-8 text-left bg-slate-50 p-4 rounded-xl border border-slate-100">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Manual Entry Key</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-sm font-bold text-slate-700 break-all">{qrData.secret}</code>
            <Button variant="outline" size="icon" onClick={handleCopy} className="size-8 shrink-0 rounded-lg">{copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4 text-slate-400" />}</Button>
          </div>
        </div>
        <div className="space-y-4 text-left">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400">Verify Code</label>
          <Input type="text" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="000000" className="text-center tracking-[1em] font-mono font-bold text-xl h-14 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-blue-500" />
          <Button onClick={handleVerify} disabled={isLoading} className="w-full h-12 rounded-xl font-bold bg-slate-800 hover:bg-slate-900 text-white transition-all">{isLoading ? <Loader2 className="size-5 animate-spin" /> : "Verify & Enable"}</Button>
        </div>
      </div>
    </div>
  )
}
