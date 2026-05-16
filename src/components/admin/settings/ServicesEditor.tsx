"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Briefcase, Plus, Trash2, GripVertical, Save } from "lucide-react"
import { Button } from "@/components/ui/button"

export const ServicesEditor = () => {
  const [services, setServices] = React.useState([
    { id: 1, title: "Privacy First", description: "Secure clinical mesh for invisible records." },
    { id: 2, title: "Zero Latency", description: "Instant response 24/7 direct physician line." },
    { id: 3, title: "Elite Specialty", description: "Rapid diagnostic consultations worldwide." }
  ])

  const addService = () => {
    const newId = services.length > 0 ? Math.max(...services.map(s => s.id)) + 1 : 1
    setServices([...services, { id: newId, title: "", description: "" }])
  }

  const removeService = (id: number) => {
    setServices(services.filter(s => s.id !== id))
  }

  const updateService = (id: number, field: string, value: string) => {
    setServices(services.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white border border-slate-100 shadow-sm rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Briefcase size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Services Management</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Configure Clinic Features</p>
            </div>
          </div>
          <Button 
            onClick={addService}
            variant="outline"
            className="rounded-full border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-widest px-6 h-10 hover:bg-slate-50 hover:text-[#67BA2E] hover:border-[#67BA2E] transition-all flex items-center gap-2"
          >
            <Plus size={14} />
            Add Feature
          </Button>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {services.map((service, index) => (
              <motion.div 
                key={service.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group flex flex-col md:flex-row items-start gap-4 p-5 bg-slate-50/50 border border-slate-100 rounded-2xl relative"
              >
                <div className="hidden md:flex items-center self-center cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-400">
                  <GripVertical size={20} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow w-full">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                    <input 
                      type="text"
                      value={service.title}
                      onChange={(e) => updateService(service.id, 'title', e.target.value)}
                      className="w-full bg-white border border-slate-100 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#67BA2E]/20 focus:border-[#67BA2E] transition-all tracking-[0.03em]"
                      placeholder="Service Title..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                    <input 
                      type="text"
                      value={service.description}
                      onChange={(e) => updateService(service.id, 'description', e.target.value)}
                      className="w-full bg-white border border-slate-100 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#67BA2E]/20 focus:border-[#67BA2E] transition-all tracking-[0.03em]"
                      placeholder="Service Description..."
                    />
                  </div>
                </div>

                <button 
                  onClick={() => removeService(service.id)}
                  className="md:self-center p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all md:mt-4"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {services.length === 0 && (
            <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
               <p className="text-slate-400 font-bold text-sm">No services configured yet. Click 'Add Feature' to start.</p>
            </div>
          )}

          <div className="pt-8 flex justify-end">
            <Button className="bg-[#67BA2E] hover:bg-[#5aa329] text-white px-8 h-12 rounded-full font-bold shadow-lg shadow-[#67BA2E]/20 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2">
              <Save size={18} />
              Save Services
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
