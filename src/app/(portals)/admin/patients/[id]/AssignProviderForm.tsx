"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2, UserRound, X } from "lucide-react"
import { toast } from "sonner"
import { useTransition } from "react"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { assignProviderAction, removeProviderAction } from "@/app/actions/patient.actions"

interface Provider {
  id: string
  name: string
  providerType: string
}

interface AssignProviderFormProps {
  patientId: string
  careTeamProviderIds: string[]
  providers: Provider[]
  isReadOnly?: boolean
}

export default function AssignProviderForm({
  patientId,
  careTeamProviderIds,
  providers,
  isReadOnly,
}: AssignProviderFormProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [selectedProvider, setSelectedProvider] = React.useState("")
  const [isPending, startTransition] = useTransition()

  const careTeam = providers.filter((p) => careTeamProviderIds.includes(p.id))
  const availableProviders = providers.filter((p) => !careTeamProviderIds.includes(p.id))

  const handleSave = () => {
    if (isReadOnly) return
    if (!selectedProvider) {
      toast.error("Please select a provider to add.")
      return
    }

    startTransition(async () => {
      const res = await assignProviderAction(patientId, selectedProvider)
      if (res.success) {
        toast.success("Provider added to care team.")
        setSelectedProvider("")
        router.refresh()
      } else {
        toast.error(res.error || "Failed to assign provider.")
      }
    })
  }

  const handleRemove = (providerId: string) => {
    if (isReadOnly) return

    startTransition(async () => {
      const res = await removeProviderAction(patientId, providerId)
      if (res.success) {
        toast.success("Provider removed from care team.")
        router.refresh()
      } else {
        toast.error(res.error || "Failed to remove provider.")
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
          Care Team
        </label>
        {careTeam.length === 0 ? (
          <p className="text-sm font-medium text-slate-400 ml-1">No providers assigned yet.</p>
        ) : (
          <ul className="space-y-2">
            {careTeam.map((provider) => (
              <li
                key={provider.id}
                className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/40 px-4 py-3"
              >
                <div className="size-9 shrink-0 rounded-xl bg-[#67BA2E] text-white flex items-center justify-center text-xs font-black">
                  {provider.providerType === "REGISTERED_NURSE" ? "RN" : "DR"}
                </div>
                <span className="flex-1 truncate text-sm font-bold text-slate-700">{provider.name}</span>
                {!isReadOnly && (
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isPending}
                    onClick={() => handleRemove(provider.id)}
                    aria-label={`Remove ${provider.name}`}
                    className="size-8 shrink-0 text-slate-400 hover:text-red-500 hover:bg-red-50"
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {!isReadOnly && (
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
          Add Provider
        </label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              disabled={isReadOnly}
              className={cn(
                "flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#67BA2E]/20 font-bold text-slate-700",
                isReadOnly && "bg-slate-50 border-slate-100 cursor-not-allowed opacity-80"
              )}
            >
              <div className="flex items-center gap-2 truncate">
                <UserRound className="size-4 text-[#67BA2E] shrink-0" />
                <span className="truncate">
                  {selectedProvider
                    ? providers.find((p) => p.id === selectedProvider)?.name
                    : "Add a Doctor or Nurse..."}
                </span>
              </div>
              {!isReadOnly && <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
            </Button>
          </PopoverTrigger>
          {!isReadOnly && (
            <PopoverContent 
              className="w-[--radix-popover-trigger-width] max-w-[calc(100vw-2rem)] p-0 z-[9999] border-slate-200 bg-white shadow-2xl rounded-2xl overflow-hidden mt-2" 
              align="start"
              collisionPadding={16}
            >
              <Command className="bg-white">
                <CommandInput placeholder="Search healthcare providers..." className="h-12 border-b border-slate-100" />
                <CommandEmpty>No medical professionals found.</CommandEmpty>
                <CommandGroup className="max-h-72 overflow-y-auto p-2 space-y-1">
                  {availableProviders.map((provider) => (
                    <CommandItem
                      key={provider.id}
                      value={provider.name}
                      onSelect={() => {
                        setSelectedProvider(provider.id)
                        setOpen(false)
                      }}
                      className="flex items-center px-3 py-3 rounded-xl cursor-pointer font-bold text-slate-700 data-[selected=true]:bg-emerald-50 data-[selected=true]:text-[#67BA2E] transition-all hover:bg-slate-50"
                    >
                      <Check
                        className={cn(
                          "mr-3 h-4 w-4",
                          selectedProvider === provider.id ? "opacity-100 text-[#67BA2E]" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                         <span className="text-sm">{provider.name}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          )}
        </Popover>
      </div>
      )}

      {!isReadOnly && (
        <Button
          onClick={handleSave}
          disabled={isPending}
          className="h-12 w-full bg-[#67BA2E] hover:bg-[#5aa827] text-white font-bold text-sm rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-emerald-100 flex items-center gap-2"
        >
          {isPending ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <>
              Add to Care Team
            </>
          )}
        </Button>
      )}
    </div>
  )
}
