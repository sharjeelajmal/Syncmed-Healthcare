"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Shield, ArrowUpRight } from "lucide-react"

export function PWAInstallPrompt() {
  const [isVisible, setIsVisible] = React.useState(false)
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null)
  const [isIOS, setIsIOS] = React.useState(false)

  React.useEffect(() => {
    // 1. Standalone / Already Installed Check
    const isStandalone = 
      window.matchMedia("(display-mode: standalone)").matches || 
      (navigator as any).standalone === true

    if (isStandalone) {
      return
    }

    // 2. Dismissal Lock Check
    const isDismissed = localStorage.getItem("syncmed-pwa-dismissed") === "true"
    if (isDismissed) {
      return
    }

    // 3. iOS Detection
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
    const ios = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream
    setIsIOS(ios)

    if (ios) {
      // Intentional delay for premium iOS install workflow feel
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 2000)
      return () => clearTimeout(timer)
    }

    // 4. Android/Chrome Event Listener
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsVisible(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    
    // Trigger default PWA install trigger
    deferredPrompt.prompt()
    
    // Stash choice outcome
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") {
      localStorage.setItem("syncmed-pwa-dismissed", "true")
      setIsVisible(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    localStorage.setItem("syncmed-pwa-dismissed", "true")
    setIsVisible(false)
  }

  if (!isVisible) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[100] bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/20 p-6 overflow-hidden"
      >
        {/* Header telemetry decoration */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-[#67BA2E]/5 rounded-full blur-xl pointer-events-none" />

        {/* Dismiss trigger */}
        <button 
          onClick={handleDismiss} 
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-all active:scale-95"
        >
          <X size={15} />
        </button>

        <div className="space-y-4">
          {/* Logo Header */}
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-[#67BA2E]/10 flex items-center justify-center text-[#67BA2E] shadow-sm">
              <Shield size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none mb-1">
                {isIOS ? "Install SyncMed Native iOS App" : "Install SyncMed Healthcare App"}
              </h4>
              <p className="text-[9px] font-black uppercase text-[#67BA2E] tracking-[0.2em] leading-none">
                HIPAA Certified Environment
              </p>
            </div>
          </div>

          {/* Core Body Wording */}
          <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
            {isIOS ? (
              <span>
                For maximum HIPAA compliance, Apple requires a secure private installation. Tap the Share icon 
                <span className="inline-flex items-center mx-1 bg-slate-50 p-1 rounded-md border border-slate-100">
                  <svg className="size-3 text-[#67BA2E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="11" width="14" height="10" rx="2" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                    <polyline points="9 6 12 3 15 6" />
                  </svg>
                </span>
                at the bottom of your screen and select <strong>Add to Home Screen</strong> to install the app securely.
              </span>
            ) : (
              "Install the official SyncMed app on your device for secure, instant access to your clinical dashboard."
            )}
          </p>

          {/* Secure Interactive Controls */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={handleDismiss}
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors h-11 px-4"
            >
              Not Now
            </button>

            {!isIOS ? (
              <button
                onClick={handleInstallClick}
                className="bg-[#67BA2E] hover:bg-[#5aa329] text-white font-black rounded-xl px-5 h-11 text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-md shadow-emerald-500/10 flex items-center gap-2"
              >
                Secure Install
                <ArrowUpRight size={12} className="stroke-[3]" />
              </button>
            ) : (
              <button
                onClick={handleDismiss}
                className="bg-[#67BA2E] hover:bg-[#5aa329] text-white font-black rounded-xl px-5 h-11 text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-md shadow-emerald-500/10"
              >
                Got It
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
