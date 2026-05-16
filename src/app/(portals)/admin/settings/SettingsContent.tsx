"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, Shield, BarChart3 } from "lucide-react"
import { ProfileConfig } from "@/components/admin/settings/ProfileConfig"
import { SecurityConfig } from "@/components/admin/settings/SecurityConfig"
import { OverviewAnalytics } from "@/components/admin/settings/OverviewAnalytics"

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Shield },
]

export const SettingsContent = ({ user }: { user: any }) => {
  const [activeTab, setActiveTab] = React.useState("overview")

  return (
    <div className="space-y-8">
      {/* Sleek Native-Style Tabs */}
      <div className="relative">
        <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-hide no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 whitespace-nowrap ${
                  isActive ? "text-[#67BA2E]" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100/50"
                }`}
              >
                <Icon size={16} className={isActive ? "fill-[#67BA2E]/10" : ""} />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">{tab.label}</span>
                
                {isActive && (
                  <motion.div
                    layoutId="active-settings-tab"
                    className="absolute inset-0 bg-[#67BA2E]/5 border border-[#67BA2E]/10 rounded-full -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                {isActive && (
                  <motion.div
                    layoutId="active-settings-dot"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#67BA2E] rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            )
          })}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-100 -z-20" />
      </div>

      {/* Tab Content Area */}
      <div className="pt-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {activeTab === "overview" && <OverviewAnalytics />}
            {activeTab === "profile" && <ProfileConfig user={user} />}
            {activeTab === "security" && <SecurityConfig />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
