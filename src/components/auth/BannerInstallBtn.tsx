"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { Download, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

// THE FIX: Catch the event globally before Next.js even hydrates the DOM
let globalDeferredPrompt: any = null;
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    globalDeferredPrompt = e;
  });
}

export function BannerInstallBtn() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null)
  const [isInstalled, setIsInstalled] = React.useState(false)
  const [showModal, setShowModal] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const [deviceType, setDeviceType] = React.useState<'ios' | 'android' | 'desktop'>('desktop')

  React.useEffect(() => {
    setMounted(true)
    
    // Check if the prompt was already captured in the HTML head
    if (typeof window !== "undefined" && (window as any).deferredPrompt) {
      setDeferredPrompt((window as any).deferredPrompt)
    } else if (globalDeferredPrompt) {
      setDeferredPrompt(globalDeferredPrompt)
    }
    
    // Listen for the custom head script event
    const handlePromptAvailable = (e: any) => {
      setDeferredPrompt(e.detail)
    }
    window.addEventListener("pwa-prompt-available", handlePromptAvailable as EventListener)
    
    // Detect Device Type
    const ua = navigator.userAgent.toLowerCase()
    if (/iphone|ipad|ipod/.test(ua)) {
      setDeviceType('ios')
    } else if (/android/.test(ua)) {
      setDeviceType('android')
    } else {
      setDeviceType('desktop')
    }

    // Check if already installed
    if (
      typeof window !== "undefined" && 
      (window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone)
    ) {
      setIsInstalled(true)
    }

    const handler = (e: Event) => {
      e.preventDefault()
      globalDeferredPrompt = e
      setDeferredPrompt(e)
    }
    
    window.addEventListener("beforeinstallprompt", handler)
    return () => {
      window.removeEventListener("pwa-prompt-available", handlePromptAvailable as EventListener)
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const handleInstall = async () => {
    const promptToUse = deferredPrompt || (typeof window !== "undefined" ? (window as any).deferredPrompt : null)
    try {
      // 1. Agar native prompt majood hai, toh isay fire karo
      if (promptToUse) {
        await promptToUse.prompt()
        const { outcome } = await promptToUse.userChoice
        if (outcome === "accepted") {
          setDeferredPrompt(null)
          globalDeferredPrompt = null
          if (typeof window !== "undefined") {
            (window as any).deferredPrompt = null
          }
        }
        return
      }
    } catch (error) {
      console.warn("Browser blocked native prompt:", error)
      // Silent error catch kar liya
    }
    
    // 2. Agar already installed ya prompt unavailable hai:
    if (isInstalled) {
      toast.success("SyncMed App is already installed", {
        description: "Open the application directly from your device's home screen."
      })
      return
    }

    // Desktop/Browser users ko annoying manual modal ke bajaye clean, non-intrusive toast show karein!
    if (deviceType === 'desktop') {
      toast.info("Install SyncMed Healthcare App", {
        description: "Please click the install icon on the right side of your browser's address bar to install."
      })
      return
    }

    // 3. For iOS/Mobile (where manual addition is required), show the manual instructions modal
    setShowModal(true)
  }

  if (isInstalled) return null

  return (
    <>
      <button
        onClick={handleInstall}
        className="flex-1 md:flex-initial w-1/2 md:w-auto flex items-center gap-2 md:gap-3 px-3 md:px-6 py-2 md:py-3.5 bg-blue-50 border border-blue-100 rounded-xl md:rounded-2xl hover:bg-blue-100 transition-all cursor-pointer group/badge text-left shrink-0 animate-in fade-in duration-500"
      >
        <div className="p-1.5 md:p-2 bg-white rounded-lg shadow-sm group-hover/badge:scale-110 transition-transform">
          <Download className="size-3.5 md:size-4 text-blue-600 stroke-[3]" />
        </div>
        <div className="text-left">
          <p className="text-[8px] md:text-[10px] font-black text-blue-600 uppercase tracking-wider leading-none mb-0.5">App Access</p>
          <p className="text-[10px] md:text-xs font-bold text-slate-700">Install App</p>
        </div>
      </button>

      {/* FIXED PORTAL & ANIMATE PRESENCE LOGIC */}
      {mounted && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowModal(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />

              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className="bg-white rounded-[2rem] p-6 max-w-sm w-full shadow-2xl relative border border-slate-100 z-10 flex flex-col items-center text-center space-y-5"
              >
                <button 
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all active:scale-95"
                >
                  <X size={16} />
                </button>

                <div className="size-16 rounded-[1.5rem] bg-[#67BA2E]/10 flex items-center justify-center text-[#67BA2E] shadow-inner mb-1">
                  <Download size={28} className="stroke-[2.5]" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none">
                    Install SyncMed App
                  </h3>
                </div>

                <p className="text-xs font-medium text-slate-500 max-w-[280px]">
                  Your browser requires a manual step to securely install this application.
                </p>

                <div className="w-full space-y-3">
                  {deviceType === 'ios' && (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-left space-y-1">
                      <p className="text-[10px] font-black text-[#67BA2E] uppercase tracking-wider">📱 iPhone / iPad</p>
                      <p className="text-[10px] font-medium text-slate-600 leading-relaxed">
                        Tap the Share icon in your browser menu and select <strong className="text-slate-800">Add to Home Screen</strong>.
                      </p>
                    </div>
                  )}

                  {deviceType !== 'ios' && (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-left space-y-1">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider">💻 Desktop / Browser</p>
                      <p className="text-[10px] font-medium text-slate-600 leading-relaxed">
                        Click the <strong className="text-slate-800">Install icon</strong> located on the right side of your browser's address bar.
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95 mt-2"
                >
                  Got It
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}