import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HealthSync EMR | Secure Healthcare Management",
  description: "Elite HIPAA-compliant EMR SaaS platform",
};

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakartaSans.variable} antialiased font-sans tracking-tight bg-white text-slate-900`}
      >
        <Providers>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </Providers>
        <Toaster 
          position="top-center" 
          expand={false} 
          richColors={false}
          toastOptions={{
            className: "rounded-[1.5rem] border border-slate-200/50 backdrop-blur-2xl bg-white/70 shadow-[0_8px_30px_rgb(0,0,0,0.08)] font-sans text-slate-800 p-4",
            descriptionClassName: "text-slate-500 font-medium"
          }}
        />
      </body>
    </html>
  );
}
