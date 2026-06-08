import prisma from "@/lib/prisma"

/** Resolve a provider by User id or ProviderProfile id (prevents false 404s). */
export async function resolveProviderUser(id: string) {
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

  if (!isUuid) {
    return null
  }

  return prisma.user.findFirst({
    where: {
      role: "PROVIDER",
      OR: [{ id }, { providerProfile: { id } }],
    },
    include: {
      providerProfile: {
        select: {
          id: true,
          providerType: true,
          specialty: true,
          licenseNumber: true,
          consultationFee: true,
        },
      },
    },
  })
}
