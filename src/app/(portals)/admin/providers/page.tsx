import { Stethoscope } from "lucide-react"
import prisma from "@/lib/prisma"
import { ProviderTable } from "./ProviderTable"
import {
  TABLE_PAGE_SIZE,
  parsePageParam,
  paginationSkip,
} from "@/lib/pagination"
import type { Prisma } from "@prisma/client"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ProvidersPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; page?: string }>
}) {
  const params = await searchParams
  const query = params?.query?.trim() || ""

  const where: Prisma.UserWhereInput = {
    role: "PROVIDER",
    ...(query
      ? {
          OR: [
            { firstName: { contains: query, mode: "insensitive" } },
            { lastName: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            {
              providerProfile: {
                specialty: { contains: query, mode: "insensitive" },
              },
            },
          ],
        }
      : {}),
  }

  const totalItems = await prisma.user.count({ where })
  const totalPages = Math.max(1, Math.ceil(totalItems / TABLE_PAGE_SIZE))
  const currentPage = parsePageParam(params?.page, totalPages)

  const providers = await prisma.user.findMany({
    where,
    include: { providerProfile: true },
    orderBy: { createdAt: "desc" },
    take: TABLE_PAGE_SIZE,
    skip: paginationSkip(currentPage),
  })

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-slate-800">
          <div className="rounded-xl bg-[#67BA2E]/10 p-2">
            <Stethoscope className="size-8 text-[#67BA2E]" />
          </div>
          Providers Directory
        </h1>
        <p className="ml-1 font-medium text-slate-500">
          Manage and verify medical professional credentials across the network.
        </p>
      </div>

      <ProviderTable
        providers={providers}
        totalItems={totalItems}
        currentPage={currentPage}
      />
    </div>
  )
}
