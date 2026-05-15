"use client";

import { useEffect, useState } from "react";
import { getAiDashboardStats } from "@/app/actions/ai.actions";
import { Loader2, MessageSquare, Bot, Users, Coins, Sparkles, TrendingUp, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AiHubOverview() {
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
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Syncing Intelligence...</span>
      </div>
    );
  }

  // Mock trend data for SVG Smooth Area Chart (7 days)
  const trendData = [3000, 4500, 3200, 6800, 5100, 8900, 7500];
  const maxVal = Math.max(...trendData) * 1.2;
  const width = 400;
  const height = 150;
  
  // Convert data points to SVG path points
  const points = trendData.map((val, i) => {
    const x = (i / (trendData.length - 1)) * width;
    const y = height - (val / maxVal) * height;
    return { x, y };
  });

  // Generate cubic bezier curve path
  const generateSmoothPath = (pts: {x: number, y: number}[]) => {
    if (pts.length === 0) return "";
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const cp1x = pts[i].x + (pts[i+1].x - pts[i].x) / 2;
      d += ` C ${cp1x},${pts[i].y} ${cp1x},${pts[i+1].y} ${pts[i+1].x},${pts[i+1].y}`;
    }
    return d;
  };

  const linePath = generateSmoothPath(points);
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  return (
    <div className="space-y-4 pb-8">
      
      {/* Ultra-Compact Header */}
      <div className="p-4 rounded-2xl bg-slate-900 relative overflow-hidden shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#67BA2E] opacity-10 blur-[60px] rounded-full pointer-events-none translate-x-1/4 -translate-y-1/4"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                <Sparkles className="size-5 text-[#67BA2E]" />
             </div>
             <div>
                <h1 className="text-lg font-black text-white tracking-tight leading-none">AI Hub Core</h1>
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500">Real-time Neural Metrics</span>
             </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - 2 Column Mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Interactions", value: stats?.totalMessages, icon: MessageSquare, color: "text-indigo-500" },
          { label: "Total Tokens", value: stats?.totalTokens, icon: Coins, color: "text-emerald-500" },
          { label: "Active Users", value: stats?.uniqueUsers, icon: Users, color: "text-blue-500" },
          { label: "Avg Tokens", value: stats?.avgTokensPerMessage, icon: Bot, color: "text-purple-500" }
        ].map((item, i) => (
          <Card 
            key={i} 
            className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-sm rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both"
            style={{ animationDelay: `${(i + 1) * 100}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between p-3 pb-1">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</CardTitle>
              <item.icon className={cn("size-3.5", item.color)} />
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg md:text-2xl font-black tracking-tight text-slate-800">{item.value?.toLocaleString() || 0}</div>
              <div className="flex items-center gap-1 mt-0.5">
                 <ArrowUpRight className="size-2 text-[#67BA2E]" />
                 <span className="text-[8px] font-black text-[#67BA2E] uppercase">Live</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* SVG Smooth Area Chart - Consumption Trend */}
        <Card 
          className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-sm rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both"
          style={{ animationDelay: "500ms" }}
        >
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
              <TrendingUp className="size-3.5 text-[#67BA2E]" /> Consumption Trend (7D)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-40 relative">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#67BA2E" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#67BA2E" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              {[0, 1, 2].map((i) => (
                <line key={i} x1="0" y1={(height / 2) * i} x2={width} y2={(height / 2) * i} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
              ))}
              {/* Area */}
              <path d={areaPath} fill="url(#areaGradient)" className="animate-in fade-in duration-1000" />
              {/* Line */}
              <path d={linePath} fill="none" stroke="#67BA2E" strokeWidth="3" strokeLinecap="round" className="animate-in slide-in-from-left duration-1000" />
              {/* Data Points */}
              {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="4" fill="white" stroke="#67BA2E" strokeWidth="2" className="animate-in zoom-in duration-500 delay-500 fill-mode-both" style={{ animationDelay: `${700 + i * 50}ms` }} />
              ))}
            </svg>
          </CardContent>
        </Card>

        {/* Top Users - Compact List */}
        <Card 
          className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-sm rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both"
          style={{ animationDelay: "600ms" }}
        >
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-800">Power Users</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100/50">
              {stats?.topUsers?.slice(0, 4).map((u: any, idx: number) => (
                <div key={u.userId} className="flex items-center justify-between p-3 active:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8 rounded-xl border border-white shadow-sm">
                      <AvatarFallback className="bg-slate-100 text-slate-600 font-black text-[10px]">
                        {u.user.firstName[0]}{u.user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-slate-800 leading-none mb-0.5">{u.user.firstName} {u.user.lastName}</span>
                      <span className="text-[8px] font-black uppercase tracking-[0.1em] text-slate-400">{u.user.role}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[8px] font-black uppercase bg-emerald-50 text-emerald-600 border-none px-1.5 h-4">
                    {u.tokens.toLocaleString()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
