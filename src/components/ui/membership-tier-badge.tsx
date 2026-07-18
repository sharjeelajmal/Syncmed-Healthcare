import { Crown, Gem, Medal } from "lucide-react"
import { cn } from "@/lib/utils"

export type MembershipTier = "SILVER" | "GOLD" | "PLATINUM"

const TIER_STYLES: Record<
  MembershipTier,
  { container: string; icon: typeof Crown; label: string }
> = {
  SILVER: {
    container:
      "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-600 border-slate-300/80 shadow-slate-200/50",
    icon: Medal,
    label: "Silver",
  },
  GOLD: {
    container:
      "bg-gradient-to-r from-amber-100 to-yellow-200 text-amber-700 border-amber-300/80 shadow-amber-200/50",
    icon: Crown,
    label: "Gold",
  },
  PLATINUM: {
    container:
      "bg-gradient-to-r from-slate-800 to-slate-950 text-slate-100 border-slate-700 shadow-slate-400/30",
    icon: Gem,
    label: "Platinum",
  },
}

interface MembershipTierBadgeProps {
  tier: string | null | undefined
  size?: "sm" | "md"
  className?: string
}

/** Reusable membership tier badge (Silver / Gold / Platinum) for patient charts and profiles. */
export function MembershipTierBadge({
  tier,
  size = "md",
  className,
}: MembershipTierBadgeProps) {
  const normalized = (tier ?? "SILVER").toUpperCase() as MembershipTier
  const config = TIER_STYLES[normalized] ?? TIER_STYLES.SILVER
  const Icon = config.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-black uppercase tracking-widest shadow-sm",
        size === "sm" ? "px-2.5 py-0.5 text-[9px]" : "px-3 py-1 text-[10px]",
        config.container,
        className
      )}
    >
      <Icon className={size === "sm" ? "size-3" : "size-3.5"} />
      {config.label} Member
    </span>
  )
}
