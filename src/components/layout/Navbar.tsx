"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Home, 
  Activity, 
  Crown, 
  HelpCircle, 
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";

// --- Helpers ---
const scrollTo = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

export const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";

  const handleNavClick = (id: string) => {
    if (isHome) {
      if (id === "top") {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        scrollTo(id);
      }
    } else {
      router.push(`/#${id}`);
    }
  };

  return (
    <>
      {/* Top Navbar (Hidden on max-[900px]) */}
      <nav className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-lg border-b border-slate-100 max-[900px]:hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center cursor-pointer" 
              onClick={() => isHome ? handleNavClick("top") : router.push("/")}
            >
              <img src="/logo.png" alt="SyncMed" className="h-12 w-auto" />
            </motion.div>

            {/* Desktop Navigation */}
            <div className="flex items-center gap-1">
              {[
                { name: "Home", id: "top", href: "/" },
                { name: "Services", id: "services", href: "/services" },
                { name: "Consultation", id: "consultation", href: "/request-consultation" },
                { name: "Blog", id: "blog", href: "/blog" }
              ].map((item, i) => {
                const isActive = pathname === item.href || (item.href === "/" && pathname === "/");
                
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative px-5 py-2"
                  >
                    <button 
                      onClick={() => item.href ? router.push(item.href) : handleNavClick(item.id)}
                      className={`text-xs font-bold transition-all tracking-widest uppercase cursor-pointer relative z-10 ${
                        isActive ? "text-[#67BA2E]" : "text-slate-600 hover:text-[#67BA2E]"
                      }`}
                    >
                      {item.name}
                    </button>
                    
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-[#67BA2E]/5 rounded-full z-0"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    
                    {isActive && (
                      <motion.div
                        layoutId="nav-dot"
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#67BA2E] rounded-full"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </motion.div>
                );
              })}
              <div className="ml-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button 
                    onClick={() => window.location.href = "/login"}
                    className="bg-[#67BA2E] hover:bg-[#5aa329] hover:shadow-lg hover:shadow-[#67BA2E]/40 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 text-white px-6 py-2 rounded-full font-bold text-xs uppercase"
                  >
                    Portal Login
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      {/* Fixed Bottom Navigation (Visible on max-[900px]) */}
      <div className="hidden max-[900px]:flex fixed bottom-0 left-0 right-0 z-[999] bg-white/90 backdrop-blur-xl border-t border-slate-200 justify-around p-3 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        {[
          { name: "Home", icon: Home, href: "/", id: "top" },
          { name: "Services", icon: Briefcase, href: "/services", id: "services" },
          { name: "Blog", icon: Activity, href: "/blog", id: "blog" },
          { name: "Consult", icon: Crown, href: "/request-consultation", id: "consultation" }
        ].map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <button 
              key={item.name}
              onClick={() => router.push(item.href)} 
              className={`flex flex-col items-center gap-1 transition-all w-14 relative ${isActive ? 'text-[#67BA2E]' : 'text-slate-400 hover:text-[#67BA2E]'}`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-[10px] font-black uppercase tracking-tighter">{item.name}</span>
              {isActive && (
                <motion.div 
                  layoutId="bottom-nav-dot"
                  className="absolute -bottom-1 w-1 h-1 bg-[#67BA2E] rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Mobile Top Header (Visible on max-[900px]) */}
      <div className="hidden max-[900px]:flex fixed top-0 left-0 right-0 z-[999] items-center justify-between px-4 h-14 bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-sm">
        <div className="flex-shrink-0">
          <img 
            src="/logo.png" 
            alt="SyncMed" 
            className="h-8 w-auto cursor-pointer" 
            onClick={() => router.push("/")} 
          />
        </div>
          <Button 
            onClick={() => window.location.href = "/login"}
            size="sm"
            className="bg-[#67BA2E] hover:bg-[#5aa329] text-white px-3 py-1 rounded-full font-bold text-[9px] uppercase h-7 flex-shrink-0 shadow-lg shadow-[#67BA2E]/20 transition-all duration-300 active:scale-95"
          >
            Portal Login
          </Button>
      </div>
    </>
  );
};
