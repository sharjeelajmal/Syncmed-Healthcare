"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Bell, UserPlus, Calendar, Activity, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { updatePreferences } from "@/app/actions/settings.actions"
import { toast } from "sonner"

const iOSToggle = ({ enabled, setEnabled, disabled }: { enabled: boolean, setEnabled: (v: boolean) => void, disabled?: boolean }) => (
  <button
    disabled={disabled}
    onClick={() => setEnabled(!enabled)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
      enabled ? 'bg-[#67BA2E]' : 'bg-slate-200'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    <motion.span
      animate={{ x: enabled ? 22 : 2 }}
      className="inline-block h-5 w-5 rounded-full bg-white shadow-sm"
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    />
  </button>
)

export const NotificationPreferences = ({ initialPrefs }: { initialPrefs: any }) => {
  const [isPending, startTransition] = React.useTransition()
  const [prefs, setPrefs] = React.useState({
    newPatients: initialPrefs?.newPatients ?? true,
    appointments: initialPrefs?.appointments ?? true,
    systemUpdates: initialPrefs?.systemUpdates ?? false
  })

  const handleSave = async () => {
    startTransition(async () => {
      const result = await updatePreferences(prefs)
      if (result.success) {
        toast.success("Preferences saved successfully")
      } else {
        toast.error(result.message || "Failed to save preferences")
      }
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white border border-slate-100 shadow-sm rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <Bell size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Notification Channels</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Control how you stay informed</p>
          </div>
        </div>

        <div className="mb-8 p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
          <p className="text-[11px] font-bold text-emerald-800 leading-relaxed">
            <span className="inline-block mr-1">ℹ️</span>
            Yeh settings aapke dashboard aur header "Bell" icon me aane wali real-time alerts ko control karti hain. Jab aap inhein enable karenge, system aapko har activity pe foran notify karega.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-xl bg-[#67BA2E]/10 flex items-center justify-center text-[#67BA2E]">
                <UserPlus size={18} />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-black text-slate-800 tracking-tight">New Patient Alerts</h4>
                <p className="text-xs text-slate-500 tracking-[0.015em]">Receive notifications when a new profile is registered.</p>
              </div>
            </div>
            {iOSToggle({ 
              enabled: prefs.newPatients, 
              setEnabled: (v) => setPrefs({...prefs, newPatients: v}),
              disabled: isPending 
            })}
          </div>

          <div className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Calendar size={18} />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-black text-slate-800 tracking-tight">Appointment Reminders</h4>
                <p className="text-xs text-slate-500 tracking-[0.015em]">Stay updated on upcoming clinical encounters.</p>
              </div>
            </div>
            {iOSToggle({ 
              enabled: prefs.appointments, 
              setEnabled: (v) => setPrefs({...prefs, appointments: v}),
              disabled: isPending 
            })}
          </div>

          <div className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                <Activity size={18} />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-black text-slate-800 tracking-tight">System Updates</h4>
                <p className="text-xs text-slate-500 tracking-[0.015em]">Be notified of new platform features and nodes.</p>
              </div>
            </div>
            {iOSToggle({ 
              enabled: prefs.systemUpdates, 
              setEnabled: (v) => setPrefs({...prefs, systemUpdates: v}),
              disabled: isPending 
            })}
          </div>

          <div className="pt-10 flex justify-end">
            <Button 
              disabled={isPending}
              onClick={handleSave}
              className="bg-[#67BA2E] hover:bg-[#5aa329] text-white px-8 h-12 rounded-full font-bold shadow-lg shadow-[#67BA2E]/20 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
            >
              {isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save Preferences
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
