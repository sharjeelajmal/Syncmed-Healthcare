"use client"

import * as React from "react"
import { format } from "date-fns"
import { 
  FileText, 
  FileSignature,
  Activity, 
  Thermometer, 
  Scale, 
  Heart, 
  ClipboardList,
  Stethoscope,
  ChevronRight
} from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface VisitHistoryTableProps {
  assessments: any[]
}

export function VisitHistoryTable({ assessments }: VisitHistoryTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-slate-100">
            <TableHead className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</TableHead>
            <TableHead className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Chief Complaint</TableHead>
            <TableHead className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Provider</TableHead>
            <TableHead className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assessments.map((visit) => {
            const clinicalData = visit.data as any
            const chiefComplaint = clinicalData?.notes?.chiefComplaint || "Routine Checkup"

            return (
              <TableRow key={visit.id} className="group hover:bg-slate-50/50 border-slate-100">
                <TableCell className="px-8 py-5">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800 text-sm">{format(new Date(visit.createdAt), "MMM dd, yyyy")}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-0.5">{format(new Date(visit.createdAt), "hh:mm a")}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="text-left hover:text-[#67BA2E] transition-colors group/text">
                        <span className="font-bold text-slate-700 text-sm line-clamp-1 max-w-[200px] border-b border-dashed border-slate-200 group-hover/text:border-[#67BA2E]">
                          {chiefComplaint}
                        </span>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-slate-200 p-8">
                      <DialogHeader>
                        <div className="size-12 rounded-2xl bg-[#67BA2E]/10 flex items-center justify-center text-[#67BA2E] mb-4">
                          <ClipboardList className="size-6" />
                        </div>
                        <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight">Chief Complaint</DialogTitle>
                        <DialogDescription className="font-medium text-slate-500">Documented reason for encounter on {format(new Date(visit.createdAt), "PPP")}</DialogDescription>
                      </DialogHeader>
                      <div className="mt-6 p-6 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700 font-medium leading-relaxed">
                        {chiefComplaint}
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded-full bg-[#67BA2E]/10 flex items-center justify-center text-[#67BA2E] font-black text-[8px] border border-[#67BA2E]/20">
                      {visit.provider.user.firstName[0]}{visit.provider.user.lastName[0]}
                    </div>
                    <span className="text-[10px] font-black text-[#67BA2E] uppercase tracking-widest">Dr. {visit.provider.user.lastName}</span>
                  </div>
                </TableCell>
                <TableCell className="px-8 text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="h-9 px-4 border-[#67BA2E]/20 text-[#67BA2E] font-bold text-[10px] uppercase tracking-widest hover:bg-[#67BA2E] hover:text-white rounded-lg transition-all gap-2"
                      >
                        <FileText size={14} />
                        View Note
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] rounded-[2rem] border-slate-200 p-0 overflow-hidden" closeButtonClassName="top-7 right-7 bg-white text-[#67BA2E] hover:bg-slate-100 hover:text-[#5aa827]">
                      <div className="bg-[#67BA2E] p-8 pb-10 text-white">
                        <DialogHeader>
                          <div className="flex items-start gap-4 pr-12">
                            <div className="size-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
                              <Stethoscope className="size-7" />
                            </div>
                            <div className="flex flex-col gap-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <DialogTitle className="text-2xl font-black tracking-tight text-white">Clinical Encounter Note</DialogTitle>
                                <Badge className="bg-white/20 hover:bg-white/30 text-white border-transparent font-black text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-md">
                                  ID: {visit.id.slice(0, 8).toUpperCase()}
                                </Badge>
                              </div>
                              <DialogDescription className="text-white/80 font-medium text-xs">Finalized on {format(new Date(visit.createdAt), "PPP p")}</DialogDescription>
                            </div>
                          </div>
                        </DialogHeader>
                      </div>

                      <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                        {/* Vitals Section */}
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Activity className="size-3 text-[#67BA2E]" />
                            Biometric Vitals
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <VitalBox icon={<Heart />} label="BP" value={clinicalData?.vitals?.bloodPressure ? `${clinicalData.vitals.bloodPressure} mmHg` : "--"} />
                            <VitalBox icon={<Activity />} label="HR" value={clinicalData?.vitals?.heartRate ? `${clinicalData.vitals.heartRate} bpm` : "--"} />
                            <VitalBox icon={<Thermometer />} label="Temp" value={clinicalData?.vitals?.temperature ? `${clinicalData.vitals.temperature} °F` : "--"} />
                            <VitalBox icon={<Scale />} label="Weight" value={clinicalData?.vitals?.weight ? `${clinicalData.vitals.weight} lbs` : "--"} />
                          </div>
                        </div>

                        {/* Documentation Section */}
                        <div className="space-y-6">
                           <NoteSection title="Chief Complaint" content={clinicalData?.notes?.chiefComplaint} />
                           <NoteSection title="Diagnosis & Observations" content={clinicalData?.notes?.diagnosis} />
                           <NoteSection title="Treatment Plan" content={clinicalData?.notes?.treatmentPlan} />
                        </div>

                        {/* Patient Signature Section */}
                        {visit.patientSignatureUrl && (
                          <div className="mt-8 border-t border-slate-100 pt-6 space-y-3">
                            <div className="flex items-center gap-2">
                              <FileSignature className="size-3 text-[#67BA2E]" />
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Patient / Authorized Representative Signature</p>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 inline-block">
                              <img 
                                src={visit.patientSignatureUrl} 
                                alt="Patient Signature" 
                                className="h-24 object-contain mix-blend-multiply opacity-90"
                              />
                            </div>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-400">
                                {visit.provider.user.firstName[0]}{visit.provider.user.lastName[0]}
                              </div>
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Digitally Signed by Dr. {visit.provider.user.lastName}</span>
                           </div>
                           <span className="text-[10px] font-bold text-slate-400 uppercase italic">Confidential Medical Record</span>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

function VitalBox({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center gap-1">
      <div className="text-[#67BA2E] opacity-60">
        {React.cloneElement(icon as any, { size: 14 })}
      </div>
      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      <span className="text-xs font-black text-slate-800">{value || "--"}</span>
    </div>
  )
}

function NoteSection({ title, content }: { title: string, content: string }) {
  return (
    <div className="space-y-2">
      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</h4>
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700 text-sm font-medium leading-relaxed">
        {content || "No clinical documentation provided."}
      </div>
    </div>
  )
}
