"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, Lock, ArrowRight, Loader2, Sparkles, HelpCircle, HeartPulse, ChevronDown, Download, FileText } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { submitLeadAction } from "@/app/actions/lead.actions"

export default function RequestConsultationPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [inquiryType, setInquiryType] = useState("general")
  const [isOpen, setIsOpen] = useState(false)

  const options = [
    {
      id: "general",
      label: "General Question",
      desc: "Inquiries about our private practice, locations, or clinical model."
    },
    {
      id: "patient_registration",
      label: "New Patient Registration",
      desc: "Request secure clinical onboarding and dashboard configuration."
    }
  ]
  const selectedOption = options.find(opt => opt.id === inquiryType) || options[0]

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const message = formData.get("message") as string

    const result = await submitLeadAction({
      name,
      email,
      phone: phone || null,
      type: inquiryType,
      message,
    })

    if (result.success) {
      toast.success("Request Securely Submitted", {
        description: result.message || "A coordinator will follow up on a secure line within 24 hours.",
      })
      ;(e.target as HTMLFormElement).reset()
      setInquiryType("general")
    } else {
      toast.error("Submission Failed", {
        description: result.error || "Failed to send request. Please try again.",
      })
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen selection:bg-[#67BA2E]/20 font-sans flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto w-full">
          {/* Header section */}
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs text-[#67BA2E] text-[10px] font-black uppercase tracking-wider">
              <Shield size={12} />
              HIPAA Compliant Communication
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight leading-none">
              Request <span className="text-[#67BA2E]">Clinical Consultation</span>
            </h1>
            <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto">
              Connect with our clinical intake team. Please provide your confidential details below.
            </p>
          </div>

          {/* Grid Layout: Form on Left, Support Info on Right — equal height columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {/* Form Column */}
            <div className="lg:col-span-2 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-100/60 p-6 md:p-10">
              <form onSubmit={handleSubmit} className="flex flex-col flex-1 gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                  {/* Name */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-widest block">
                      Full Name
                    </label>
                    <input
                      required
                      name="name"
                      type="text"
                      maxLength={50}
                      placeholder="Alexander Sterling"
                      className="w-full bg-slate-50/50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#67BA2E]/20 focus:border-[#67BA2E] rounded-xl h-12 px-4 transition-all text-sm md:text-base font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-widest block">
                      Email Address
                    </label>
                    <input
                      required
                      name="email"
                      type="email"
                      placeholder="private@sterling.com"
                      className="w-full bg-slate-50/50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#67BA2E]/20 focus:border-[#67BA2E] rounded-xl h-12 px-4 transition-all text-sm md:text-base font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-widest block">
                      Phone Number <span className="text-[10px] text-slate-400 lowercase italic">(optional)</span>
                    </label>
                    <input
                      name="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-slate-50/50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#67BA2E]/20 focus:border-[#67BA2E] rounded-xl h-12 px-4 transition-all text-sm md:text-base font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>

                  {/* Dropdown Type */}
                  <div className="space-y-2 md:col-span-2 relative">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-widest block">
                      Inquiry Type
                    </label>
                    
                    {/* Trigger Button */}
                    <button
                      type="button"
                      onClick={() => setIsOpen(!isOpen)}
                      className="w-full bg-slate-50/50 border border-slate-200 hover:bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#67BA2E]/20 focus:border-[#67BA2E] rounded-xl h-14 px-4 transition-all flex items-center justify-between text-left cursor-pointer focus:outline-none"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`size-2.5 rounded-full ${inquiryType === 'general' ? 'bg-blue-500' : 'bg-[#67BA2E]'}`} />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800 leading-tight">
                            {selectedOption.label}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
                            {selectedOption.desc}
                          </span>
                        </div>
                      </div>
                      <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {isOpen && (
                        <>
                          {/* Click outside overlay */}
                          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                          
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 space-y-1"
                          >
                            {options.map((option) => {
                              const isSelected = option.id === inquiryType
                              return (
                                <button
                                  key={option.id}
                                  type="button"
                                  onClick={() => {
                                    setInquiryType(option.id)
                                    setIsOpen(false)
                                  }}
                                  className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                                    isSelected 
                                      ? "bg-slate-50 text-slate-800" 
                                      : "hover:bg-slate-50/60 text-slate-600 hover:text-slate-800"
                                  }`}
                                >
                                  <div className={`size-4 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                                    isSelected ? 'border-[#67BA2E] bg-white' : 'border-slate-300'
                                  }`}>
                                    {isSelected && <div className="size-2 rounded-full bg-[#67BA2E]" />}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className={`text-sm font-bold block ${isSelected ? 'text-[#67BA2E]' : 'text-slate-700'}`}>
                                      {option.label}
                                    </span>
                                    <span className="text-[11px] text-slate-400 font-medium leading-normal mt-0.5">
                                      {option.desc}
                                    </span>
                                  </div>
                                </button>
                              )
                            })}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Message */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-widest block">
                      Message
                    </label>
                    <textarea
                      required
                      name="message"
                      rows={5}
                      placeholder="Please share details regarding your inquiry..."
                      className="w-full bg-slate-50/50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#67BA2E]/20 focus:border-[#67BA2E] rounded-xl p-4 transition-all text-sm md:text-base font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="mt-auto pt-2 border-t border-slate-100">
                  <Button
                    disabled={isLoading}
                    type="submit"
                    className="w-full h-12 bg-[#67BA2E] hover:bg-[#5aa827] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#67BA2E]/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2 border-0"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Securing Transmission...
                      </>
                    ) : (
                      <>
                        Submit Consultation Request
                        <ArrowRight size={16} />
                      </>
                    )}
                  </Button>

                  <div className="mt-6 flex items-center justify-center gap-2 opacity-50">
                    <Lock size={12} className="text-[#67BA2E]" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      Encrypted Clinical Pipeline Active
                    </span>
                  </div>
                </div>
              </form>
            </div>

            {/* Info Side Column — unified panel, stretches to match form height */}
            <aside className="flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-100/60 overflow-hidden">
              {/* Intake Form Download */}
              <div className="p-6 space-y-4 relative overflow-hidden border-b border-slate-100">
                <div className="absolute -top-8 -right-8 size-28 rounded-full bg-[#67BA2E]/5 blur-2xl pointer-events-none" />
                <div className="size-10 rounded-xl bg-[#67BA2E]/10 border border-[#67BA2E]/20 flex items-center justify-center text-[#67BA2E]">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Patient Intake Form</h3>
                  <p className="text-slate-500 text-xs leading-relaxed mt-1.5">
                    Save time at your first visit — download and complete our home health intake form in advance.
                  </p>
                </div>
                <a
                  href="/pdfs/SyncMed_Home_Health_Intake_Form.pdf"
                  download
                  className="w-full h-11 bg-[#67BA2E] hover:bg-[#5aa827] text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-[#67BA2E]/10 transition-all active:scale-[0.98] hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <Download size={15} />
                  Download Intake Form
                </a>
              </div>

              {/* Info sections — flex-1 distributes remaining space evenly */}
              <div className="flex flex-1 flex-col divide-y divide-slate-100">
                <div className="flex flex-1 flex-col justify-center p-6 space-y-3">
                  <div className="size-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#67BA2E]">
                    <Sparkles size={20} />
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">Elite Clinical Care</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Our private medical clinic prioritizes absolute confidentiality, secure health records, and direct physician access.
                  </p>
                </div>

                <div className="flex flex-1 flex-col justify-center p-6 space-y-3">
                  <div className="size-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                    <HelpCircle size={20} />
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">Clinical Timelines</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Inquiries are reviewed by clinical intake staff. Approved registrations receive dashboard setup links within 24 hours.
                  </p>
                </div>

                <div className="flex flex-1 flex-col justify-center p-6 space-y-3">
                  <div className="size-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                    <HeartPulse size={20} />
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">Patient Sovereignty</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Every interaction is fully protected under global digital privacy standards.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}