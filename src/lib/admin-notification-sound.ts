export function playAdminNotificationSound() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!AudioCtx) return

    const ctx = new AudioCtx()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()

    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.frequency.value = 880
    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35)
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.35)
    oscillator.onended = () => void ctx.close()
  } catch {
    // Autoplay policies may block sound until user gesture
  }
}
