"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  Home,
  Stethoscope,
  ArrowRight,
  Shield,
  Activity,
  FileText,
  LogIn,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const quickLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/services", label: "Services", icon: Activity },
  { href: "/request-consultation", label: "Contact", icon: FileText },
  { href: "/login", label: "Portal Login", icon: LogIn },
]

export function NotFoundView() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5 py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative w-full max-w-3xl"
      >
        {/* Glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 left-1/2 size-72 -translate-x-1/2 rounded-full bg-[#67BA2E]/15 blur-3xl"
        />

        <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/90 bg-white/90 p-8 shadow-2xl shadow-slate-200/50 backdrop-blur-md md:rounded-[2.5rem] md:p-12 lg:p-14">
          {/* Top accent bar */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#67BA2E] to-transparent opacity-80" />

          <div className="flex flex-col items-center text-center">
            {/* Icon badge */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.45 }}
              className="relative mb-8"
            >
              <div className="flex size-20 items-center justify-center rounded-[1.5rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white shadow-inner md:size-24 md:rounded-[1.75rem]">
                <Stethoscope className="size-9 text-[#67BA2E] md:size-11" strokeWidth={2.25} />
              </div>
              <span className="absolute -right-1 -top-1 flex size-7 items-center justify-center rounded-full border-2 border-white bg-amber-400 text-[10px] font-black text-white shadow-md">
                !
              </span>
            </motion.div>

            {/* 404 number */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.45 }}
              className="text-[5rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-[#67BA2E] via-emerald-500 to-teal-600 md:text-[7rem]"
            >
              404
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.45 }}
              className="mt-4 space-y-3"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#67BA2E]">
                SyncMed · Route Not Found
              </p>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
                This page isn&apos;t in our clinical directory
              </h1>
              <p className="mx-auto max-w-md text-sm font-medium leading-relaxed text-slate-500 md:text-base">
                The link may be outdated, mistyped, or moved. Let&apos;s get you
                back to a secure area of the platform.
              </p>
            </motion.div>

            {/* Primary actions */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.45 }}
              className="mt-8 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center"
            >
              <Button
                asChild
                className="h-12 w-full rounded-xl bg-[#67BA2E] px-8 font-bold text-white shadow-lg shadow-emerald-200/50 hover:bg-[#5aa827] sm:w-auto"
              >
                <Link href="/" className="gap-2">
                  <Home className="size-4" />
                  Back to Home
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 w-full rounded-xl border-slate-200 font-bold text-slate-700 hover:border-[#67BA2E]/40 hover:bg-emerald-50/50 hover:text-[#67BA2E] sm:w-auto"
              >
                <Link href="/request-consultation" className="gap-2">
                  Request Access
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </motion.div>

            {/* Quick links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-10 w-full border-t border-slate-100 pt-8"
            >
              <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Quick navigation
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {quickLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-4 transition-all hover:-translate-y-0.5 hover:border-[#67BA2E]/30 hover:bg-white hover:shadow-md"
                  >
                    <div className="flex size-10 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm transition-colors group-hover:bg-[#67BA2E]/10 group-hover:text-[#67BA2E]">
                      <Icon className="size-4" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 group-hover:text-[#67BA2E]">
                      {label}
                    </span>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Trust strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50/80 px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-slate-400"
            >
              <Shield className="size-3.5 text-[#67BA2E]" />
              Secure · Private · SyncMed Platform
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
