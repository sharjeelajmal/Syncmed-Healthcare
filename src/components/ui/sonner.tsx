"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      closeButton={true}
      icons={{
        success: (
          <div className="flex items-center justify-center size-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-[#67BA2E] shrink-0">
            <CircleCheckIcon className="size-5 stroke-[2.2]" />
          </div>
        ),
        info: (
          <div className="flex items-center justify-center size-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-sky-500 dark:text-sky-400 shrink-0">
            <InfoIcon className="size-5 stroke-[2.2]" />
          </div>
        ),
        warning: (
          <div className="flex items-center justify-center size-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-amber-500 dark:text-amber-400 shrink-0">
            <TriangleAlertIcon className="size-5 stroke-[2.2]" />
          </div>
        ),
        error: (
          <div className="flex items-center justify-center size-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-red-500 dark:text-red-400 shrink-0">
            <OctagonXIcon className="size-5 stroke-[2.2]" />
          </div>
        ),
        loading: (
          <div className="flex items-center justify-center size-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-[#67BA2E] shrink-0">
            <Loader2Icon className="size-5 stroke-[2.2] animate-spin" />
          </div>
        ),
      }}
      style={
        {
          "--normal-bg": "transparent",
          "--normal-text": "var(--foreground)",
          "--normal-border": "transparent",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-white group-[.toaster]:dark:bg-slate-950 group-[.toaster]:text-slate-900 group-[.toaster]:dark:text-slate-100 group-[.toaster]:border group-[.toaster]:border-slate-200/80 group-[.toaster]:dark:border-slate-800/80 group-[.toaster]:shadow-[0_12px_40px_-6px_rgba(0,0,0,0.06),_0_6px_16px_-4px_rgba(0,0,0,0.03)] group-[.toaster]:rounded-2xl group-[.toaster]:p-4 group-[.toaster]:pr-12 group-[.toaster]:flex group-[.toaster]:items-center group-[.toaster]:gap-4 group-[.toaster]:font-sans group-[.toaster]:transition-all group-[.toaster]:duration-300 group-[.toaster]:relative group-[.toaster]:overflow-hidden",
          title: "group-[.toast]:font-semibold group-[.toast]:text-[15px] group-[.toast]:tracking-tight group-[.toast]:text-slate-900 group-[.toast]:dark:text-slate-50",
          description: "group-[.toast]:text-slate-500 group-[.toast]:dark:text-slate-400 group-[.toast]:text-[13px] group-[.toast]:font-medium group-[.toast]:mt-0.5",
          actionButton: "group-[.toast]:bg-[#67BA2E] group-[.toast]:text-white group-[.toast]:font-semibold group-[.toast]:text-xs group-[.toast]:rounded-xl group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:hover:bg-[#67BA2E]/90 group-[.toast]:transition-all",
          cancelButton: "group-[.toast]:bg-slate-100 group-[.toast]:dark:bg-slate-800 group-[.toast]:text-slate-600 group-[.toast]:dark:text-slate-300 group-[.toast]:font-medium group-[.toast]:text-xs group-[.toast]:rounded-xl group-[.toast]:px-3 group-[.toast]:py-1.5",
          closeButton: "group-[.toast]:bg-transparent group-[.toast]:text-slate-400 group-[.toast]:dark:text-slate-500 group-[.toast]:hover:text-slate-600 group-[.toast]:dark:hover:text-slate-300 group-[.toast]:border-0 group-[.toast]:right-4 group-[.toast]:top-1/2 group-[.toast]:-translate-y-1/2 group-[.toast]:transition-colors",
          
          // Custom Left Glow Gradients matching the mockup and maintaining theme color (#67BA2E)
          success: "bg-[image:linear-gradient(to_right,rgba(103,186,46,0.14),transparent_120px)] dark:bg-[image:linear-gradient(to_right,rgba(103,186,46,0.22),transparent_120px)]",
          error: "bg-[image:linear-gradient(to_right,rgba(239,68,68,0.14),transparent_120px)] dark:bg-[image:linear-gradient(to_right,rgba(239,68,68,0.22),transparent_120px)]",
          warning: "bg-[image:linear-gradient(to_right,rgba(245,158,11,0.14),transparent_120px)] dark:bg-[image:linear-gradient(to_right,rgba(245,158,11,0.22),transparent_120px)]",
          info: "bg-[image:linear-gradient(to_right,rgba(59,130,246,0.14),transparent_120px)] dark:bg-[image:linear-gradient(to_right,rgba(59,130,246,0.22),transparent_120px)]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
