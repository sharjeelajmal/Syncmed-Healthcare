import * as React from "react"
import { Settings2 } from "lucide-react"
import { auth } from "@/../auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { SettingsContent } from "./SettingsContent"

export default async function SystemSettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user) redirect("/login")

  return (
    <div className="animate-slide-up space-y-8 pb-20 md:pb-10">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xl md:text-3xl font-black tracking-tight text-slate-800 flex items-center gap-3">
          <div className="p-2 bg-[#67BA2E]/10 rounded-xl">
             <Settings2 className="size-6 md:size-8 text-[#67BA2E]" />
          </div>
          System Settings
        </h2>
        <p className="text-slate-500 font-medium ml-1 text-xs md:text-sm tracking-[0.015em]">Manage your administrative account and system preferences.</p>
      </div>

      <SettingsContent user={JSON.parse(JSON.stringify(user))} />
    </div>
  )
}
