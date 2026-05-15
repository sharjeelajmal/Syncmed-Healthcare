"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Shield, 
  CheckCircle2,
  Phone,
  Mail,
  MapPin
} from "lucide-react";

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

export const Footer = () => {
  return (
    <footer className="bg-slate-50 pt-16 pb-10 md:pb-20 lg:pb-16 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: false, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12 md:mb-16"
        >
          {/* Column 1: Brand */}
          <motion.div variants={fadeUp} className="col-span-1">
            <div className="flex items-center mb-6">
              <img src="/logo.png" alt="SyncMed" className="h-10 md:h-12 w-auto" />
            </div>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Elite private concierge clinical management.
            </p>
            <div className="flex gap-3">
              {[Mail, Phone, MapPin].map((Icon, i) => (
                <a key={i} href="#" className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#67BA2E] hover:border-[#67BA2E] hover:-translate-y-1 transition-all duration-300 shadow-sm">
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Column 2: Portals */}
          <motion.div variants={fadeUp}>
            <h4 className="text-slate-900 font-black uppercase tracking-widest text-xs mb-6">Access Portals</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-600">
              <li><Link href="/login" className="block hover:text-[#67BA2E] hover:translate-x-1 transition-transform duration-200">Patient Sanctuary</Link></li>
              <li><Link href="/login" className="block hover:text-[#67BA2E] hover:translate-x-1 transition-transform duration-200">Provider Dashboard</Link></li>
              <li><Link href="/login" className="block hover:text-[#67BA2E] hover:translate-x-1 transition-transform duration-200">Clinical Admin</Link></li>
            </ul>
          </motion.div>

          {/* Column 3: Corporate */}
          <motion.div variants={fadeUp}>
            <h4 className="text-slate-900 font-black uppercase tracking-widest text-xs mb-6">Corporate & Security</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-600">
              <li><Link href="/services" className="block hover:text-[#67BA2E] hover:translate-x-1 transition-transform duration-200">Our Services</Link></li>
              <li><Link href="#" className="block hover:text-[#67BA2E] hover:translate-x-1 transition-transform duration-200">HIPAA Compliance</Link></li>
              <li><Link href="#" className="block hover:text-[#67BA2E] hover:translate-x-1 transition-transform duration-200">NDPA Standards</Link></li>
            </ul>
          </motion.div>
        </motion.div>

        <motion.div 
          variants={fadeUp}
          className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest text-center">
            © {new Date().getFullYear()} SyncMed. Private & Confidential.
          </p>
          <div className="flex gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span className="flex items-center gap-2"><Shield className="h-3 w-3 text-[#67BA2E]" /> AES-256</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-[#67BA2E]" /> HIPAA</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};
