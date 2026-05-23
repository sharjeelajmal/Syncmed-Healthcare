"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAiKnowledgeBase, updateAiKnowledgeBase } from "@/app/actions/ai.actions";
import { Sparkles, Save, Loader2, Bot, ShieldAlert, BookOpen, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AiLearningPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [kbId, setKbId] = useState<string | undefined>(undefined);
  
  const [formData, setFormData] = useState({
    systemIdentity: "",
    coreKnowledge: "",
    strictRules: "",
    modelPreference: "openai/gpt-4o-mini",
  });

  useEffect(() => {
    async function loadData() {
      const res = await getAiKnowledgeBase();
      if (res.success && res.data) {
        setKbId(res.data.id);
        setFormData({
          systemIdentity: res.data.systemIdentity,
          coreKnowledge: res.data.coreKnowledge,
          strictRules: res.data.strictRules,
          modelPreference: res.data.modelPreference,
        });
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const res = await updateAiKnowledgeBase({ id: kbId, ...formData });
    if (res.success) {
      toast.success("Syncing Complete");
      router.refresh();
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <Loader2 className="size-6 animate-spin text-[#67BA2E] mb-2" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading Neural Core...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Hyper-Compact Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="size-5 text-[#67BA2E]" /> Brain Train
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Knowledge Configuration</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          size="sm"
          className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-10 px-4 font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 shadow-lg shadow-slate-900/10"
        >
          {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5 mr-2" />}
          {isSaving ? "" : "Save"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {[
            { id: 'systemIdentity', label: 'System Identity', icon: Bot, color: 'text-indigo-500', bg: 'bg-indigo-50', placeholder: 'Neural persona...' },
            { id: 'coreKnowledge', label: 'Core Knowledge', icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-50', placeholder: 'FAQs, clinical data...' },
            { id: 'strictRules', label: 'Strict Rules', icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-50', placeholder: 'Compliance boundaries...' }
          ].map((field) => (
            <div key={field.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 group focus-within:border-[#67BA2E]/30 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn("size-8 rounded-lg flex items-center justify-center shrink-0", field.bg)}>
                  <field.icon className={cn("size-4", field.color)} />
                </div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{field.label}</label>
              </div>
              <Textarea 
                value={(formData as any)[field.id]}
                onChange={(e) => setFormData({...formData, [field.id]: e.target.value})}
                placeholder={field.placeholder}
                className="h-[100px] resize-none overflow-y-auto bg-slate-50/50 border-slate-200 focus-visible:ring-[#67BA2E] rounded-xl text-xs font-medium leading-relaxed tracking-[0.03em] custom-scrollbar"
              />
            </div>
          ))}
        </div>

        <div className="space-y-4">
           <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                  <Settings className="size-4 text-slate-500" />
                </div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Engine Config</label>
              </div>
              
              <div className="space-y-4">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400 mb-2 block">Active Model</span>
                  <Select value={formData.modelPreference} onValueChange={(val) => setFormData({...formData, modelPreference: val})}>
                    <SelectTrigger className="h-10 bg-slate-50 border-slate-100 rounded-xl font-bold text-xs text-slate-700">
                      <SelectValue placeholder="Model" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                      <SelectItem value="openai/gpt-4o-mini" className="font-bold text-xs py-2">GPT-4o Mini</SelectItem>
                      <SelectItem value="openai/gpt-4o" className="font-bold text-xs py-2">GPT-4o</SelectItem>
                      <SelectItem value="anthropic/claude-3.5-sonnet" className="font-bold text-xs py-2">Claude 3.5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-100/50">
                   <p className="text-[10px] text-amber-700 leading-relaxed font-bold">
                     Changes affect new threads. High-priority rules override previous learning.
                   </p>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
