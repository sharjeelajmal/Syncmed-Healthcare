"use client";

import React, { useEffect, useState } from "react";
import { getAdminAiHistory } from "@/app/actions/ai.actions";
import { Loader2, MessageSquare, Calendar, Sparkles, ChevronRight, Clock } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function AiHistoryPage() {
  const [historyGroups, setHistoryGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      const res = await getAdminAiHistory();
      if (res.success && res.data) {
        setHistoryGroups(res.data);
      }
      setIsLoading(false);
    }
    loadHistory();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <Loader2 className="size-6 animate-spin text-[#67BA2E] mb-2" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading Transcripts...</span>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Hyper-Compact Header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Audit Logs</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">System Transcripts</p>
        </div>
        <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center">
          <Clock className="size-5 text-slate-400" />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {historyGroups.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center opacity-40">
            <MessageSquare className="size-10 text-slate-300 mb-4" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">No logs found</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {historyGroups.map((group) => (
              <Sheet key={group.userId}>
                <SheetTrigger asChild>
                  <div className="flex items-center gap-3 p-3 active:bg-slate-50 transition-all cursor-pointer group relative overflow-hidden">
                    <Avatar className="size-12 rounded-2xl border border-slate-50 shadow-sm shrink-0">
                      <AvatarFallback className="bg-slate-50 text-slate-600 font-black text-xs">
                        {group.user.firstName[0]}{group.user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                      <div className="flex flex-col mb-1">
                        <h4 className="text-xs font-bold text-slate-800 truncate">{group.user.firstName} {group.user.lastName}</h4>
                        <span className="text-[10px] text-slate-400 font-medium">{group.user.email}</span>
                      </div>
                        <span className="text-[9px] font-medium text-slate-400">{new Date(group.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn("text-[8px] font-black uppercase tracking-widest h-4 px-1.5 border-none", group.user.role === 'PATIENT' ? "bg-blue-50 text-blue-500" : "bg-purple-50 text-purple-500")}>
                          {group.user.role}
                        </Badge>
                        <p className="text-[10px] font-medium text-slate-400 truncate flex-1">
                          {group.messages[group.messages.length - 1].content}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-slate-300 group-active:translate-x-1 transition-transform" />
                  </div>
                </SheetTrigger>
                
                {/* Native Slide-up Sheet */}
                <SheetContent side="bottom" className="h-[85vh] rounded-t-[2.5rem] border-t-0 p-0 flex flex-col bg-white overflow-hidden">
                  <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-3 shrink-0" />
                  
                  <SheetHeader className="px-6 pb-4 border-b border-slate-50 shrink-0">
                    <SheetTitle className="flex items-center gap-3">
                      <Avatar className="size-10 rounded-xl border border-slate-100">
                        <AvatarFallback className="bg-slate-50 text-slate-600 font-black text-xs">
                          {group.user.firstName[0]}{group.user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-black text-slate-800 leading-none mb-1">{group.user.firstName} {group.user.lastName}</span>
                        <span className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">Interaction History</span>
                      </div>
                    </SheetTitle>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-slate-50/30 custom-scrollbar">
                    {group.messages.map((msg: any) => {
                      const isUser = msg.role === 'user';
                      return (
                        <div key={msg.id} className={cn("flex flex-col w-full animate-in fade-in slide-in-from-bottom-4 duration-500", isUser ? "items-end" : "items-start")}>
                          <div className="flex items-end gap-2 max-w-[85%]">
                            {!isUser && (
                              <div className="size-7 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 mb-1">
                                <Sparkles className="size-3.5 text-[#67BA2E]" />
                              </div>
                            )}
                            <div className={cn(
                              "px-5 py-3.5 rounded-3xl text-[13px] font-medium leading-[1.7] tracking-[0.03em] whitespace-pre-wrap shadow-sm",
                              isUser ? "bg-slate-900 text-white rounded-tr-none" : "bg-white border border-slate-100 text-slate-700 rounded-tl-none"
                            )}>
                              {msg.content}
                            </div>
                          </div>
                          <span className={cn("text-[8px] font-black uppercase tracking-widest text-slate-400 mt-2 px-1", isUser ? "text-right" : "pl-9")}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </SheetContent>
              </Sheet>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
