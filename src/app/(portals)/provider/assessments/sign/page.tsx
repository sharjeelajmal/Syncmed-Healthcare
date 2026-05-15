import * as React from "react"
import { ShieldCheck, FileSignature, AlertCircle } from "lucide-react"
import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SignaturePadClient } from "./SignaturePadClient"

interface PageProps {
  searchParams: Promise<{ assessmentId?: string; patientId?: string }>
}

export default async function SignaturePage({ searchParams }: PageProps) {
  const { assessmentId, patientId } = await searchParams

  if (!assessmentId || !patientId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full rounded-[2rem] border-red-100 bg-white shadow-xl p-8 text-center">
          <div className="size-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="size-8 text-red-500" />
          </div>
          <h1 className="text-xl font-black text-slate-800 mb-2">Invalid Signature Link</h1>
          <p className="text-slate-500 font-medium mb-6">Critical context (Assessment or Patient ID) is missing. This link is no longer valid for signing.</p>
          <Link href="/provider/patients">
            <Button className="w-full h-12 bg-slate-900 hover:bg-black text-white font-bold rounded-xl">
              Return to Safety
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto p-4 md:p-12 animate-slide-up space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="size-16 rounded-[2rem] bg-[#67BA2E]/10 flex items-center justify-center mx-auto mb-4 border border-[#67BA2E]/20 shadow-sm">
            <FileSignature className="size-8 text-[#67BA2E]" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800">Patient Consent & Signature</h1>
          <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed italic">
            "I acknowledge that the information provided in today's clinical encounter is accurate and I consent to the treatment plan."
          </p>
        </div>

        {/* Signature Pad */}
        <Card className="rounded-[2.5rem] border-slate-200 shadow-2xl shadow-slate-200/50 bg-white overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8 text-center">
            <div className="flex items-center justify-center gap-2 text-[#67BA2E]">
               <ShieldCheck className="size-5" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verified Secure Signing Node</span>
            </div>
          </CardHeader>
          <CardContent className="p-8 md:p-10">
            <SignaturePadClient assessmentId={assessmentId} patientId={patientId} />
            <div className="mt-8 p-4 rounded-2xl bg-amber-50 border border-amber-100">
               <p className="text-[10px] text-amber-700 font-bold leading-relaxed text-center">
                 BY SUBMITTING THIS SIGNATURE, YOU AGREE THAT THIS IS THE LEGAL EQUIVALENT OF YOUR MANUAL SIGNATURE. THIS RECORD IS CLINICALLY BINDING AND HIPAA COMPLIANT.
               </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-slate-400 font-bold text-[10px] uppercase tracking-widest">
          SyncMed Secure Clinical Signing Gateway &copy; 2026
        </p>
      </div>
    </div>
  )
}
