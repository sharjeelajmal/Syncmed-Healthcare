import prisma from "@/lib/prisma"
import { LeadsTable } from "./LeadsTable"
import { Mail, Sparkles } from "lucide-react"
import {
  TABLE_PAGE_SIZE,
  parsePageParam,
  paginationSkip,
} from "@/lib/pagination"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams

  const totalItems = await prisma.lead.count()
  const totalPages = Math.max(1, Math.ceil(totalItems / TABLE_PAGE_SIZE))
  const currentPage = parsePageParam(params?.page, totalPages)

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: TABLE_PAGE_SIZE,
    skip: paginationSkip(currentPage),
  })

  return (
    <div className="animate-in fade-in duration-300 space-y-8">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center">
        <div className="space-y-1">
          <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-slate-800">
            <div className="rounded-xl bg-[#67BA2E]/10 p-2 text-[#67BA2E]">
              <Mail className="size-6" />
            </div>
            Leads & Inquiries
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Manage public consultation requests, general inquiries, and patient
            registrations.
          </p>
        </div>

        <div className="flex w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-xs">
          <div className="rounded-lg bg-emerald-50 p-1 text-[#67BA2E]">
            <Sparkles size={14} />
          </div>
          <span className="text-xs font-bold text-slate-600">
            Total Leads:{" "}
            <span className="font-black text-[#67BA2E]">{totalItems}</span>
          </span>
        </div>
      </div>

      <LeadsTable leads={leads} totalItems={totalItems} currentPage={currentPage} />
    </div>
  )
}
