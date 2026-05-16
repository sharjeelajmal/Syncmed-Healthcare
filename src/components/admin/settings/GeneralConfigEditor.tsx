"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Globe, Mail, Phone, MapPin, Camera, MessageSquare, Users, Save } from "lucide-react"
import { Button } from "@/components/ui/button"

export const GeneralConfigEditor = () => {
  const [config, setConfig] = React.useState({
    email: "contact@syncmed.com",
    phone: "+1 (555) 902-1000",
    address: "123 Sanctuary Drive, Medical District, NY",
    instagram: "syncmed_health",
    twitter: "syncmed",
    linkedin: "syncmed-healthcare"
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setConfig(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white border border-slate-100 shadow-sm rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
            <Globe size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">General Configuration</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact & Social Metadata</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Details */}
          <div className="space-y-6">
            <h4 className="text-[11px] font-black text-[#67BA2E] uppercase tracking-[0.25em] mb-2 px-1">Primary Contact</h4>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Support Email</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#67BA2E] transition-colors">
                  <Mail size={16} />
                </div>
                <input 
                  type="email"
                  name="email"
                  value={config.email}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#67BA2E]/20 focus:border-[#67BA2E] transition-all tracking-[0.03em]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Phone</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#67BA2E] transition-colors">
                  <Phone size={16} />
                </div>
                <input 
                  type="text"
                  name="phone"
                  value={config.phone}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#67BA2E]/20 focus:border-[#67BA2E] transition-all tracking-[0.03em]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Physical Address</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#67BA2E] transition-colors">
                  <MapPin size={16} />
                </div>
                <input 
                  type="text"
                  name="address"
                  value={config.address}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#67BA2E]/20 focus:border-[#67BA2E] transition-all tracking-[0.03em]"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-6">
            <h4 className="text-[11px] font-black text-[#67BA2E] uppercase tracking-[0.25em] mb-2 px-1">Social Presence</h4>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Instagram Handle</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#67BA2E] transition-colors">
                  <Camera size={16} />
                </div>
                <input 
                  type="text"
                  name="instagram"
                  value={config.instagram}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#67BA2E]/20 focus:border-[#67BA2E] transition-all tracking-[0.03em]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Twitter Handle</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#67BA2E] transition-colors">
                  <MessageSquare size={16} />
                </div>
                <input 
                  type="text"
                  name="twitter"
                  value={config.twitter}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#67BA2E]/20 focus:border-[#67BA2E] transition-all tracking-[0.03em]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">LinkedIn Profile</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#67BA2E] transition-colors">
                  <Users size={16} />
                </div>
                <input 
                  type="text"
                  name="linkedin"
                  value={config.linkedin}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#67BA2E]/20 focus:border-[#67BA2E] transition-all tracking-[0.03em]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-10 flex justify-end">
          <Button className="bg-[#67BA2E] hover:bg-[#5aa329] text-white px-8 h-12 rounded-full font-bold shadow-lg shadow-[#67BA2E]/20 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2">
            <Save size={18} />
            Commit Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
