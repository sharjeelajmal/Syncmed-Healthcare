import { Activity } from "lucide-react"
import { cn } from "@/lib/utils"

export function PortalLoading({
  message = "Syncing Repository...",
  className,
}: {
  message?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative flex min-h-[min(70vh,520px)] w-full items-center justify-center",
        className
      )}
    >
      <div className="flex flex-col items-center justify-center rounded-2xl bg-white/80 px-8 py-12 backdrop-blur-sm">
        <Activity className="mb-4 size-12 animate-spin text-[#67BA2E]" />
        <p className="animate-pulse text-[10px] font-black uppercase tracking-widest text-slate-400">
          {message}
        </p>
      </div>
    </div>
  )
}
