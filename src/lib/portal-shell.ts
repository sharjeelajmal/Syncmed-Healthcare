/** Shared width + padding for portal headers and page content (admin, provider, patient). */
export const portalShellClass = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"

export const portalHeaderRowClass =
  "flex h-16 min-w-0 items-center justify-between gap-3 sm:gap-4"

export const portalHeaderBrandClass = "flex min-w-0 flex-1 items-center gap-3 md:gap-6"

export const portalHeaderActionsClass =
  "flex shrink-0 items-center gap-2 sm:gap-3"

/** Fixed bottom nav shows below xl (1280px); main content clearance only. */
export const portalMainBottomPadding = "pb-20 xl:pb-8"

/** Header inline nav shows at xl+ only (mobile + tablet use bottom nav). */
export const portalHeaderNavClass = "hidden min-w-0 items-center gap-1 overflow-x-auto xl:flex"

/** Bottom tab bar hidden at xl+ */
export const portalBottomNavClass =
  "fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 px-6 py-3 pb-safe shadow-[0_-8px_30px_rgb(0,0,0,0.04)] backdrop-blur-lg xl:hidden"

/** Optional desktop-only page tail spacing (no extra padding on mobile/tablet). */
export const portalPageDesktopPadding = "pb-0 xl:pb-6"

