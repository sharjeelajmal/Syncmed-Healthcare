"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Shield, 
  Lock, 
  ArrowRight, 
  ChevronLeft,
  Loader2,
  Activity,
  Award,
  Quote,
  Star
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { submitInquiryAction } from "@/app/actions/inquiry.actions";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.2 },
  transition: { duration: 0.6, ease: "easeOut" as const }
};

const staggerContainer = {
  initial: {},
  whileInView: {
    transition: { staggerChildren: 0.1 }
  },
  viewport: { once: false, amount: 0.2 }
};

export default function RequestConsultationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await submitInquiryAction(formData);

    if (result.success) {
      toast.success("Request Securely Transmitted", {
        description: "A clinical concierge will contact you on a secure line within 24 hours.",
      });
      (e.target as HTMLFormElement).reset();
      setTimeout(() => router.push("/"), 3000);
    } else {
      toast.error("Transmission Failed", {
        description: result.error || "Failed to transmit request. Please try again.",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-white selection:bg-[#67BA2E]/20 font-sans flex flex-col">
      <Navbar />

      {/* Main content wrapper with flex-grow to push footer down naturally */}
      <main className="flex-grow pt-[80px]"> {/* Fixed pt matching typical navbar heights based on existing classes */}
        {/* Removed fixed heights. Flex handles equal column stretching naturally */}
        <div className="flex flex-col lg:flex-row w-full max-w-[1600px] mx-auto">
          
          {/* Left Column: The Pitch & Trust */}
          {/* FIX: Removed sticky, overflow-y-auto, and justify-center. Added justify-start for natural document flow. */}
          <div className="w-full lg:w-1/2 bg-slate-50 flex flex-col justify-start p-8 md:p-16 lg:p-20 xl:p-24 border-r border-slate-100">
            
            <motion.div
              {...fadeUp}
              className="max-w-xl mx-auto w-full"
            >
              {/* Back Button */}
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-400 hover:text-[#67BA2E] transition-all mb-10 md:mb-14 group w-fit"
              >
                <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Return</span>
              </button>

              <div className="space-y-10 md:space-y-14">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-[#67BA2E] text-[10px] font-black uppercase tracking-[0.15em]">
                    <Shield size={12} />
                    Secured Clinical Access
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                    The Science of <br />
                    <span className="text-[#67BA2E]">Private Care.</span>
                  </h1>
                  <p className="text-slate-500 text-base md:text-lg leading-relaxed">
                    An exclusive clinical sanctuary where bespoke medicine meets absolute personalized attention.
                  </p>
                </div>

                {/* Timeline / Steps */}
                <motion.div 
                  variants={staggerContainer}
                  initial="initial"
                  whileInView="whileInView"
                  viewport={{ once: false, amount: 0.2 }}
                  className="space-y-8"
                >
                  {[
                    { icon: Shield, title: "Requirement Analysis", desc: "Confidential clinical intake via our encrypted portal." },
                    { icon: Activity, title: "Concierge Discovery", desc: "Bespoke consultation with our lead physician team." },
                    { icon: Award, title: "Clinical Activation", desc: "Immediate access to world-class medical diagnostics." }
                  ].map((step, i) => (
                    <motion.div key={i} variants={fadeUp} className="flex gap-5 items-start">
                      <div className="size-12 rounded-xl bg-white shadow-sm border border-slate-100 flex-shrink-0 flex items-center justify-center text-[#67BA2E]">
                        <step.icon size={20} />
                      </div>
                      <div className="pt-1">
                        <h3 className="font-bold text-slate-900 text-sm md:text-base mb-1">{step.title}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Testimonial */}
                <div className="pt-8 border-t border-slate-200">
                   <div className="relative pl-6 border-l-2 border-[#67BA2E]">
                      <Quote className="absolute -left-3 -top-3 size-6 text-white fill-slate-100" />
                      <p className="text-base text-slate-600 leading-relaxed font-medium relative z-10">
                        "SyncMed restores the sanctity of medicine. Absolute discretion and unmatched clinical precision."
                      </p>
                      <div className="flex items-center gap-2 mt-4">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => <Star key={i} size={12} className="fill-[#67BA2E] text-[#67BA2E]" />)}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">— Verified Private Member</span>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: The Form */}
          {/* FIX: Removed min-h-[calc(100vh-80px)] to allow it to match the left column's natural height seamlessly. */}
          <div className="w-full lg:w-1/2 flex flex-col justify-start p-8 md:p-16 lg:p-20 xl:p-24 bg-white">
            <motion.div
              {...fadeUp}
              className="max-w-xl mx-auto w-full"
            >
              <div className="mb-12 md:mb-16">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Secure Request</h2>
                <p className="text-slate-500 text-base">Please provide your confidential details for clinical assessment.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                  {/* First Name */}
                  <div className="relative group">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 transition-colors group-focus-within:text-[#67BA2E]">
                      First Name
                    </label>
                    <input
                      required
                      name="firstName"
                      type="text"
                      maxLength={20}
                      onInput={(e) => {
                        e.currentTarget.value = e.currentTarget.value.replace(/[^a-zA-Z\s]/g, "");
                      }}
                      placeholder="Alexander"
                      className="w-full bg-transparent border-b-2 border-slate-100 py-3 text-slate-900 placeholder:text-slate-200 focus:outline-none focus:border-[#67BA2E] transition-all text-sm md:text-base font-bold"
                    />
                  </div>

                  {/* Last Name */}
                  <div className="relative group">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 transition-colors group-focus-within:text-[#67BA2E]">
                      Last Name
                    </label>
                    <input
                      required
                      name="lastName"
                      type="text"
                      maxLength={20}
                      onInput={(e) => {
                        e.currentTarget.value = e.currentTarget.value.replace(/[^a-zA-Z\s]/g, "");
                      }}
                      placeholder="Sterling"
                      className="w-full bg-transparent border-b-2 border-slate-100 py-3 text-slate-900 placeholder:text-slate-200 focus:outline-none focus:border-[#67BA2E] transition-all text-sm md:text-base font-bold"
                    />
                  </div>

                  {/* Email */}
                  <div className="relative group">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 transition-colors group-focus-within:text-[#67BA2E]">
                      Secure Email
                    </label>
                    <input
                      required
                      name="email"
                      type="email"
                      placeholder="private@syncmed.com"
                      className="w-full bg-transparent border-b-2 border-slate-100 py-3 text-slate-900 placeholder:text-slate-200 focus:outline-none focus:border-[#67BA2E] transition-all text-sm md:text-base font-bold"
                    />
                  </div>

                  {/* Phone */}
                  <div className="relative group">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 transition-colors group-focus-within:text-[#67BA2E]">
                      Encrypted Line
                    </label>
                    <input
                      required
                      name="phone"
                      type="tel"
                      onInput={(e) => {
                        e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, "");
                      }}
                      placeholder="000 000 0000"
                      className="w-full bg-transparent border-b-2 border-slate-100 py-3 text-slate-900 placeholder:text-slate-200 focus:outline-none focus:border-[#67BA2E] transition-all text-sm md:text-base font-bold"
                    />
                  </div>

                  {/* Referral Source */}
                  <div className="relative group md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 transition-colors group-focus-within:text-[#67BA2E]">
                      Referral Source
                    </label>
                    <input
                      name="referralSource"
                      type="text"
                      placeholder="How did you hear about our private practice?"
                      className="w-full bg-transparent border-b-2 border-slate-100 py-3 text-slate-900 placeholder:text-slate-200 focus:outline-none focus:border-[#67BA2E] transition-all text-sm md:text-base font-bold"
                    />
                  </div>

                  {/* Inquiry Details */}
                  <div className="relative group md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 transition-colors group-focus-within:text-[#67BA2E]">
                      Clinical Inquiry
                    </label>
                    <textarea
                      name="inquiryDetails"
                      rows={2}
                      placeholder="Briefly outline your clinical requirements..."
                      className="w-full bg-transparent border-b-2 border-slate-100 py-3 text-slate-900 placeholder:text-slate-200 focus:outline-none focus:border-[#67BA2E] transition-all text-sm md:text-base font-bold resize-none"
                    />
                  </div>
                </div>

                <div>
                  <Button
                    disabled={isLoading}
                    type="submit"
                    className="w-full h-12 md:h-14 bg-[#67BA2E] hover:bg-[#5aa329] text-white rounded-full font-black uppercase tracking-[0.1em] text-[10px] md:text-sm shadow-xl shadow-[#67BA2E]/20 transition-all active:scale-[0.98] disabled:opacity-70 group btn-liquid px-4 overflow-hidden"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2 relative z-10 whitespace-nowrap">
                        <Loader2 className="animate-spin" size={16} />
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2 relative z-10 whitespace-nowrap">
                        Submit Custom Request
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform shrink-0" />
                      </span>
                    )}
                  </Button>

                  <div className="mt-8 md:mt-12 flex items-center justify-center gap-3 opacity-40">
                    <Lock size={14} className="text-[#67BA2E]" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
                      Clinical-Grade Encryption Active
                    </span>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}