import { cache } from "react"
import type { Session } from "next-auth"
import prisma from "@/lib/prisma"
import { layoutUserFromSession, type LayoutUser } from "@/lib/session-user"

/** Fresh profile image + name for admin header (single lightweight DB read per request). */
export const getAdminLayoutUser = cache(
  async (userId: string, session: Session): Promise<LayoutUser> => {
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
        image: true,
        role: true,
      },
    })

    if (!dbUser) {
      return layoutUserFromSession(session)
    }

    return {
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      image: dbUser.image,
      role: dbUser.role,
    }
  }
)
