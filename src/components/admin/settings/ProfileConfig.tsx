"use client"

import { Camera, Loader2, Mail, Save, User as UserIcon } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { updateProfile } from "@/app/actions/settings.actions"
import { toast } from "sonner"

export const ProfileConfig = ({ user }: { user: any }) => {
  const router = useRouter()
  const { update } = useSession()
  const [isPending, startTransition] = React.useTransition()
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = React.useState<string | null>(user.image || null)
  const [formData, setFormData] = React.useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    image: user.image || ""
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        return toast.error("Image size must be less than 2MB")
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setImagePreview(base64)
        setFormData(prev => ({ ...prev, image: base64 }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    startTransition(async () => {
      const result = await updateProfile(formData)
      if (result.success) {
        // Force session update for header
        // Name only in JWT — avatar is loaded from DB in admin layout (base64 is too large for cookies)
        await update({
          name: `${formData.firstName} ${formData.lastName}`,
        })
        
        toast.success("Profile updated successfully")
        router.refresh()
      } else {
        toast.error(result.message || "Failed to update profile")
      }
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white border border-slate-100 shadow-sm rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10">
        {/* Avatar Upload Section */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-10 pb-8 border-b border-slate-50">
          <div className="relative group">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              accept="image/*" 
              className="hidden" 
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="size-24 md:size-32 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-[#67BA2E]/50 cursor-pointer relative"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={40} className="text-slate-300 group-hover:text-[#67BA2E] transition-colors" />
              )}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera size={24} className="text-white" />
              </div>
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 size-10 bg-[#67BA2E] text-white rounded-xl flex items-center justify-center shadow-lg shadow-[#67BA2E]/20 hover:scale-110 transition-transform active:scale-95"
            >
              <Camera size={18} />
            </button>
          </div>
          <div className="text-center md:text-left space-y-1">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Profile Identity</h3>
            <p className="text-xs text-slate-500 tracking-[0.015em]">Upload a professional avatar for your administrative profile.</p>
            <p className="text-[10px] font-black text-[#67BA2E] uppercase tracking-widest pt-2">Max Size: 2MB | JPG, PNG</p>
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
            <input 
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-3.5 px-5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#67BA2E]/20 focus:border-[#67BA2E] transition-all tracking-[0.03em]"
              placeholder="Enter first name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
            <input 
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-3.5 px-5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#67BA2E]/20 focus:border-[#67BA2E] transition-all tracking-[0.03em]"
              placeholder="Enter last name"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Administrative Email</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#67BA2E] transition-colors">
                <Mail size={16} />
              </div>
              <input 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-3.5 pl-11 pr-5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#67BA2E]/20 focus:border-[#67BA2E] transition-all tracking-[0.03em]"
                placeholder="admin@syncmed.com"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 ml-1 tracking-wide italic">* This email is used for all system-level notifications.</p>
          </div>
        </div>

        <div className="pt-10 flex justify-end">
          <Button 
            disabled={isPending}
            onClick={handleSubmit}
            className="bg-[#67BA2E] hover:bg-[#5aa329] text-white px-8 h-12 rounded-full font-bold shadow-lg shadow-[#67BA2E]/20 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
          >
            {isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
