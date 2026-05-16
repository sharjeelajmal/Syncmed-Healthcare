"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Layout, Image as ImageIcon, Type, Save } from "lucide-react"
import { Button } from "@/components/ui/button"

export const HeroSectionEditor = () => {
  const [formData, setFormData] = React.useState({
    mainHeading: "The Medical Repository.",
    subHeading: "Clinically vetted articles on longevity, bespoke medicine, and cognitive health.",
    bannerText: "SyncMed Clinical Journal"
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white border border-slate-100 shadow-sm rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[#67BA2E]">
            <Layout size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Hero Layout Configuration</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Main Landing & Blog Banners</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Main Heading</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#67BA2E] transition-colors">
                  <Type size={16} />
                </div>
                <input 
                  type="text"
                  name="mainHeading"
                  value={formData.mainHeading}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#67BA2E]/20 focus:border-[#67BA2E] transition-all tracking-[0.03em]"
                  placeholder="Enter main heading..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Banner Tag</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#67BA2E] transition-colors">
                  <ImageIcon size={16} />
                </div>
                <input 
                  type="text"
                  name="bannerText"
                  value={formData.bannerText}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#67BA2E]/20 focus:border-[#67BA2E] transition-all tracking-[0.03em]"
                  placeholder="Enter banner tag..."
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sub-heading / Description</label>
            <textarea 
              name="subHeading"
              value={formData.subHeading}
              onChange={handleChange}
              rows={4}
              className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] p-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#67BA2E]/20 focus:border-[#67BA2E] transition-all tracking-[0.03em] leading-relaxed resize-none"
              placeholder="Enter sub-heading description..."
            />
          </div>

          <div className="pt-4 flex justify-end">
            <Button className="bg-[#67BA2E] hover:bg-[#5aa329] text-white px-8 h-12 rounded-full font-bold shadow-lg shadow-[#67BA2E]/20 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2">
              <Save size={18} />
              Update Hero Section
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
