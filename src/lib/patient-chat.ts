export const PATIENT_CHAT_OPEN_EVENT = "patient-chat-open"

export function openPatientChat(providerUserId: string) {
  if (typeof window === "undefined") return

  localStorage.setItem("chat_isOpen", "true")
  localStorage.setItem("chat_selectedPatientId", providerUserId)
  window.dispatchEvent(
    new CustomEvent(PATIENT_CHAT_OPEN_EVENT, {
      detail: { providerUserId },
    })
  )
}
