import * as React from "react"
import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { EditProviderForm } from "./EditProviderForm"

export default async function EditProviderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const provider = await prisma.user.findUnique({
    where: { id },
    include: { providerProfile: true },
  })

  if (!provider || provider.role !== "PROVIDER") {
    return notFound()
  }

  return <EditProviderForm provider={provider} />
}
