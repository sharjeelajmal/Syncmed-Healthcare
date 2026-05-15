"use client"

import * as React from "react"
import Link from "next/link"
import { 
  UserPlus, 
  Phone,
  Fingerprint
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
import { PatientTableActions } from "./PatientTableActions"
import { DebouncedSearch } from "@/components/ui/debounced-search"
import { cn } from "@/lib/utils"

interface PatientTableProps {
  patients: any[]
}

export function PatientTable({ patients }: PatientTableProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <DebouncedSearch placeholder="Search by name or email..." />
        <Link href="/admin/patients/new" className="w-full md:w-auto">
          <Button className="h-12 w-full md:px-8 bg-[#67BA2E] hover:bg-[#5aa827] text-white font-bold rounded-xl shadow-lg shadow-emerald-100 transition-all flex items-center gap-2">
            <UserPlus className="size-5" />
            Add New Patient
          </Button>
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm mt-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="w-[300px] text-[10px] font-black text-slate-400 uppercase tracking-widest py-5 px-8">Patient Identity</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-5">Contact Details</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-5">Clinical Status</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-5 text-right px-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.length > 0 ? (
                patients.map((patient) => (
                  <TableRow key={patient.id} className="group hover:bg-slate-50/50 transition-colors border-slate-100">
                    <TableCell className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xs shadow-inner">
                          {patient.firstName[0]}{patient.lastName[0]}
                        </div>
                        <div className="flex flex-col">
                          <Link 
                            href={`/admin/patients/${patient.id}?mode=view`}
                            className="font-bold text-slate-800 text-base leading-tight hover:text-[#67BA2E] hover:underline transition-all"
                          >
                            {patient.firstName} {patient.lastName}
                          </Link>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-1 flex items-center gap-1">
                            <Fingerprint size={10} />
                            ID: {patient.id.slice(-8).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-slate-600">{patient.email}</span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold uppercase tracking-tight">
                           <Phone size={11} className="text-[#67BA2E]" />
                           {patient.patientProfile?.phone || "No Registry"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {patient.isActive ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black px-3 py-1.5 rounded-full text-[10px] tracking-widest uppercase">
                          Authorized
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-500 border-red-100 font-black px-3 py-1.5 rounded-full text-[10px] tracking-widest uppercase">
                          Suspended
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <PatientTableActions patientId={patient.id} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-40 text-center text-slate-400 font-bold bg-slate-50/20">
                    No patients found in the registry.
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
