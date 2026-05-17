import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Script from "next/script"; // <-- 1. Script import kiya

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

// 2. Yahan manifest ka link add kiya
export const metadata: Metadata = {
  title: "HealthSync EMR | Secure Healthcare Management",
  description: "Elite HIPAA-compliant EMR SaaS platform",
  manifest: "/manifest.json", 
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
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          window.deferredPrompt = null;
          window.addEventListener('beforeinstallprompt', function(e) {
            e.preventDefault();
            window.deferredPrompt = e;
            window.dispatchEvent(new CustomEvent('pwa-prompt-available', { detail: e }));
          });
        `}} />
      </head>
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

        {/* 3. Service Worker Registration taake Chrome PWA pass kar de */}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) {
                    console.log('Service Worker registration successful');
                  },
                  function(err) {
                    console.log('Service Worker registration failed: ', err);
                  }
                );
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}