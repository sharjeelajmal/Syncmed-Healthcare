"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"
import { Input } from "@/components/ui/input"

interface DebouncedSearchProps {
  placeholder?: string
}

export function DebouncedSearch({ placeholder = "Search..." }: DebouncedSearchProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set('query', term)
    } else {
      params.delete('query')
    }
    replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, 300)

  return (
    <div className="relative flex-1 max-w-md group">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-[#67BA2E] transition-colors" />
      <Input
        placeholder={placeholder}
        defaultValue={searchParams.get('query')?.toString()}
        onChange={(e) => handleSearch(e.target.value)}
        className="flex h-12 w-full md:w-[350px] rounded-xl border-slate-300 bg-white pl-11 pr-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#67BA2E] transition-all"
      />
    </div>
  )
}
