"use client"

import * as React from "react"
import Link from "next/link"
import { 
  UserPlus, 
  ShieldCheck, 
  ShieldAlert, 
  Mail, 
  MoreVertical
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ProviderTableActions } from "./ProviderTableActions"
import { DebouncedSearch } from "@/components/ui/debounced-search"
import { cn } from "@/lib/utils"

interface ProviderTableProps {
  providers: any[]
}

export function ProviderTable({ providers }: ProviderTableProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <DebouncedSearch placeholder="Search by name or specialty..." />
        <Link href="/admin/providers/new" className="w-full md:w-auto">
          <Button className="h-12 w-full md:px-8 bg-[#67BA2E] hover:bg-[#5aa827] text-white font-bold rounded-xl shadow-lg shadow-emerald-100 transition-all flex items-center gap-2">
            <UserPlus className="size-5" />
            Add New Provider
          </Button>
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm mt-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="w-[300px] text-[10px] font-black text-slate-400 uppercase tracking-widest py-5 px-8">Provider Identity</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-5">Medical Specialty</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-5">License Details</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-5">Account Status</TableHead>
                <TableHead className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest py-5 px-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {providers.length > 0 ? (
                providers.map((provider) => (
                  <TableRow key={provider.id} className="group hover:bg-slate-50/50 transition-colors border-slate-100">
                    <TableCell className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="size-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#67BA2E] font-black text-sm border border-emerald-100 shadow-inner">
                          {provider.firstName[0]}{provider.lastName[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-base leading-tight">
                            Dr. {provider.firstName} {provider.lastName}
                          </span>
                          <span className="text-[11px] font-black text-emerald-600 uppercase tracking-tighter mt-1 flex items-center gap-1">
                            <Mail size={10} />
                            {provider.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-[#67BA2E]/10 text-[#67BA2E] border-[#67BA2E]/20 font-bold px-3 py-1 rounded-full text-[10px] tracking-wider">
                        {provider.providerProfile?.specialty || "GENERAL MEDICINE"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono text-sm font-bold text-slate-600 tracking-tight">
                          {provider.providerProfile?.licenseNumber || "UNVERIFIED"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                          Medical Board #
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {provider.isActive ? (
                        <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest bg-emerald-50 w-fit px-3 py-1.5 rounded-full border border-emerald-100">
                          <ShieldCheck className="size-3" />
                          Authorized
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-500 font-black text-[10px] uppercase tracking-widest bg-red-50 w-fit px-3 py-1.5 rounded-full border border-red-100">
                          <ShieldAlert className="size-3" />
                          Suspended
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <ProviderTableActions userId={provider.id} isActive={provider.isActive} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center text-slate-400 font-bold bg-slate-50/20">
                    No medical professionals match your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
