import * as React from "react"
import { Stethoscope } from "lucide-react"
import prisma from "@/lib/prisma"
import { ProviderTable } from "./ProviderTable"

export const dynamic = "force-dynamic"

export default async function ProvidersPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>
}) {
  const params = await searchParams
  const query = params?.query || ""

  const providers = await prisma.user.findMany({
    where: {
      role: "PROVIDER",
      OR: [
        { firstName: { contains: query, mode: "insensitive" } },
        { lastName: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { providerProfile: { specialty: { contains: query, mode: "insensitive" } } },
      ],
    },
    include: {
      providerProfile: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="animate-slide-up pb-10">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-800 flex items-center gap-3">
          <div className="p-2 bg-[#67BA2E]/10 rounded-xl">
             <Stethoscope className="size-8 text-[#67BA2E]" />
          </div>
          Providers Directory
        </h1>
        <p className="text-slate-500 font-medium ml-1">Manage and verify medical professional credentials across the network.</p>
      </div>

      <ProviderTable providers={providers} />
    </div>
  )
}
