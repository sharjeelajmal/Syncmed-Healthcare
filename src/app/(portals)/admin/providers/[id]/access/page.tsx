import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { resolveProviderUser } from "@/lib/resolve-provider-user"
import { ManageAccessForm } from "./ManageAccessForm"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ManageAccessPage({ params }: PageProps) {
  const { id } = await params
  const provider = await resolveProviderUser(id)

  if (!provider || !provider.providerProfile) {
    notFound()
  }

  const accessSnapshot = {
    userId: provider.id,
    firstName: provider.firstName,
    lastName: provider.lastName,
    email: provider.email,
    isActive: provider.isActive,
    mfaEnabled: provider.mfaEnabled,
    lastActive: provider.lastActive.toISOString(),
    createdAt: provider.createdAt.toISOString(),
    updatedAt: provider.updatedAt.toISOString(),
    specialty: provider.providerProfile.specialty,
    licenseNumber: provider.providerProfile.licenseNumber,
  }

  return (
    <div className="animate-in fade-in duration-300 pb-10">
      <div className="mb-8 flex items-center gap-4">
        <Link href={`/admin/providers/${provider.id}`}>
          <Button
            variant="ghost"
            className="size-10 rounded-full p-0 transition-all hover:bg-slate-100"
          >
            <ArrowLeft className="size-5 text-slate-500" />
          </Button>
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-slate-800">
            <div className="rounded-xl bg-[#67BA2E]/10 p-2">
              <Shield className="size-7 text-[#67BA2E]" />
            </div>
            Manage Access
          </h1>
          <p className="font-medium text-slate-500">
            Security credentials and platform authorization for Dr.{" "}
            {provider.firstName} {provider.lastName}.
          </p>
        </div>
      </div>

      <ManageAccessForm initialData={accessSnapshot} />
    </div>
  )
}
