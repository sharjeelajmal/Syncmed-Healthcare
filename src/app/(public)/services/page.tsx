"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Shield, 
  Activity, 
  Clock, 
  Briefcase,
  Users,
  Globe,
  Lock,
  Zap,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// --- Animation Variants ---
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

const ServiceCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <motion.div 
    variants={fadeUp}
    className="bg-white border border-slate-100 rounded-[2rem] p-5 md:p-8 hover:shadow-xl hover:shadow-[#67BA2E]/5 transition-all duration-300 group flex flex-col items-center md:items-start text-center md:text-left"
  >
    <div className="bg-[#67BA2E]/10 w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#67BA2E] transition-colors duration-300">
      <Icon className="h-5 w-5 md:h-7 md:w-7 text-[#67BA2E] group-hover:text-white transition-colors duration-300" />
    </div>
    <h3 className="text-[10px] md:text-xl font-black text-slate-900 mb-2 md:mb-3 tracking-tight leading-tight uppercase md:normal-case">{title}</h3>
    <p className="text-[10px] md:text-sm text-slate-600 leading-relaxed tracking-[0.015em] line-clamp-2 md:line-clamp-none">{description}</p>
  </motion.div>
);

export default function ServicesPage() {
  const services = [
    { icon: Users, title: "Physician-Led Case Management", description: "Direct oversight of your entire clinical journey by a dedicated personal physician." },
    { icon: Activity, title: "In-Home Diagnostics", description: "Advanced clinical testing and monitoring delivered in the absolute privacy of your residence." },
    { icon: Clock, title: "Priority Specialist Access", description: "Bypassing waitlists to secure immediate consultations with top-tier global specialists." },
    { icon: Zap, title: "24/7 Clinical Support", description: "A secure-line directly to your care team, providing instant medical guidance anytime." },
    { icon: Globe, title: "International Care Coordination", description: "Seamless medical management across borders, including medical records and specialist liaisons." },
    { icon: Lock, title: "Absolute Confidentiality", description: "Military-grade encryption and private cloud infrastructure for your most sensitive data." }
  ];

  return (
    <div className="min-h-screen font-sans selection:bg-[#67BA2E]/20 selection:text-slate-900 overflow-x-hidden scroll-smooth pt-14 md:pt-0 pb-20 md:pb-0">
      <Navbar />

      <main>
        {/* Hero Banner Section (100% Admin Style) */}
        <section className="relative bg-slate-50/50 pt-6 md:pt-24 pb-6 md:pb-10 overflow-hidden">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
            <div className="relative overflow-hidden bg-white border border-slate-200 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-2xl shadow-slate-100 group animate-in fade-in duration-1000">
              {/* Background Image Layer - App Style */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                {/* Desktop: Right-aligned with radial mask | Mobile: Full-cover watermark */}
                <div 
                  className="absolute inset-0 md:left-1/3 lg:left-1/2 opacity-[0.08] md:opacity-100 transition-all duration-1000 group-hover:scale-105 select-none"
                  style={{
                    WebkitMaskImage: 'radial-gradient(circle at right, black 30%, transparent 80%)',
                    maskImage: 'radial-gradient(circle at right, black 30%, transparent 80%)'
                  }}
                >
                  <img 
                    src="/services.png" 
                    alt="Background" 
                    className="w-full h-full object-cover md:object-contain object-right md:object-right"
                  />
                </div>
                {/* Decorative Blur Orbs */}
                <div className="absolute top-10 right-10 w-64 h-64 bg-[#67BA2E]/5 rounded-full blur-3xl" />
              </div>

              {/* Content Layer */}
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 md:gap-12">
                <div className="max-w-2xl space-y-6 md:space-y-8 text-center lg:text-left items-center lg:items-start flex flex-col">
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-center gap-2 text-[#67BA2E] font-black text-[9px] md:text-[11px] uppercase tracking-[0.25em] animate-in fade-in slide-in-from-left-4 duration-700">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#67BA2E] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#67BA2E]"></span>
                      </span>
                      SyncMed Elite Services
                    </div>
                    
                    <div className="space-y-1">
                      <h1 className="text-3xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-tight animate-in fade-in slide-in-from-left-6 duration-1000">
                        The Science of
                        <span className="block text-[#67BA2E] filter drop-shadow-sm">
                          Private Care.
                        </span>
                      </h1>
                      <div className="h-1 w-16 bg-[#67BA2E] rounded-full mt-4 mx-auto lg:ml-0 animate-in zoom-in duration-1000 delay-300" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 md:p-5 bg-slate-50/80 backdrop-blur-md rounded-[1.2rem] md:rounded-[1.5rem] border border-slate-100 shadow-sm w-fit animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
                    <div className="size-8 md:size-10 rounded-lg md:rounded-xl bg-white flex items-center justify-center shadow-sm">
                      <Briefcase className="size-4 md:size-5 text-[#67BA2E]" />
                    </div>
                    <p className="text-xs md:text-base font-bold text-slate-600 tracking-tight text-left">
                      A bespoke clinical ecosystem designed for those who require absolute precision and uncompromised privacy.
                    </p>
                  </div>
                </div>

                {/* Identity Floating Card (Desktop) */}
                <div className="hidden lg:flex flex-col gap-6 p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 w-72 animate-in fade-in slide-in-from-right-8 duration-1000 relative">
                  <div className="absolute -top-4 -right-4 size-12 bg-[#67BA2E] rounded-2xl flex items-center justify-center text-white shadow-xl rotate-12 group-hover:rotate-0 transition-transform duration-500">
                    <Shield className="size-6" />
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="size-14 rounded-2xl bg-slate-50 flex items-center justify-center text-[#67BA2E] shadow-inner overflow-hidden">
                        <Activity className="size-8" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Standard</p>
                        <p className="text-sm font-black text-slate-800 leading-tight uppercase">Bespoke Care</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-50">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-green-50 text-[#67BA2E] rounded-full border border-green-100">
                        <CheckCircle2 size={12} className="fill-[#67BA2E] text-white" />
                        <span className="text-[10px] font-black uppercase tracking-[0.1em]">Verified Session</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-6 md:py-10">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: false, amount: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-8"
            >
              {services.map((service, idx) => (
                <ServiceCard key={idx} {...service} />
              ))}
            </motion.div>
          </div>
        </section>

        {/* Pricing & Investment Section */}
        <section className="py-6 md:py-10 relative overflow-hidden">
           {/* Decorative elements */}
           <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
           
          <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
            <motion.div 
              {...fadeUp}
              className="bg-white/40 backdrop-blur-md border border-slate-100 rounded-[2.5rem] p-8 md:p-16 shadow-2xl shadow-slate-200/50 text-center"
            >
              <Briefcase className="h-10 w-10 md:h-14 md:w-14 text-[#67BA2E] mx-auto mb-6 opacity-80" />
              <h2 className="text-2xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">Membership Tier Overview</h2>
              <p className="text-[10px] md:text-xl text-slate-600 leading-relaxed tracking-[0.015em] mb-10 max-w-3xl mx-auto">
                Membership investment is tailored based on physician access, scope of services, and care intensity. We maintain an exclusive clinical ratio to ensure the absolute standard of medicine.
              </p>
              
              <div className="flex flex-col items-center gap-6">
                <Button 
                  size="lg"
                  asChild
                  className="bg-[#67BA2E] hover:bg-[#5aa329] text-white rounded-full px-8 md:px-12 h-12 md:h-16 text-xs md:text-lg font-bold shadow-lg shadow-[#67BA2E]/25 transition-all duration-300 hover:-translate-y-1 active:scale-95 w-fit"
                >
                  <Link href="/request-consultation">
                    Request Pricing Consultation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                
                <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Strict Confidentiality Guaranteed
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
