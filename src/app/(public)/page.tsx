"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  Activity, 
  Globe, 
  Clock, 
  ChevronDown, 
  ArrowRight,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Heart,
  Award,
  Zap,
  Home,
  Info,
  Crown,
  HelpCircle,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// --- Helpers ---
const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

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

const cardHover = {
  whileHover: { y: -5, transition: { duration: 0.2 } }
};

// --- Components ---



const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <motion.div 
    variants={fadeUp}
    {...cardHover}
    className="bg-white border border-slate-100 shadow-sm rounded-2xl md:rounded-3xl p-4 md:p-8 hover:shadow-xl hover:shadow-[#67BA2E]/5 transition-all duration-300 group h-full flex flex-col items-center md:items-start text-center md:text-left"
  >
    <div className="bg-[#67BA2E]/10 w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-8 group-hover:bg-[#67BA2E] transition-colors duration-300">
      <Icon className="h-6 w-6 md:h-8 md:w-8 text-[#67BA2E] group-hover:text-white transition-colors duration-300" />
    </div>
    <h3 className="text-sm md:text-2xl font-black text-slate-900 mb-2 md:mb-4 tracking-tight leading-tight">{title}</h3>
    <p className="text-xs md:text-base text-slate-600 leading-relaxed tracking-[0.015em]">{description}</p>
  </motion.div>
);

