"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, MessageSquare, Activity, Settings, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const sidebarLinks = [
  { name: "Home", href: "/admin/ai-panel", icon: Activity },
  { name: "Train", href: "/admin/ai-panel/train", icon: Settings },
  { name: "Logs", href: "/admin/ai-panel/history", icon: MessageSquare },
  { name: "Tokens", href: "/admin/ai-panel/tokens", icon: Bot },
];

export default function AiHubLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-[calc(100vh-120px)] md:h-[80vh] flex-col md:flex-row gap-0 md:gap-6 max-w-7xl mx-auto w-full overflow-hidden">
      {/* Slim Sidebar (Desktop Only) - SyncMed Theme */}
      <aside className="hidden md:flex w-20 shrink-0 flex-col items-center py-8 bg-slate-900 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#67BA2E] opacity-20 blur-[50px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
        
        <div className="relative z-10 mb-12">
          <div className="size-12 rounded-2xl bg-gradient-to-br from-[#67BA2E] to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sparkles className="size-6 text-white" />
          </div>
        </div>

        <nav className="flex flex-col gap-6 w-full px-4">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Tooltip key={link.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link href={link.href}>
                    <div className={cn(
                      "flex items-center justify-center size-12 rounded-2xl transition-all duration-300 group relative",
                      isActive 
                        ? "bg-[#67BA2E] text-white shadow-lg shadow-emerald-500/20" 
                        : "text-slate-500 hover:bg-slate-800 hover:text-slate-200"
                    )}>
                      <link.icon className={cn("size-6 transition-transform group-hover:scale-110", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent 
                  side="right" 
                  sideOffset={10} 
                  className="bg-slate-900 text-white border-slate-800 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg animate-in fade-in zoom-in-95 duration-200"
                >
                  {link.name}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area (App Shell) */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-8 bg-slate-50 custom-scrollbar rounded-t-[2.5rem] md:rounded-[2.5rem] border border-slate-200/50 shadow-inner">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Native Mobile Bottom Navigation - SyncMed Theme Highlights */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-[999] flex items-center justify-around px-2 pb-safe">
        {sidebarLinks.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin/ai-panel" && pathname.startsWith(item.href))
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className="flex flex-col items-center justify-center flex-1 h-full relative"
            >
              <div className={cn(
                "flex flex-col items-center justify-center transition-all duration-300 active:scale-90",
                isActive ? "text-[#67BA2E]" : "text-slate-400"
              )}>
                <item.icon 
                  className={cn(
                    "size-5 transition-all mb-1",
                    isActive ? "stroke-[2.5px]" : "stroke-[2px]"
                  )} 
                />
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-[0.05em] transition-all",
                  isActive ? "opacity-100" : "opacity-60"
                )}>
                  {item.name}
                </span>
              </div>
              {isActive && (
                <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#67BA2E] rounded-full" />
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  );
}
