/** Pro-level ambient shapes — mesh, rings, blobs, grid, subtle motion */
export function PortalShellDecor() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Base mesh wash */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-12%,rgba(16,185,129,0.18),transparent_62%),radial-gradient(ellipse_55%_48%_at_100%_30%,rgba(20,184,166,0.14),transparent_58%),radial-gradient(ellipse_55%_48%_at_0%_70%,rgba(52,211,153,0.16),transparent_58%),radial-gradient(ellipse_50%_42%_at_50%_105%,rgba(167,243,208,0.12),transparent_55%)]" />

      {/* Fine dot grid */}
      <div className="absolute inset-0 opacity-[0.35] bg-[radial-gradient(rgba(103,186,46,0.35)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_90%_80%_at_50%_50%,black_20%,transparent_75%)]" />

      {/* Diagonal line texture */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(125deg, rgba(16,185,129,0.8) 0px, rgba(16,185,129,0.8) 1px, transparent 1px, transparent 48px)",
        }}
      />

      {/* ── Large ambient orbs ── */}
      <div className="absolute -left-32 -top-32 size-[28rem] rounded-full bg-emerald-300/25 blur-3xl portal-shape-drift" />
      <div className="absolute -right-24 top-[10%] size-96 rounded-full bg-teal-300/20 blur-[96px] portal-shape-drift-reverse" />
      <div className="absolute -bottom-40 left-1/2 size-[32rem] -translate-x-1/2 rounded-full bg-green-200/22 blur-3xl portal-shape-drift" />
      <div className="absolute -left-20 bottom-[6%] size-72 rounded-full bg-emerald-200/24 blur-2xl" />
      <div className="absolute -right-16 top-[55%] size-80 rounded-full bg-teal-200/20 blur-3xl portal-shape-drift-reverse" />
      <div className="absolute left-[35%] top-[22%] size-56 rounded-full bg-[#67BA2E]/10 blur-[72px] portal-shape-pulse" />

      {/* ── Hero ring system (center depth) ── */}
      <div className="absolute left-1/2 top-[38%] size-[42rem] -translate-x-1/2 -translate-y-1/2 portal-shape-orbit">
        <div className="absolute inset-0 rounded-full border border-emerald-300/25" />
        <div className="absolute inset-8 rounded-full border border-dashed border-teal-200/30" />
        <div className="absolute inset-16 rounded-full border border-emerald-200/20" />
      </div>

      {/* ── Corner rings ── */}
      <div className="absolute -left-16 top-[12%] size-56 rounded-full border-2 border-emerald-200/35 bg-gradient-to-br from-white/20 to-emerald-50/10 backdrop-blur-[1px] portal-shape-drift" />
      <div className="absolute -right-10 top-[28%] size-44 rounded-full border border-teal-300/30 bg-white/10 portal-shape-drift-reverse" />
      <div className="absolute -right-20 bottom-[10%] size-64 rounded-full border-2 border-dashed border-emerald-200/40" />
      <div className="absolute -left-12 bottom-[22%] size-40 rounded-full border border-teal-200/35" />

      {/* ── Geometric glass tiles ── */}
      <div className="absolute left-[6%] top-[16%] portal-shape-drift">
        <div className="size-36 rotate-12 rounded-[2rem] border border-emerald-200/40 bg-gradient-to-br from-white/30 via-emerald-50/20 to-transparent shadow-[0_8px_32px_rgba(103,186,46,0.06)] backdrop-blur-[2px]" />
      </div>
      <div className="absolute right-[5%] top-[14%] portal-shape-drift-reverse">
        <div className="size-28 -rotate-6 rounded-3xl border border-teal-200/35 bg-white/15 backdrop-blur-[2px]" />
      </div>
      <div className="absolute right-[8%] bottom-[20%]">
        <div className="size-32 rotate-[18deg] rounded-[1.75rem] border border-emerald-300/30 bg-gradient-to-tr from-emerald-50/25 to-transparent backdrop-blur-[2px]" />
      </div>
      <div className="absolute left-[4%] bottom-[28%] portal-shape-drift">
        <div className="size-24 -rotate-12 rounded-2xl border border-teal-200/30 bg-white/20 backdrop-blur-[2px]" />
      </div>

      {/* ── Floating pills & caps ── */}
      <div className="absolute left-[18%] top-[8%] h-3 w-20 rounded-full bg-gradient-to-r from-emerald-200/50 to-teal-100/30 blur-[0.5px] portal-shape-drift-reverse" />
      <div className="absolute right-[22%] top-[6%] h-2 w-14 rounded-full bg-teal-200/40 portal-shape-drift" />
      <div className="absolute left-[12%] top-[72%] h-2.5 w-16 rounded-full bg-emerald-300/35 portal-shape-drift" />
      <div className="absolute right-[14%] top-[68%] h-3 w-24 rounded-full bg-gradient-to-r from-teal-100/50 to-emerald-200/40 portal-shape-drift-reverse" />

      {/* ── Arc strokes (SVG) ── */}
      <svg
        className="absolute left-[2%] top-[32%] size-48 text-emerald-300/40 portal-shape-drift"
        viewBox="0 0 200 200"
        fill="none"
      >
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="6 10"
        />
        <path
          d="M 40 100 A 60 60 0 0 1 160 100"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.6"
        />
      </svg>

      <svg
        className="absolute right-[3%] top-[42%] size-56 text-teal-300/35 portal-shape-drift-reverse"
        viewBox="0 0 220 220"
        fill="none"
      >
        <circle cx="110" cy="110" r="90" stroke="currentColor" strokeWidth="1" strokeDasharray="4 12" />
        <circle cx="110" cy="110" r="70" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.7" />
        <circle cx="110" cy="110" r="50" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
      </svg>

      {/* ── Organic blobs (SVG) ── */}
      <svg
        className="absolute -right-8 bottom-[5%] h-72 w-72 text-emerald-200/30 portal-shape-drift"
        viewBox="0 0 400 400"
        fill="currentColor"
      >
        <path d="M220,45 C290,20 360,80 350,160 C340,240 260,290 180,270 C100,250 40,180 60,110 C80,40 150,70 220,45 Z" />
      </svg>

      <svg
        className="absolute -left-6 top-[48%] h-64 w-64 text-teal-200/25 portal-shape-drift-reverse"
        viewBox="0 0 400 400"
        fill="currentColor"
      >
        <path d="M180,60 C250,30 330,90 320,170 C310,250 230,310 150,290 C70,270 20,200 50,130 C80,60 110,90 180,60 Z" />
      </svg>

      {/* ── Plus / cross accents (medical hint) ── */}
      <div className="absolute right-[11%] top-[24%] size-16 portal-shape-pulse">
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-emerald-300/50 to-transparent" />
        <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-gradient-to-r from-transparent via-emerald-300/50 to-transparent" />
        <div className="absolute inset-3 rounded-full border border-emerald-200/30" />
      </div>

      <div className="absolute left-[9%] top-[58%] size-12 portal-shape-drift">
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-teal-300/40" />
        <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-teal-300/40" />
      </div>

      {/* ── Small scattered dots ── */}
      <div className="absolute left-[28%] top-[18%] size-2 rounded-full bg-[#67BA2E]/30 portal-shape-pulse" />
      <div className="absolute right-[30%] top-[32%] size-1.5 rounded-full bg-teal-400/35" />
      <div className="absolute left-[42%] bottom-[15%] size-2 rounded-full bg-emerald-400/30 portal-shape-pulse" />
      <div className="absolute right-[38%] bottom-[22%] size-1.5 rounded-full bg-[#67BA2E]/25" />

      {/* ── Bottom wave line ── */}
      <svg
        className="absolute bottom-0 left-0 w-full text-emerald-200/25"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M0,80 C240,20 480,100 720,60 C960,20 1200,90 1440,50 L1440,120 L0,120 Z"
          fill="currentColor"
          fillOpacity="0.15"
        />
        <path
          d="M0,95 C360,55 720,110 1440,70"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeOpacity="0.35"
        />
      </svg>

      {/* Accent glows */}
      <div className="absolute right-[10%] top-[12%] size-32 rounded-full bg-emerald-200/30 blur-2xl portal-shape-pulse" />
      <div className="absolute left-[4%] top-[50%] size-24 rounded-full bg-teal-100/35 blur-xl" />
    </div>
  )
}
