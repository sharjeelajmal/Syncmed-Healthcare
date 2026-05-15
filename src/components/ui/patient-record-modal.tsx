"use client"

import * as React from "react"
import { format } from "date-fns"
import { Download, Stethoscope, ChevronRight, Loader2 } from "lucide-react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface PatientRecordModalProps {
  isOpen: boolean
  onClose: () => void
  record: any
}

export function PatientRecordModal({ isOpen, onClose, record }: PatientRecordModalProps) {
  const [isDownloading, setIsDownloading] = React.useState(false)

  if (!record) return null

  // Extracting data from JSON field
  const data = record.data || {}
  const vitals = data.vitals || {}
  const notes = data.notes || {}

  const handleDownload = async () => {
    const element = document.getElementById("clinical-document")
    if (!element) return

    setIsDownloading(true)
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      })
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")
      const imgProps = pdf.getImageProperties(imgData)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
      pdf.save(`Clinical_Record_${record.id.slice(0, 8)}.pdf`)
    } catch (error) {
      console.error("PDF Generation failed", error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] md:max-w-3xl rounded-3xl border-slate-200 shadow-2xl bg-white p-0 overflow-hidden max-h-[90vh] overflow-y-auto print:max-h-none print:overflow-visible print:border-none print:shadow-none print:p-0">
        
        {/* Actions Header (Hidden on Print) */}
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 flex justify-between items-center print:hidden">
          <div className="flex items-center gap-2">
            <Stethoscope className="size-5 text-[#67BA2E]" />
            <span className="font-bold text-slate-800">Clinical Record</span>
          </div>
          <Button 
            onClick={handleDownload}
            disabled={isDownloading}
            className="bg-[#67BA2E] hover:bg-[#5aa827] text-white font-black rounded-xl gap-2 shadow-lg shadow-emerald-100 transition-all uppercase tracking-widest text-[10px] min-w-[180px]"
          >
            {isDownloading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="size-4" />
                Download Official PDF
              </>
            )}
          </Button>
        </div>

        {/* Clinical Document Content */}
        <div id="clinical-document" className="p-10 md:p-16 bg-white space-y-12 print:p-0 print:m-0 print:block print:w-full">
          
          {/* Document Header */}
          <div className="flex justify-between items-start border-b-2 border-[#0f172a] pb-8">
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-[#0f172a] tracking-tighter uppercase">SyncMed Clinical Group</h1>
              <p className="text-sm font-medium text-[#64748b]">123 Healthcare Way, Medical District</p>
              <p className="text-sm font-medium text-[#64748b]">Suite 400, New York, NY 10001</p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Document ID</p>
              <p className="font-bold text-[#0f172a]">{record.id.toUpperCase()}</p>
              <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mt-4">Date of Service</p>
              <p className="font-bold text-[#0f172a]">{format(new Date(record.createdAt), "MMMM dd, yyyy")}</p>
            </div>
          </div>

          {/* Provider Info */}
          <div className="bg-[#f8fafc] p-6 rounded-2xl border border-[#f1f5f9] print:bg-transparent print:border-none print:p-0">
             <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Attending Provider</span>
                <p className="text-lg font-bold text-[#0f172a]">Dr. {record.provider.user.firstName} {record.provider.user.lastName}</p>
                <p className="text-sm font-medium text-[#67BA2E]">{record.provider.specialty}</p>
             </div>
          </div>

          {/* Vitals Grid */}
          <div className="space-y-4">
             <h3 className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.4em] border-b border-[#f1f5f9] pb-2">Patient Vitals</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="space-y-1">
                   <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">Blood Pressure</p>
                   <p className="text-lg font-bold text-[#0f172a]">{vitals.bp || '120/80'} <span className="text-xs font-medium text-[#94a3b8]">mmHg</span></p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">Heart Rate</p>
                   <p className="text-lg font-bold text-[#0f172a]">{vitals.hr || '72'} <span className="text-xs font-medium text-[#94a3b8]">bpm</span></p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">Temperature</p>
                   <p className="text-lg font-bold text-[#0f172a]">{vitals.temp || '98.6'} <span className="text-xs font-medium text-[#94a3b8]">°F</span></p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">Weight</p>
                   <p className="text-lg font-bold text-[#0f172a]">{vitals.weight || '165'} <span className="text-xs font-medium text-[#94a3b8]">lbs</span></p>
                </div>
             </div>
          </div>

          {/* Clinical Notes */}
          <div className="space-y-8">
             <div className="space-y-3">
                <h3 className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.4em]">Chief Complaint</h3>
                <p className="text-[#1e293b] leading-relaxed font-medium">{notes.chiefComplaint || "Routine follow-up for chronic condition management."}</p>
             </div>
             <div className="space-y-3">
                <h3 className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.4em]">Diagnosis & Assessment</h3>
                <p className="text-[#1e293b] leading-relaxed font-medium">{notes.diagnosis || "Patient presents with symptoms consistent with generalized anxiety and hypertension. Vital signs stable but indicate need for continued monitoring."}</p>
             </div>
             <div className="space-y-3">
                <h3 className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.4em]">Treatment Plan</h3>
                <p className="text-[#1e293b] leading-relaxed font-medium">{notes.treatmentPlan || "1. Continue current medication dosage.\n2. Schedule follow-up in 4 weeks.\n3. Implement daily stress reduction techniques."}</p>
             </div>
          </div>

          {/* Footer & Signature */}
          <div className="pt-12 border-t border-[#f1f5f9] flex justify-between items-end">
             <div className="space-y-1">
                <p className="text-[10px] font-medium text-[#94a3b8] italic">This is a certified electronic medical record.</p>
                <p className="text-[10px] font-medium text-[#94a3b8] italic">Generated on {new Date().toLocaleString()}</p>
             </div>
             {record.patientSignatureUrl && (
                <div className="text-right">
                   <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mb-2">Patient Signature</p>
                   <img src={record.patientSignatureUrl} alt="Signature" className="h-12 w-auto grayscale mix-blend-multiply" />
                </div>
             )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