const AccordionItem = ({ question, answer, isOpen, onClick }: { question: string, answer: string, isOpen: boolean, onClick: () => void }) => (
  <motion.div 
    variants={fadeUp}
    className="bg-white border border-slate-100 rounded-xl md:rounded-2xl mb-3 overflow-hidden shadow-sm"
  >
    <button 
      onClick={onClick}
      className="w-full px-5 md:px-8 py-5 flex items-center justify-between text-left group"
    >
      <span className={cn("text-sm md:text-lg font-bold transition-colors", isOpen ? "text-[#67BA2E]" : "text-slate-900 group-hover:text-[#67BA2E]")}>
        {question}
      </span>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <ChevronDown className={cn("h-5 w-5 text-slate-400 group-hover:text-[#67BA2E]", isOpen && "text-[#67BA2E]")} />
      </motion.div>
    </button>
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="px-5 md:px-8 pb-5 pt-1">
            <p className="text-xs md:text-base text-slate-600 leading-relaxed tracking-[0.015em]">
              {answer}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

export default function LandingPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      question: "What defines the SyncMed experience?",
      answer: "SyncMed is a boutique healthcare model built on deep clinical relationships. We offer unlimited direct access to your physician, zero wait times, and a diagnostic precision that is only possible through highly personalized care."
    },
    {
      question: "How does VIP Membership work?",
      answer: "Membership is exclusive and limited. Members pay an annual fee that covers all primary care interactions, direct physician messaging, and priority scheduling with elite specialists worldwide."
    },
    {
      question: "Is my medical data secure?",
      answer: "We utilize advanced end-to-end encryption and private cloud infrastructure to ensure that your medical history remains accessible only to you and your authorized clinical team."
    }
  ];

  return (
    <div className="min-h-screen font-sans selection:bg-[#67BA2E]/20 selection:text-slate-900 overflow-x-hidden scroll-smooth pt-14 md:pt-0 pb-20 md:pb-0">


      <Navbar />

      <main>
        {/* Hero Banner Section (100% Admin Style) */}
        <section id="experience" className="relative bg-slate-50/50 pt-6 md:pt-24 pb-6 md:pb-10 overflow-hidden">
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
                    src="/3d-stethoscope.png" 
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
                      Elite Private Healthcare
                    </div>
                    
                    <div className="space-y-1">
                      <h1 className="text-3xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-tight animate-in fade-in slide-in-from-left-6 duration-1000">
                        Healthcare
                        <span className="block text-[#67BA2E] filter drop-shadow-sm">
                          Without Limits.
                        </span>
                      </h1>
                      <div className="h-1 w-16 bg-[#67BA2E] rounded-full mt-4 mx-auto lg:ml-0 animate-in zoom-in duration-1000 delay-300" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 md:p-5 bg-slate-50/80 backdrop-blur-md rounded-[1.2rem] md:rounded-[1.5rem] border border-slate-100 shadow-sm w-fit animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
                    <div className="size-8 md:size-10 rounded-lg md:rounded-xl bg-white flex items-center justify-center shadow-sm">
                      <Activity className="size-4 md:size-5 text-[#67BA2E]" />
                    </div>
                    <p className="text-xs md:text-base font-bold text-slate-600 tracking-tight text-left">
                      A private clinical sanctuary where world-class medicine meets absolute personalized attention.
                    </p>
                  </div>

                  {/* Buttons side-by-side on all devices */}
                  <div className="flex flex-row items-center justify-center lg:justify-start gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-700">
                    <Button 
                      asChild
                      className="h-11 md:h-14 bg-[#67BA2E] hover:bg-[#5aa329] text-white rounded-full px-6 md:px-10 text-[10px] md:text-base font-bold shadow-lg shadow-[#67BA2E]/20 transition-all hover:-translate-y-1 active:scale-95"
                    >
                      <Link href="/request-consultation">Request Invite</Link>
                    </Button>
                    <Button 
                      variant="default"
                      onClick={() => router.push("/login")}
                      className="flex items-center justify-center h-11 md:h-14 border-2 border-[#67BA2E] text-[#67BA2E] !bg-transparent hover:text-white rounded-full px-6 md:px-10 text-[10px] md:text-base font-bold transition-all duration-300 hover:-translate-y-1 active:scale-95 shadow-sm hover:shadow-[#67BA2E]/20 [--liquid-color:#67BA2E]"
                    >
                      Portal Login
                    </Button>
                  </div>

                  {/* Bottom Quick Badges side-by-side */}
                  <div className="flex flex-row items-center justify-center lg:justify-start gap-2 md:gap-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-800">
                    <div className="flex items-center gap-2 md:gap-3 px-3 md:px-6 py-2 md:py-3 bg-[#67BA2E]/5 border border-[#67BA2E]/10 rounded-xl md:rounded-2xl">
                        <CheckCircle2 className="size-3 md:size-4 text-[#67BA2E]" />
                        <p className="text-[9px] md:text-xs font-bold text-slate-700 whitespace-nowrap">Stay organized</p>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 px-3 md:px-6 py-2 md:py-3 bg-blue-50 border border-blue-100 rounded-xl md:rounded-2xl">
                        <Users className="size-3 md:size-4 text-blue-600" />
                        <p className="text-[9px] md:text-xs font-bold text-slate-700 whitespace-nowrap">Patient care first</p>
                    </div>
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
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Access Level</p>
                        <p className="text-sm font-black text-slate-800 leading-tight uppercase">VIP Sanctuary</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-50">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-green-50 text-[#67BA2E] rounded-full border border-green-100">
                        <CheckCircle2 size={12} className="fill-[#67BA2E] text-white" />
                        <span className="text-[10px] font-black uppercase tracking-[0.1em]">Verified Standard</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-6 md:py-10">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <motion.div 
              {...fadeUp}
              className="text-center mb-8"
            >
              <h2 className="text-[#67BA2E] font-black tracking-widest uppercase text-[10px] md:text-sm mb-2 md:mb-4">Unrivaled Service</h2>
              <p className="text-3xl md:text-6xl font-black text-slate-900 tracking-tight">The SyncMed Standard</p>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: false, amount: 0.2 }}
              className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8"
            >
              <FeatureCard icon={Shield} title="Privacy First" description="Secure clinical mesh for invisible records." />
              <FeatureCard icon={Clock} title="Zero Latency" description="Instant response 24/7 direct physician line." />
              <FeatureCard icon={Award} title="Elite Specialty" description="Rapid diagnostic consultations worldwide." />
              <FeatureCard icon={Heart} title="Longevity" description="Advanced genomics for health optimization." />
              <FeatureCard icon={Globe} title="Global Care" description="Seamless cross-border care coordination." />
              <FeatureCard icon={Zap} title="Fast Insights" description="Priority imaging with same-day results." />
            </motion.div>
          </div>
        </section>

        {/* Bento-Box / Clinical Choice Redesign */}
        <section className="py-6 md:py-10 relative overflow-hidden">
          {/* Subtle Background Blob */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#67BA2E_0%,_transparent_20%)] opacity-10 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
            <motion.div {...fadeUp} className="text-center mb-8">
               <h2 className="text-3xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                  The Clinical Choice <br className="hidden md:block" />
                  <span className="text-[#67BA2E]">of the Informed.</span>
                </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
              {/* Large Bento Box */}
              <motion.div 
                {...fadeUp}
                className="md:col-span-8 bg-slate-50 border border-slate-100 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-sm"
              >
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Activity className="h-32 w-32 text-[#67BA2E]" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl md:text-4xl font-black text-slate-900 mb-4">A New Era for Health.</h3>
                  <p className="text-sm md:text-lg text-slate-600 leading-relaxed mb-8 max-w-xl">
                    SyncMed restores the sanctity of the doctor-patient relationship through uncapped consultations, providing a diagnostic precision impossible in traditional settings.
                  </p>
                  <Button 
                    onClick={() => scrollTo('about-methodology')}
                    className="w-fit h-12 md:h-14 bg-white border-2 border-[#67BA2E] text-[#67BA2E] hover:bg-[#67BA2E] hover:text-white rounded-full px-8 font-bold transition-all shadow-sm"
                  >
                    Our Methodology
                  </Button>
                </div>
              </motion.div>

              {/* Stacked Bento Boxes */}
              <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-4 md:gap-8">
                 <motion.div 
                  {...fadeUp}
                  className="flex-1 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-center relative overflow-hidden"
                 >
                   <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[#67BA2E]/10 rounded-full blur-2xl" />
                   <h4 className="text-5xl font-black text-[#67BA2E] mb-2">99.8%</h4>
                   <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-widest">Member Retention</p>
                 </motion.div>
                 <motion.div 
                  {...fadeUp}
                  className="flex-1 bg-[#67BA2E] text-white rounded-3xl p-6 shadow-lg shadow-[#67BA2E]/20 flex flex-col justify-center"
                 >
                   <CheckCircle2 className="h-8 w-8 mb-4 text-white/80" />
                   <h4 className="text-xl font-black mb-1">Direct Access</h4>
                   <p className="text-sm text-white/90">Your physician's personal secure-line.</p>
                 </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Admin-Style VIP Banner (The Sanctuary) */}
        <section id="vip-access" className="py-6 md:py-10">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <motion.div 
              {...fadeUp}
              className="relative bg-slate-900 rounded-[2rem] overflow-hidden shadow-xl"
            >
              {/* Background Image on Right Side */}
              <div className="absolute inset-y-0 right-0 w-full md:w-1/2 opacity-30 md:opacity-80">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent md:via-transparent z-10" />
                <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center" />
              </div>
              
              {/* Content */}
              <div className="relative z-20 p-8 md:p-12 max-w-2xl">
                <Crown className="h-10 w-10 text-[#67BA2E] mb-6" />
                <h2 className="text-white text-3xl md:text-5xl font-black tracking-tight mb-4">
                  The Sanctuary for Your Health.
                </h2>
                <p className="text-slate-300 text-sm md:text-lg leading-relaxed mb-8">
                  We maintain a strict ratio of 50:1. Limited capacity for the current cycle. Secure your priority access today.
                </p>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  {/* <div className="text-white">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Annual Access</p>
                    <p className="text-3xl font-black">₦5,000</p>
                  </div> */}
                  <Button 
                    variant="default"
                    asChild
                    className="h-12 w-full sm:w-auto border-2 border-white text-white !bg-transparent hover:text-white hover:border-[#67BA2E] rounded-full px-8 font-bold transition-all duration-300 hover:-translate-y-1 active:scale-95 [--liquid-color:#67BA2E]"
                  >
                    <Link href="/request-consultation">Apply for Access</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-6 md:py-10">
          <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">
            <motion.div {...fadeUp} className="text-center mb-8">
              <h2 className="text-[#67BA2E] font-black tracking-widest uppercase text-[10px] md:text-sm mb-2">Concierge Insights</h2>
              <p className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Your Questions</p>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: false, amount: 0.2 }}
              className="space-y-3"
            >
              {faqs.map((faq, idx) => (
                <AccordionItem 
                  key={idx}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openFaq === idx}
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                />
              ))}
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
