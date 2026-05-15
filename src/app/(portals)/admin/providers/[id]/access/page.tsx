import * as React from "react"
import { notFound } from "next/navigation"
import { ArrowLeft, Shield } from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { ManageAccessForm } from "./ManageAccessForm"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ManageAccessPage({ params }: PageProps) {
  const { id } = await params

  const provider = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      isActive: true,
      role: true,
      firstName: true,
      lastName: true
    }
  })

  if (!provider || provider.role !== "PROVIDER") {
    notFound()
  }

  return (
    <div className="animate-slide-up pb-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/admin/providers/${id}`}>
          <Button variant="ghost" className="size-10 p-0 rounded-full hover:bg-slate-100 transition-all">
            <ArrowLeft className="size-5 text-slate-500" />
          </Button>
        </Link>
        <div className="flex flex-col">
          <h1 className="text-3xl font-black tracking-tight text-slate-800 flex items-center gap-3">
             Manage Access
          </h1>
          <p className="text-slate-500 font-medium">Security credentials and platform authorization for Dr. {provider.firstName} {provider.lastName}.</p>
        </div>
      </div>

      <ManageAccessForm userId={provider.id} initialIsActive={provider.isActive} />
    </div>
  )
}
