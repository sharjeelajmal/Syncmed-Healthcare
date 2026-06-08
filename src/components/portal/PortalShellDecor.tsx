/** Light green shapes — balanced left & right, top to bottom */
export function PortalShellDecor() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {/* Soft dot texture */}
      <div className="absolute inset-0 opacity-[0.28] bg-[radial-gradient(rgba(167,243,208,0.55)_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* ── LEFT SIDE blobs ── */}
      <div className="absolute -left-20 top-[6%] size-72 rounded-full bg-emerald-100/70 blur-3xl" />
      <div className="absolute -left-16 top-[38%] size-56 rounded-full bg-green-50/80 blur-2xl" />
      <div className="absolute -left-24 bottom-[8%] size-80 rounded-full bg-teal-50/75 blur-3xl" />

      {/* ── RIGHT SIDE blobs ── */}
      <div className="absolute -right-20 top-[10%] size-80 rounded-full bg-emerald-50/80 blur-3xl" />
      <div className="absolute -right-14 top-[48%] size-64 rounded-full bg-green-100/60 blur-2xl" />
      <div className="absolute -right-24 bottom-[12%] size-72 rounded-full bg-teal-100/55 blur-3xl" />

      {/* ── TOP center wash ── */}
      <div className="absolute -top-28 left-1/2 size-96 -translate-x-1/2 rounded-full bg-emerald-50/50 blur-3xl" />

      {/* ── BOTTOM center wash ── */}
      <div className="absolute -bottom-24 left-1/2 size-80 -translate-x-1/2 rounded-full bg-green-50/45 blur-3xl" />

      {/* ── LEFT rings / shapes ── */}
      <div className="absolute left-[2%] top-[14%] size-44 rounded-full border border-emerald-200/40 bg-white/25" />
      <div className="absolute left-[5%] top-[62%] size-32 rotate-6 rounded-3xl border border-green-200/35 bg-emerald-50/30" />
      <div className="absolute -left-6 bottom-[28%] size-52 rounded-full border border-teal-100/50" />

      {/* ── RIGHT rings / shapes ── */}
      <div className="absolute right-[3%] top-[20%] size-40 rounded-full border border-emerald-200/40 bg-white/20" />
      <div className="absolute right-[4%] top-[55%] size-28 -rotate-12 rounded-2xl border border-green-200/35 bg-green-50/35" />
      <div className="absolute -right-4 bottom-[32%] size-48 rounded-full border border-teal-100/45" />

      {/* ── Mid-page accent (very subtle) ── */}
      <div className="absolute left-[18%] top-[78%] size-20 rounded-full bg-emerald-50/50 blur-xl" />
      <div className="absolute right-[16%] top-[82%] size-24 rounded-full bg-green-50/45 blur-xl" />
    </div>
  )
}
