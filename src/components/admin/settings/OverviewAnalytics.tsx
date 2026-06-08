"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Calendar, 
  Users, 
  Banknote, 
  Target, 
  Clock, 
  TrendingUp, 
  ShieldCheck, 
  Activity, 
  Cpu, 
  Search,
  Settings,
  Bell,
  Sparkles,
  Zap,
  BarChart3,
  CalendarDays,
  FileText,
  UserPlus,
  MessageCircle,
  ChevronDown
} from "lucide-react"
import { format, subDays } from "date-fns"
import { DISPLAY_DATE_FORMAT } from "@/lib/date-format"
import { getAdminAnalytics } from "@/app/actions/analytics.actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatNaira, formatNairaCompactThousands } from "@/lib/currency"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { PureCalendar } from "@/components/ui/pure-calendar"

export function OverviewAnalytics() {
  const [range, setRange] = React.useState("7days")
  const [startDate, setStartDate] = React.useState<Date | undefined>(subDays(new Date(), 7))
  const [endDate, setEndDate] = React.useState<Date | undefined>(new Date())
  const [data, setData] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  const fetchData = React.useCallback(async (r: string, s?: Date, e?: Date) => {
    setIsLoading(true)
    const res = await getAdminAnalytics(r, s, e)
    if (res.success) {
      setData(res.data)
    }
    setIsLoading(false)
  }, [])

  React.useEffect(() => {
    if (range !== "custom") {
      fetchData(range)
    }
  }, [range, fetchData])

  const handleApply = () => {
    if (startDate && endDate) {
      setRange("custom")
      fetchData("custom", startDate, endDate)
    }
  }

  if (isLoading && !data) {
    return (
      <div className="space-y-8 animate-pulse p-4">
        <div className="h-14 bg-slate-50 rounded-2xl w-full max-w-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-slate-50 rounded-[2.5rem]" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-1 sm:p-2">
      {/* Top Navigation / Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white/40 p-1.5 rounded-[1.5rem] border border-slate-100 shadow-sm w-fit">
        {[
          { id: "today", label: "Today", icon: CalendarDays },
          { id: "7days", label: "7 Days", icon: Calendar },
          { id: "30days", label: "30 Days", icon: Calendar },
          { id: "1year", label: "1 Year", icon: Calendar },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setRange(item.id)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-bold transition-all relative overflow-hidden",
              range === item.id 
                ? "bg-[#67BA2E] text-white shadow-lg shadow-emerald-500/20" 
                : "bg-white text-slate-500 border border-slate-50 hover:bg-slate-50"
            )}
          >
            <item.icon size={14} className={cn(range === item.id ? "text-white" : "text-slate-400")} />
            {item.label}
          </button>
        ))}

        <Popover>
          <PopoverTrigger asChild>
            <button className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-bold transition-all bg-white text-slate-500 border border-slate-50 hover:bg-slate-50",
              range === "custom" && "bg-[#67BA2E] text-white"
            )}>
              <Calendar size={14} />
              {range === "custom" && startDate && endDate 
                ? `${format(startDate, DISPLAY_DATE_FORMAT)} - ${format(endDate, DISPLAY_DATE_FORMAT)}`
                : "Custom Range"
              }
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-full sm:w-auto p-0 rounded-[2rem] border-0 shadow-2xl z-[110]" align="start">
             <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col items-center gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                   <div className="flex flex-col gap-1 items-center sm:items-start">
                      <span className="text-[9px] font-black uppercase text-slate-400">From</span>
                      <PureCalendar selectedDate={startDate} onSelect={setStartDate} />
                   </div>
                   <div className="flex flex-col gap-1 items-center sm:items-start">
                      <span className="text-[9px] font-black uppercase text-slate-400">To</span>
                      <PureCalendar selectedDate={endDate} onSelect={setEndDate} />
                   </div>
                </div>
                <Button onClick={handleApply} className="bg-[#67BA2E] hover:bg-[#5aa329] text-white font-black text-[10px] uppercase h-10 w-full sm:w-auto px-6 rounded-xl">Apply</Button>
             </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Patient Engagement */}
        <MetricCardImageStyle 
          title="Patient Engagement" 
          value={`${data?.users.total}`} 
          subLabel="Total Patient Engagement"
          growth={`+${data?.users.growth}% from last week`}
          icon={Users}
          chartType="wave"
        />

        {/* Appointments */}
        <MetricCardImageStyle 
          title="Appointments" 
          value={data?.appointments.total.toString().padStart(2, '0')} 
          subLabel="Scheduled Appointments"
          subDetail={`${data?.appointments.pending || 0} pending confirmations`}
          icon={Calendar}
          chartType="calendar"
        />

        {/* Net Revenue */}
        <MetricCardImageStyle 
          title="Net Revenue" 
          value={formatNairaCompactThousands(data?.revenue.verified || 0)}
          subLabel="Revenue Overview"
          subDetail={`${formatNaira(data?.revenue.pending || 0)} pending collection`}
          icon={Banknote}
          chartType="bars"
        />

        {/* Conversion Rate */}
        <MetricCardImageStyle 
          title="Conversion Rate" 
          value={`${data?.inquiries.conversion}%`} 
          subLabel="Patient Conversion Rate"
          subDetail="Awaiting active consultations"
          icon={Target}
          chartType="ring"
          percentage={data?.inquiries.conversion || 0}
        />
      </div>

      {/* Middle Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Health Insights (Main Area) */}
        <div className="lg:col-span-2">
           <Card className="rounded-[2.5rem] border-slate-100 bg-white shadow-xl shadow-slate-200/20 overflow-hidden h-full">
              <CardContent className="p-10 relative">
                 <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                       <div className="size-12 rounded-2xl bg-[#67BA2E]/10 flex items-center justify-center text-[#67BA2E]">
                          <Activity size={24} />
                       </div>
                       <div>
                          <h2 className="text-xl font-black text-slate-800 tracking-tight">AI Health Insights</h2>
                          <p className="text-xs font-medium text-slate-500 max-w-xs">Real-time clinical activity monitoring and intelligent diagnostics assistance.</p>
                       </div>
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 text-[#67BA2E] border-[#67BA2E]/20 text-[9px] font-black uppercase px-3 py-1 rounded-full">
                       <div className="size-1.5 rounded-full bg-[#67BA2E] mr-2 animate-pulse" />
                       Live Monitoring
                    </Badge>
                 </div>

                 {/* Center Pulse Visualization */}
                 <div className="flex items-center justify-center py-10 relative">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                       <svg viewBox="0 0 400 100" className="w-full h-24 stroke-[#67BA2E] fill-none stroke-[2]">
                          <motion.path 
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            d="M 0 50 L 50 50 L 60 20 L 70 80 L 80 50 L 130 50 L 140 30 L 150 70 L 160 50 L 210 50 L 220 10 L 230 90 L 240 50 L 290 50 L 300 40 L 310 60 L 320 50 L 400 50" 
                          />
                       </svg>
                    </div>
                    
                    <div className="relative size-32 flex items-center justify-center">
                       <div className="absolute inset-0 rounded-full border border-[#67BA2E]/20 animate-ping" />
                       <div className="absolute inset-2 rounded-full border border-[#67BA2E]/40" />
                       <div className="size-16 rounded-3xl bg-[#67BA2E] shadow-xl shadow-emerald-500/40 flex items-center justify-center text-white relative z-10">
                          <Activity size={32} />
                       </div>
                    </div>
                 </div>

                  {/* Live Metrics Grid */}
                  <div className="mt-8">
                     <p className="text-[10px] font-black text-[#67BA2E] uppercase tracking-[0.2em] mb-4">Live Metrics</p>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                        <LiveMetricItem label="Prompt Requests" value={`${(data?.ai.promptTokens / 1000).toFixed(1)}k`} subLabel="Total requests received" icon={MessageCircle} />
                        <LiveMetricItem label="AI Responses" value={`${(data?.ai.completionTokens / 1000).toFixed(1)}k`} subLabel="Responses generated" icon={Sparkles} />
                        <LiveMetricItem label="Processed Data" value={`${data?.ai.totalAssessments || 0}`} subLabel="Total data processed" icon={LayersIcon} />
                     </div>
                  </div>
              </CardContent>
           </Card>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-6">
           {/* System Status */}
           <SidebarCard 
             title="System Status" 
             subLabel="All systems running smoothly" 
             icon={ShieldCheck} 
             badge="Operational" 
             color="#67BA2E"
           />

           {/* Verification Queue */}
           <Card className="rounded-[2.5rem] border-slate-100 bg-white shadow-xl shadow-slate-200/20 p-8">
              <div className="flex items-center gap-4 mb-6">
                 <div className="size-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[#67BA2E]">
                    <FileText size={20} />
                 </div>
                 <h4 className="text-sm font-black text-slate-800">Verification Queue</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400">Verified Claims</span>
                    <div className="text-2xl font-black text-[#67BA2E]">{formatNaira(data?.revenue.verified || 0)}</div>
                 </div>
                 <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400">Pending Reviews</span>
                    <div className="text-2xl font-black text-[#67BA2E]">{formatNaira(data?.revenue.pending || 0)}</div>
                 </div>
              </div>
           </Card>

           {/* Live Activity */}
           <Card className="rounded-[2.5rem] border-slate-100 bg-white shadow-xl shadow-slate-200/20 p-8">
              <div className="flex items-center gap-4 mb-6">
                 <div className="size-10 rounded-xl bg-[#67BA2E]/10 flex items-center justify-center text-[#67BA2E]">
                    <Activity size={20} />
                 </div>
                 <h4 className="text-sm font-black text-slate-800">Live Activity</h4>
              </div>
              <p className="text-[11px] font-medium text-slate-500 mb-6 leading-relaxed">Real-time patient interaction tracking active</p>
              <div className="flex items-center justify-between">
                 <div className="flex -space-x-2">
                    {data?.activeUsers?.recent?.map((user: any, i: number) => (
                       <div key={user.id || i} className="size-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden flex items-center justify-center">
                          {user.image ? (
                             <img src={user.image} alt="avatar" className="size-full object-cover" />
                          ) : (
                             <span className="text-[10px] font-black text-slate-500 uppercase">{user.firstName?.[0]}{user.lastName?.[0]}</span>
                          )}
                       </div>
                    ))}
                    <div className="size-8 rounded-full border-2 border-white bg-emerald-100 flex items-center justify-center text-[10px] font-black text-[#67BA2E]">+{Math.max(0, (data?.activeUsers?.total || 0) - 3)}</div>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <div className="size-1.5 rounded-full bg-[#67BA2E]" />
                    <span className="text-[9px] font-black uppercase text-[#67BA2E] tracking-widest">Active Now</span>
                 </div>
              </div>
           </Card>
        </div>
      </div>

      {/* Footer Info Bar */}
      <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 flex items-center justify-between group">
         <div className="flex items-center gap-4">
            <div className="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#67BA2E] shadow-sm">
               <ShieldCheck size={20} />
            </div>
            <div className="space-y-0.5">
               <p className="text-xs font-black text-slate-800">Your dashboard is updated in real-time</p>
               <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">All data is secure and HIPAA compliant</p>
            </div>
         </div>
         <div className="size-12 rounded-2xl bg-[#67BA2E] flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 group-hover:scale-110 transition-transform">
            <ShieldCheck size={24} />
         </div>
      </div>
    </div>
  )
}

function MetricCardImageStyle({ title, value, subLabel, growth, subDetail, icon: Icon, chartType, percentage }: any) {
  return (
    <Card className="rounded-[2.5rem] border-slate-100 bg-white shadow-xl shadow-slate-200/20 overflow-hidden relative group h-full">
       <CardContent className="p-8">
          <div className="flex items-center justify-between mb-8">
             <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-800 tracking-tight">{title}</h3>
                <div className="text-4xl font-black text-[#67BA2E] tracking-tighter">{value}</div>
             </div>
             <div className="size-12 rounded-2xl bg-[#67BA2E]/10 flex items-center justify-center text-[#67BA2E]">
                <Icon size={24} />
             </div>
          </div>
          
          <div className="space-y-1">
             <p className="text-[11px] font-bold text-slate-400">{subLabel}</p>
             {growth && (
                <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600">
                   <TrendingUp size={12} />
                   {growth}
                </div>
             )}
             {subDetail && (
                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400">
                   {chartType === 'calendar' ? <Clock size={12} /> : null}
                   {subDetail}
                </div>
             )}
          </div>

          <div className="mt-8 h-20 w-full relative">
             {chartType === 'wave' && <WaveGraphic color="#67BA2E" />}
             {chartType === 'calendar' && <CalendarGraphic />}
             {chartType === 'bars' && <BarsGraphic />}
             {chartType === 'ring' && <RingGraphic percentage={percentage || 0} />}
          </div>
       </CardContent>
    </Card>
  )
}

function SidebarCard({ title, subLabel, icon: Icon, badge, color }: any) {
  return (
    <Card className="rounded-[2.5rem] border-slate-100 bg-white shadow-xl shadow-slate-200/20 p-8 flex items-center justify-between">
       <div className="flex items-center gap-4">
          <div className="size-10 rounded-xl bg-emerald-50 flex items-center justify-center" style={{ color }}>
             <Icon size={20} />
          </div>
          <div>
             <h4 className="text-sm font-black text-slate-800">{title}</h4>
             <p className="text-[10px] font-bold text-slate-400">{subLabel}</p>
          </div>
       </div>
       <Badge variant="outline" className="bg-emerald-50 text-[#67BA2E] border-none text-[9px] font-black uppercase px-3 py-1 rounded-full">
          <div className="size-1.5 rounded-full bg-[#67BA2E] mr-2" />
          {badge}
       </Badge>
    </Card>
  )
}

function LiveMetricItem({ label, value, subLabel, icon: Icon }: any) {
  return (
    <div className="p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] bg-slate-50 border border-slate-100 space-y-2">
       <div className="size-8 sm:size-10 rounded-xl bg-white flex items-center justify-center text-[#67BA2E] shadow-sm mb-2 sm:mb-4">
          <Icon size={18} />
       </div>
       <div className="space-y-0.5">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
          <div className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">{value}</div>
          <p className="text-[9px] font-medium text-slate-400">{subLabel}</p>
       </div>
    </div>
  )
}

function WaveGraphic({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 40" className="w-full h-full">
       <path 
         d="M 0 35 Q 10 30 20 35 T 40 25 T 60 30 T 80 20 T 100 5" 
         fill="none" 
         stroke={color} 
         strokeWidth="2" 
         strokeLinecap="round" 
       />
       <circle cx="100" cy="5" r="3" fill={color} />
    </svg>
  )
}

function CalendarGraphic() {
  return (
    <div className="flex flex-col items-center justify-center h-full opacity-30">
       <div className="grid grid-cols-5 gap-2">
          {[1,2,3,4,5,6,7,8,9,10].map(i => (
             <div key={i} className={cn("size-4 rounded-md", i === 6 || i === 7 ? "bg-[#67BA2E]" : "bg-slate-100")} />
          ))}
       </div>
    </div>
  )
}

function BarsGraphic() {
  return (
    <div className="flex items-end justify-center gap-1.5 h-full opacity-10">
       {[20, 40, 30, 60, 45, 80, 50, 70, 40].map((h, i) => (
          <div key={i} className="w-2 bg-[#67BA2E] rounded-full" style={{ height: `${h}%` }} />
       ))}
    </div>
  )
}

function RingGraphic({ percentage }: { percentage: number }) {
  return (
    <div className="flex items-center justify-center h-full">
       <div className="relative size-16">
          <svg viewBox="0 0 36 36" className="size-full">
             <circle cx="18" cy="18" r="16" fill="none" stroke="#f1f5f9" strokeWidth="4" />
             <circle cx="18" cy="18" r="16" fill="none" stroke="#67BA2E" strokeWidth="4" strokeDasharray={`${percentage} 100`} strokeLinecap="round" transform="rotate(-90 18 18)" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-[#67BA2E]">{percentage}%</div>
       </div>
    </div>
  )
}

function LayersIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m2.2 17.6 8.53 3.9a2 2 0 0 0 1.53 0l8.54-3.9" />
      <path d="m2.2 12.6 8.53 3.9a2 2 0 0 0 1.53 0l8.54-3.9" />
    </svg>
  )
}
