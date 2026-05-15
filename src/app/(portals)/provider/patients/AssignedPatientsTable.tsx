"use client"

import * as React from "react"
import Link from "next/link"
import { 
  FileText, 
  Mail, 
  Phone, 
  Calendar, 
  User as UserIcon,
  ChevronRight
} from "lucide-react"
import { format, differenceInYears } from "date-fns"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DebouncedSearch } from "@/components/ui/debounced-search"

interface AssignedPatientsTableProps {
  patients: any[]
}

export function AssignedPatientsTable({ patients }: AssignedPatientsTableProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <DebouncedSearch placeholder="Search my patients..." />
      </div>

      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="w-[300px] text-[10px] font-black text-slate-400 uppercase tracking-widest py-5 px-8">Patient Identity</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-5">DOB / Age</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-5">Contact Details</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-5">Last Visit</TableHead>
                <TableHead className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest py-5 px-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.length > 0 ? (
                patients.map((patient) => {
                  const lastVisit = patient.appointments?.[0]?.scheduledAt
                  const age = differenceInYears(new Date(), new Date(patient.dateOfBirth))

                  return (
                    <TableRow key={patient.id} className="group hover:bg-slate-50/50 transition-colors border-slate-100">
                      <TableCell className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="size-10 rounded-2xl bg-[#67BA2E]/10 flex items-center justify-center text-[#67BA2E] font-black text-sm border border-[#67BA2E]/20 shadow-inner">
                            {patient.user.firstName[0]}{patient.user.lastName[0]}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-base leading-tight">
                              {patient.user.firstName} {patient.user.lastName}
                            </span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-1">
                              ID: {patient.id.slice(0, 8)}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700 text-sm">
                            {format(new Date(patient.dateOfBirth), "MMM dd, yyyy")}
                          </span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            {age} Years Old
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-slate-600 text-xs font-medium">
                            <Mail size={12} className="text-slate-400" />
                            {patient.user.email}
                          </div>
                          <div className="flex items-center gap-2 text-slate-600 text-xs font-medium">
                            <Phone size={12} className="text-slate-400" />
                            {patient.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {lastVisit ? (
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-700 text-sm">
                              {format(new Date(lastVisit), "MMM dd, yyyy")}
                            </span>
                            <span className="text-[10px] font-black text-[#67BA2E] uppercase tracking-widest mt-1 flex items-center gap-1">
                              <Calendar size={10} />
                              Previous Enc.
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Prior Records</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right px-8">
                        <Button 
                          asChild
                          className="h-9 px-4 bg-[#67BA2E] hover:bg-[#67BA2E]/90 text-white font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider"
                        >
                          <Link href={`/provider/patients/${patient.id}`}>
                            <FileText className="size-3.5" />
                            Open Chart
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center text-slate-400 font-bold bg-slate-50/20 uppercase tracking-widest text-xs">
                    No patients are currently assigned to you.
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
