"use client"

import * as React from "react"
import { format } from "date-fns"
import { DISPLAY_DATE_FORMAT, DISPLAY_DATE_TIME_FORMAT } from "@/lib/date-format"
import { ChevronRight, Calendar, Stethoscope, Hash, FileText, FlaskConical, Download } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PatientRecordModal } from "@/components/ui/patient-record-modal"
import { DebouncedSearch } from "@/components/ui/debounced-search"
import { Badge } from "@/components/ui/badge"
import { PatientHealthTabs } from "@/components/patient/PatientHealthTabs"
import type { VitalSignEntry } from "@/types/patient-health"
import type { ClinicalRecordView } from "@/lib/clinical-record"

export interface PatientLabResult {
  id: string
  title: string
  fileUrl: string
  notes: string | null
  createdAt: string
  uploadedByName: string
}

interface RecordsListClientProps {
  records: ClinicalRecordView[]
  labResults: PatientLabResult[]
  healthData: {
    diagnoses: string[]
    medications: string[]
    allergies: string[]
    vitalSigns: VitalSignEntry[]
  }
}

export function RecordsListClient({ records, labResults, healthData }: RecordsListClientProps) {
  const [selectedRecord, setSelectedRecord] = React.useState<ClinicalRecordView | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  const handleViewRecord = (record: ClinicalRecordView) => {
    setSelectedRecord(record)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-8">
      <PatientHealthTabs
        diagnoses={healthData.diagnoses}
        medications={healthData.medications}
        allergies={healthData.allergies}
        vitalSigns={healthData.vitalSigns}
      />

      {/* Premium Search Filter - Standardized */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <DebouncedSearch placeholder="Search by clinician, specialty or Ref ID..." />
        <div className="flex items-center">
           <Badge variant="outline" className="h-8 bg-slate-50 text-slate-400 border-slate-200 font-black text-[9px] uppercase tracking-tighter px-4 rounded-lg">
             {records.length} Documents Found
           </Badge>
        </div>
      </div>

      {/* Pro Level Records Stack */}
      <div className="grid gap-6">
        {records.length > 0 ? (
          records.map((record) => (
            <Card key={record.id} className="group hover:border-[#67BA2E]/40 transition-all duration-500 border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden bg-white rounded-[2rem]">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between p-8 gap-8">
                  
                  {/* Left: Document Info */}
                  <div className="flex items-center gap-6">
                    <div className="size-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-[#67BA2E]/10 group-hover:text-[#67BA2E] group-hover:border-[#67BA2E]/20 transition-all duration-500 shadow-inner">
                      <Stethoscope className="size-8" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-slate-800 tracking-tight">{format(new Date(record.date), DISPLAY_DATE_FORMAT)}</span>
                        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black text-[9px] uppercase tracking-widest px-2">
                          {record.hasAssessment ? "Clinical" : "Physician Note"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Calendar className="size-3 text-[#67BA2E]" />
                          Record Created
                        </span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Hash className="size-3 text-[#67BA2E]" />
                          Ref: {record.id.slice(0, 8).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Clinical Details */}
                  <div className="flex items-center gap-12">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Attending Clinician</span>
                      <div className="flex items-center gap-2">
                         <div className="size-6 rounded-lg bg-[#67BA2E]/10 flex items-center justify-center text-[#67BA2E]">
                            <Stethoscope className="size-3" />
                         </div>
                         <span className="font-bold text-slate-700 text-base leading-tight">{record.providerName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Pro Action Button */}
                  <div className="flex items-center">
                    <Button 
                      onClick={() => handleViewRecord(record)}
                      className="h-12 px-8 rounded-xl bg-[#67BA2E] hover:bg-[#5aa827] text-white font-black transition-all duration-300 shadow-lg shadow-emerald-100 uppercase tracking-widest text-xs gap-3 group/btn border-0"
                    >
                      View Full Document
                      <ChevronRight className="size-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="py-24 text-center bg-white border-2 border-dashed border-slate-200 rounded-[3rem] shadow-inner">
             <div className="size-20 rounded-[2rem] bg-slate-50 flex items-center justify-center mx-auto mb-6">
                <FileText className="size-10 text-slate-200" />
             </div>
             <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Repository Empty</h3>
             <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">No clinical documentation has been uploaded yet.</p>
          </div>
        )}
      </div>

      {/* Lab Results */}
      <div className="space-y-6">
        <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase flex items-center gap-2 px-1">
          <FlaskConical className="size-5 text-[#67BA2E]" />
          Lab Results
          <div className="h-[2px] flex-1 bg-slate-100 rounded-full" />
        </h2>

        {labResults.length > 0 ? (
          <div className="grid gap-4">
            {labResults.map((lab) => (
              <Card key={lab.id} className="border-slate-200 shadow-sm bg-white rounded-2xl">
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="size-12 shrink-0 rounded-xl bg-[#67BA2E]/10 flex items-center justify-center text-[#67BA2E]">
                    <FileText className="size-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-slate-800 break-words">{lab.title}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                      {format(new Date(lab.createdAt), DISPLAY_DATE_TIME_FORMAT)} · {lab.uploadedByName}
                    </p>
                    {lab.notes ? (
                      <p className="text-sm font-medium text-slate-600 mt-2 whitespace-pre-wrap break-words">{lab.notes}</p>
                    ) : null}
                  </div>
                  <Button asChild className="h-11 px-6 rounded-xl bg-[#67BA2E] hover:bg-[#5aa827] text-white font-black uppercase tracking-widest text-[10px] gap-2 shrink-0">
                    <a href={lab.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="size-4" />
                      View / Download PDF
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center bg-white border-2 border-dashed border-slate-200 rounded-[2rem]">
            <FlaskConical className="size-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No lab results yet.</p>
          </div>
        )}
      </div>

      <PatientRecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)} 
        record={selectedRecord} 
      />
    </div>
  )
}
