"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Shield, Lock, Key, Save, Loader2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { updatePassword } from "@/app/actions/settings.actions"
import { toast } from "sonner"

export const SecurityConfig = () => {
  const [isPending, startTransition] = React.useTransition()
  const [showCurrent, setShowCurrent] = React.useState(false)
  const [showNew, setShowNew] = React.useState(false)
  const [showConfirm, setShowConfirm] = React.useState(false)
  
  const [passwords, setPasswords] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  // Password Strength Logic
  const checks = {
    length: passwords.newPassword.length >= 8,
    number: /[0-9]/.test(passwords.newPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(passwords.newPassword),
    upper: /[A-Z]/.test(passwords.newPassword)
  }
  const strengthScore = Object.values(checks).filter(Boolean).length

  const handleSubmit = async () => {
    if (strengthScore < 4) {
      return toast.error("Please meet all password strength requirements")
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error("New passwords do not match")
    }

    startTransition(async () => {
      const result = await updatePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      })
      if (result.success) {
        toast.success("Password updated successfully!", {
          description: "Your security credentials have been refreshed.",
          icon: <Shield className="text-[#67BA2E]" size={16} />
        })
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" })
      } else {
        // "Pyara sa" error notification
        toast.error(result.message || "Failed to update password", {
          description: result.message?.includes("current password") 
            ? "Old password is not correct. Please check and try again."
            : "Something went wrong, please try again.",
          style: { borderLeft: '4px solid #ef4444' }
        })
      }
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white border border-slate-100 shadow-sm rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Shield size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Security & Encryption</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Manage access & authentication</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Password Change Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#67BA2E] transition-colors">
                  <Lock size={16} />
                </div>
                <input 
                  type={showCurrent ? "text" : "password"}
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                  className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-3.5 pl-11 pr-12 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#67BA2E]/20 focus:border-[#67BA2E] transition-all tracking-[0.03em]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#67BA2E] transition-colors"
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#67BA2E] transition-colors">
                  <Key size={16} />
                </div>
                <input 
                  type={showNew ? "text" : "password"}
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                  className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-3.5 pl-11 pr-12 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#67BA2E]/20 focus:border-[#67BA2E] transition-all tracking-[0.03em]"
                  placeholder="New Secure Password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#67BA2E] transition-colors"
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Strength Indicator */}
            <div className="md:col-span-2 space-y-5 p-6 bg-slate-50/80 border border-slate-100 rounded-[2rem]">
               <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Encryption Strength</span>
                    <span className="text-[9px] text-slate-400 font-medium tracking-tight">SyncMed Multi-layer Validation</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                      strengthScore === 0 ? 'bg-slate-100 text-slate-300' :
                      strengthScore <= 2 ? 'bg-red-50 text-red-500' :
                      strengthScore === 3 ? 'bg-orange-50 text-orange-500' : 'bg-emerald-50 text-[#67BA2E]'
                    }`}>
                      {strengthScore === 0 ? 'None' : strengthScore <= 2 ? 'Insecure' : strengthScore === 3 ? 'Medium Node' : 'Clinical Grade'}
                    </span>
                  </div>
               </div>
               <div className="flex gap-1.5 h-1.5">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className={`flex-1 rounded-full transition-all duration-700 ease-out ${
                      i <= strengthScore ? (
                        strengthScore <= 2 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]' :
                        strengthScore === 3 ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.3)]' : 'bg-[#67BA2E] shadow-[0_0_12px_rgba(103,186,46,0.4)]'
                      ) : 'bg-slate-200'
                    }`} />
                  ))}
               </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  {[
                    { key: 'length', label: '8+ Characters', desc: 'Min length' },
                    { key: 'upper', label: 'Uppercase', desc: 'Capital letter' },
                    { key: 'number', label: 'Number', desc: 'Numeric value' },
                    { key: 'special', label: 'Special Char', desc: 'Symbol (@#$)' }
                  ].map((check) => (
                    <motion.div 
                      key={check.key} 
                      initial={false}
                      animate={{ 
                        opacity: checks[check.key as keyof typeof checks] ? 1 : 0.6,
                        y: checks[check.key as keyof typeof checks] ? 0 : 2
                      }}
                      className="flex flex-col gap-1.5 p-3 rounded-2xl bg-white border border-slate-100"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`size-4 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                          checks[check.key as keyof typeof checks] 
                            ? 'bg-[#67BA2E] border-[#67BA2E] shadow-sm shadow-[#67BA2E]/20' 
                            : 'border-slate-200 bg-white'
                        }`}>
                          {checks[check.key as keyof typeof checks] && (
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="size-1.5 bg-white rounded-full" 
                            />
                          )}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-tight ${
                          checks[check.key as keyof typeof checks] ? 'text-slate-900' : 'text-slate-400'
                        }`}>{check.label}</span>
                      </div>
                      <p className={`text-[9px] font-bold tracking-tight pl-6 ${
                        checks[check.key as keyof typeof checks] ? 'text-[#67BA2E]' : 'text-slate-400'
                      }`}>
                        {checks[check.key as keyof typeof checks] ? 'Active / Verified' : `Required: ${check.desc}`}
                      </p>
                    </motion.div>
                  ))}
               </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#67BA2E] transition-colors">
                  <Key size={16} />
                </div>
                <input 
                  type={showConfirm ? "text" : "password"}
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                  className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-3.5 pl-11 pr-12 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#67BA2E]/20 focus:border-[#67BA2E] transition-all tracking-[0.03em]"
                  placeholder="Confirm New Password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#67BA2E] transition-colors"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <Button 
              disabled={isPending}
              onClick={handleSubmit}
              className="bg-[#67BA2E] hover:bg-[#5aa329] text-white px-8 h-12 rounded-full font-bold shadow-lg shadow-[#67BA2E]/20 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
            >
              {isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Update Credentials
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
