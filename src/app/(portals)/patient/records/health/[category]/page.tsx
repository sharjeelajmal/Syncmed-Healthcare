export const dynamic = "force-dynamic"
export const revalidate = 0

import { redirect, notFound } from "next/navigation"
import { getPatientHealthContext } from "@/lib/get-patient-health-context"
import { HealthCategoryDetail } from "@/components/patient/HealthCategoryDetail"
import { isHealthCategory } from "@/types/patient-health"

export default async function PatientHealthCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params

  if (!isHealthCategory(category)) {
    notFound()
  }

  const ctx = await getPatientHealthContext()
  if (!ctx) {
    redirect("/login")
  }

  return (
    <HealthCategoryDetail category={category} healthData={ctx.healthData} />
  )
}
