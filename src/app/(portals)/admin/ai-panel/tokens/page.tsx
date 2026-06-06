"use client";

import { useEffect, useState } from "react";
import { getAiDashboardStats } from "@/app/actions/ai.actions";
import { Loader2, Coins, Receipt, ArrowUpRight, ArrowDownRight, Flame, Database, Bot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatNaira, CURRENCY_SYMBOL } from "@/lib/currency";

export default function AiTokensPage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const res = await getAiDashboardStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
      setIsLoading(false);
    }
    loadStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <Loader2 className="size-6 animate-spin text-[#67BA2E] mb-2" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading Financials...</span>
      </div>
    );
  }

  const tokenRatePerMillion = 0.5;
  const estimatedCost = ((stats?.totalTokens || 0) / 1_000_000) * tokenRatePerMillion;
  const todayCost = ((stats?.todayTokens || 0) / 1_000_000) * tokenRatePerMillion;
  const dailyBudget = Math.max(todayCost, estimatedCost * 0.1, 0.01);
  const spendPercentage = Math.min((todayCost / dailyBudget) * 100, 100);
  const modelLabel = stats?.modelPreference?.split("/").pop() ?? "—";

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Hyper-Compact Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Coins className="size-5 text-emerald-500" /> Token Spent
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">API Cost Tracking</p>
        </div>
        <div className="size-10 rounded-full bg-emerald-50 flex items-center justify-center">
          <Receipt className="size-5 text-emerald-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-3xl border-slate-100 shadow-sm col-span-1 md:col-span-2 overflow-hidden bg-white">
          <CardHeader className="p-4 pb-2 border-b border-slate-50">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Flame className="size-3.5 text-orange-500" /> Consumption Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Lifetime Burn</span>
                <div className="text-xl font-black text-slate-900 flex items-center gap-1">
                  {stats?.totalTokens.toLocaleString() || 0}
                  <ArrowUpRight className="size-3 text-red-500" />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Efficiency</span>
                <div className="text-xl font-black text-slate-900 flex items-center gap-1">
                  {stats?.avgTokensPerMessage.toLocaleString() || 0}
                  <ArrowDownRight className="size-3 text-emerald-500" />
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-2">
               <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-none text-[9px] font-black uppercase tracking-widest px-2 py-1"><Bot className="size-3 mr-1"/> {modelLabel}</Badge>
               <Badge variant="outline" className="bg-purple-50 text-purple-600 border-none text-[9px] font-black uppercase tracking-widest px-2 py-1"><Database className="size-3 mr-1"/> {(stats?.todayTokens ?? 0).toLocaleString()} today</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-emerald-100 bg-emerald-50/30 shadow-sm relative overflow-hidden">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-emerald-800">Live API Cost</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-3xl font-black text-emerald-600 flex items-start gap-1 mb-6">
              <span className="text-base mt-1">{CURRENCY_SYMBOL}</span>
              {estimatedCost.toFixed(4)}
            </div>
            
            <div className="space-y-2">
               <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-emerald-700/70">
                 <span>Daily Quota</span>
                 <span>{formatNaira(dailyBudget)}</span>
               </div>
               <div className="h-2 w-full bg-emerald-100 rounded-full overflow-hidden">
                 <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-[#67BA2E] rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${spendPercentage}%` }}
                 ></div>
               </div>
            </div>

            <div className="mt-4 p-2.5 rounded-xl bg-white/50 border border-emerald-100 flex items-center gap-2">
              <span className="text-[9px] font-bold text-emerald-800 leading-tight">Rate: {formatNaira(0.5)} per 1M tokens combined input/output.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
