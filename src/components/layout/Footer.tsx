"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.2 },
  transition: { duration: 0.6, ease: "easeOut" as const },
};

const staggerContainer = {
  initial: {},
  whileInView: {
    transition: { staggerChildren: 0.1 },
  },
  viewport: { once: false, amount: 0.2 },
};

const linkClass =
  "block hover:text-[#67BA2E] hover:translate-x-1 transition-transform duration-200";

export const Footer = () => {
  return (
    <footer className="bg-white/40 backdrop-blur-sm pt-16 pb-10 md:pb-20 lg:pb-16 border-t border-slate-200/60">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: false, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12 md:mb-16"
        >
          {/* Brand */}
          <motion.div variants={fadeUp} className="col-span-1">
            <Link href="/" className="inline-flex items-center mb-6">
              <img src="/logo.png" alt="SyncMed" className="h-10 md:h-12 w-auto" />
            </Link>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Elite private concierge clinical management.
            </p>
            <div className="flex gap-3">
              <a
                href="mailto:hello@syncmed.health.com"
                aria-label="Email SyncMed"
                className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#67BA2E] hover:border-[#67BA2E] hover:-translate-y-1 transition-all duration-300 shadow-sm"
              >
                <Mail className="h-5 w-5" />
              </a>
              <Link
                href="/request-consultation"
                aria-label="Request a consultation"
                className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#67BA2E] hover:border-[#67BA2E] hover:-translate-y-1 transition-all duration-300 shadow-sm"
              >
                <Phone className="h-5 w-5" />
              </Link>
              <Link
                href="/request-consultation"
                aria-label="Contact SyncMed"
                className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#67BA2E] hover:border-[#67BA2E] hover:-translate-y-1 transition-all duration-300 shadow-sm"
              >
                <MapPin className="h-5 w-5" />
              </Link>
            </div>
          </motion.div>

          {/* Explore */}
          <motion.div variants={fadeUp}>
            <h4 className="text-slate-900 font-black uppercase tracking-widest text-xs mb-6">
              Explore
            </h4>
            <ul className="space-y-4 text-sm font-bold text-slate-600">
              <li>
                <Link href="/" className={linkClass}>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/services" className={linkClass}>
                  Our Services
                </Link>
              </li>
              <li>
                <Link href="/blog" className={linkClass}>
                  Clinical Journal
                </Link>
              </li>
              <li>
                <Link href="/request-consultation" className={linkClass}>
                  Request Access
                </Link>
              </li>
              <li>
                <Link href="/#faq" className={linkClass}>
                  FAQ
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Portals */}
          <motion.div variants={fadeUp}>
            <h4 className="text-slate-900 font-black uppercase tracking-widest text-xs mb-6">
              Access Portals
            </h4>
            <ul className="space-y-4 text-sm font-bold text-slate-600">
              <li>
                <Link href="/login" className={linkClass}>
                  Patient Sanctuary
                </Link>
              </li>
              <li>
                <Link href="/login" className={linkClass}>
                  Provider Dashboard
                </Link>
              </li>
              <li>
                <Link href="/login" className={linkClass}>
                  Clinical Admin
                </Link>
              </li>
              <li>
                <Link href="/forgot-password" className={linkClass}>
                  Forgot Password
                </Link>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="pt-8 border-t border-slate-200 flex flex-col items-center gap-4 text-center"
        >
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest max-w-3xl">
            © {new Date().getFullYear()} SyncMed. Private & Confidential. Built for
            Healthcare Security.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <Link href="/" className="hover:text-[#67BA2E] transition-colors">
              syncmed.health.com
            </Link>
            <span className="hidden sm:inline text-slate-300">|</span>
            <Link href="/services" className="hover:text-[#67BA2E] transition-colors">
              Services
            </Link>
            <Link href="/blog" className="hover:text-[#67BA2E] transition-colors">
              Blog
            </Link>
            <Link
              href="/request-consultation"
              className="hover:text-[#67BA2E] transition-colors"
            >
              Contact
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};
