"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { openPatientChat } from "@/lib/patient-chat"

export default function PatientMessagesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const providerUserId = searchParams.get("providerUserId")
    if (providerUserId) {
      openPatientChat(providerUserId)
    }

    router.replace("/patient/dashboard")
  }, [router, searchParams])

  return null
}
