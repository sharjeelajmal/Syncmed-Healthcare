"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { ShieldAlert, Loader2, Copy, Check, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { generateMfaSecretAction, verifyAndEnableMfaAction } from "@/app/actions/auth.actions"

export function MFASetupModal({ children }: { children?: React.ReactNode }) {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [isOpen, setIsOpen] = React.useState(false)
  const [otp, setOtp] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [isVerifying, setIsVerifying] = React.useState(false)
  const [qrData, setQrData] = React.useState<{ secret: string, url: string } | null>(null)
  const [copied, setCopied] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)
  const [isAlreadyEnabled, setIsAlreadyEnabled] = React.useState(false)

  const initMfa = async () => {
    if (!session?.user?.email) return
    
    // Check if already enabled
    if ((session?.user as any)?.mfaEnabled) {
      setIsAlreadyEnabled(true)
      return
    }

    setIsLoading(true)
    const res = await generateMfaSecretAction(session.user.email)
    setIsLoading(false)
    if (res.success && res.secret && res.qrCodeDataUrl) {
      setQrData({ secret: res.secret, url: res.qrCodeDataUrl })
    } else {
      toast.error("Failed to generate MFA setup")
    }
  }

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
    
    setIsVerifying(true)
    const res = await verifyAndEnableMfaAction(session.user.email, otp)
    setIsVerifying(false)
    
    if (res.success === true) {
      setIsSuccess(true)
      toast.success("MFA Enabled! Please log in again to sync security settings.")
      
      // CRITICAL FIX: Force user to login again so NextAuth fetches mfaEnabled: true from DB
      setTimeout(async () => {
        setIsOpen(false)
        await signOut({ callbackUrl: '/login' })
      }, 3000)
    } else {
      toast.error(res.error || "Invalid code")
      setOtp("") // Clear field on failure
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(val) => {
      setIsOpen(val)
      if (val && !qrData && !isAlreadyEnabled) initMfa()
    }}>
      <DialogTrigger asChild>
        {children || (
          <Button variant={(session?.user as any)?.mfaEnabled ? "outline" : "default"} className="gap-2">
            {(session?.user as any)?.mfaEnabled ? (
              <>
                <ShieldCheck className="size-4 text-emerald-500" />
                MFA Active
              </>
            ) : (
              "Set Up MFA"
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] w-[95vw] max-h-[90vh] overflow-y-auto rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 gap-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader className="text-center space-y-2">
          <div className="size-12 sm:size-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
            {(isSuccess || isAlreadyEnabled) ? <ShieldCheck className="size-6 sm:size-8 text-emerald-500" /> : <ShieldAlert className="size-6 sm:size-8 text-blue-500" />}
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight text-center">
            {isSuccess ? "MFA Enabled!" : isAlreadyEnabled ? "Security Active" : "Two-Factor Auth"}
          </DialogTitle>
          <DialogDescription className="text-[12px] sm:text-sm font-medium text-slate-500 text-center leading-relaxed">
            {isSuccess 
              ? "Your account is now secured with 2FA." 
              : isAlreadyEnabled 
              ? "MFA is currently protecting your account. You can reset it if you've lost your device." 
              : "Scan this QR code with Google Authenticator or Authy to secure your account."}
          </DialogDescription>
        </DialogHeader>

        {(session?.user as any)?.mfaEnabled ? (
          <div className="py-12 text-center space-y-6">
            <div className="size-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
              <ShieldCheck className="size-10 text-emerald-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-800">Security Active</h3>
              <p className="text-sm font-medium text-slate-500 max-w-[240px] mx-auto">
                Your account is already protected with Two-Factor Authentication.
              </p>
            </div>
            <Button 
              variant="outline" 
              className="rounded-xl border-slate-200 font-bold text-slate-600 w-full"
              onClick={() => {
                // Logic to reset if needed, but the prompt says 'Manage Security Settings'
                toast.info("Security Settings", { description: "Advanced settings coming soon." })
              }}
            >
              Manage Security Settings
            </Button>
          </div>
        ) : isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-4">
            <Loader2 className="size-10 animate-spin text-[#67BA2E]" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Generating Secure Key...</p>
          </div>
        ) : isSuccess ? (
          <div className="py-8 text-center">
             <div className="animate-bounce inline-block p-4 bg-emerald-50 rounded-full mb-4">
                <Check className="size-12 text-emerald-500" />
             </div>
             <p className="text-sm font-bold text-slate-600">Redirecting to login...</p>
          </div>
        ) : qrData ? (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="p-2 sm:p-4 bg-white border-2 border-slate-100 rounded-xl sm:rounded-2xl shadow-sm inline-block">
                <img src={qrData.url} alt="QR" className="size-32 sm:size-40" />
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Manual Entry Key</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-sm font-bold text-slate-700 break-all">{qrData.secret}</code>
                <Button variant="outline" size="icon" onClick={handleCopy} className="size-8 shrink-0 rounded-lg">
                  {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4 text-slate-400" />}
                </Button>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 block ml-1">Verify 6-Digit Code</label>
              <Input 
                type="text" 
                maxLength={6} 
                value={otp} 
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                placeholder="000000" 
                className="text-center tracking-[0.5em] sm:tracking-[1em] font-mono font-bold text-lg sm:text-xl h-12 sm:h-14 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-blue-500" 
              />
              <Button 
                onClick={handleVerify} 
                disabled={isVerifying} 
                className="w-full h-11 sm:h-12 rounded-xl font-black bg-slate-900 hover:bg-black text-white transition-all shadow-lg text-sm"
              >
                {isVerifying ? <Loader2 className="size-5 animate-spin" /> : "Complete Setup"}
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
