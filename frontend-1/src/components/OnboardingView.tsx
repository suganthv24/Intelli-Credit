"use client";

import { useState, useCallback } from "react";
import {
  Upload, FileText, CheckCircle2, AlertCircle, ChevronRight,
  Building2, DollarSign, Files, ScanSearch, ClipboardList, Loader2,
  RotateCcw, SparklesIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { analyzeCompany } from "@/lib/api";
import { useCreditStore, ClassifiedDocument, DocumentType } from "@/store/creditStore";

// ── Processing Steps ────────────────────────────────────────────────────────

interface ProcessingStep {
  label: string;
  status: "pending" | "active" | "done";
}

const PIPELINE_STAGES: ProcessingStep[] = [
  { label: "Entity Onboarding", status: "pending" },
  { label: "Document Processing", status: "pending" },
  { label: "Financial Extraction", status: "pending" },
  { label: "Cross-Document Validation", status: "pending" },
  { label: "Fraud Detection", status: "pending" },
  { label: "Regulatory Analysis", status: "pending" },
  { label: "Risk Modeling", status: "pending" },
  { label: "SWOT Generation", status: "pending" },
  { label: "CAM Report Creation", status: "pending" },
];

// ── Document slot config ────────────────────────────────────────────────────

const DOC_SLOTS = [
  { id: "ar",  label: "Annual Report",                  type: "annual_report" as DocumentType },
  { id: "shp", label: "Shareholding Pattern",            type: "shareholding_pattern" as DocumentType },
  { id: "alm", label: "ALM Report",                     type: "alm_report" as DocumentType },
  { id: "bp",  label: "Borrowing Profile",               type: "borrowing_profile" as DocumentType },
  { id: "pp",  label: "Portfolio Performance Report",    type: "portfolio_performance" as DocumentType },
];

const ALL_DOC_TYPES: { value: DocumentType; label: string }[] = [
  { value: "annual_report",         label: "Annual Report" },
  { value: "shareholding_pattern",  label: "Shareholding Pattern" },
  { value: "alm_report",            label: "ALM Report" },
  { value: "borrowing_profile",     label: "Borrowing Profile" },
  { value: "portfolio_performance", label: "Portfolio Performance Report" },
  { value: "unknown",               label: "Other / Unknown" },
];

const SECTORS = [
  "Banking & NBFC", "Manufacturing", "IT / Software", "Retail", "Real Estate",
  "Healthcare", "Agri & Food Processing", "Logistics", "Infrastructure", "Other",
];

const LOAN_TYPES = ["Term Loan", "Working Capital", "Cash Credit", "OD Facility", "Letter of Credit"];

// ── Step nav configuration ──────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Company",    icon: Building2 },
  { id: 2, label: "Loan",       icon: DollarSign },
  { id: 3, label: "Documents",  icon: Files },
  { id: 4, label: "Classify",   icon: ScanSearch },
  { id: 5, label: "Insights",   icon: ClipboardList },
];

// ── Quick helper ─────────────────────────────────────────────────────────────

function InputField({
  label, value, onChange, placeholder = "", type = "text", required = false,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-[#909094] uppercase tracking-wider">
        {label}{required && <span className="text-[#f04438] ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#1D1D20] border border-[#3f3f46] rounded-lg px-3 py-2.5 text-sm text-[#fbfbff] placeholder-[#52525b] focus:outline-none focus:border-[#A1C9F4] transition-colors"
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function OnboardingView() {
  const router = useRouter();
  const { setAnalysis, setLoading, setError } = useCreditStore();

  // ── Step state ──────────────────────────────────────────────────────────
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>(PIPELINE_STAGES);

  // ── Step 1: Company Details ─────────────────────────────────────────────
  const [companyName, setCompanyName] = useState("");
  const [promoterName, setPromoterName] = useState("");
  const [sector, setSector] = useState("Banking & NBFC");
  const [CIN, setCIN] = useState("");
  const [PAN, setPAN] = useState("");
  const [turnover, setTurnover] = useState("");

  // ── Step 2: Loan Details ────────────────────────────────────────────────
  const [loanAmount, setLoanAmount] = useState("");
  const [loanType, setLoanType] = useState("Term Loan");
  const [loanTenure, setLoanTenure] = useState("");
  const [expectedInterestRate, setExpectedInterestRate] = useState("");

  // ── Step 3: Documents ───────────────────────────────────────────────────
  const [uploadedFiles, setUploadedFiles] = useState<(File | null)[]>([null, null, null, null, null]);

  // ── Step 4: HITL Classification ─────────────────────────────────────────
  const [classifiedDocs, setClassifiedDocs] = useState<ClassifiedDocument[]>([]);

  // ── Step 5: Primary Insights ────────────────────────────────────────────
  const [siteVisitNotes, setSiteVisitNotes] = useState("");
  const [managementNotes, setManagementNotes] = useState("");
  const [operationalObservations, setOperationalObservations] = useState("");

  // ── Computed ─────────────────────────────────────────────────────────────
  const allDocsUploaded = uploadedFiles.every((f) => f !== null);
  const step1Valid = companyName.trim() && promoterName.trim();
  const step2Valid = loanAmount.trim() && loanType.trim() && loanTenure.trim();

  // ── Document upload handler ──────────────────────────────────────────────
  const handleDocUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
      if (e.target.files && e.target.files.length > 0) {
        setUploadedFiles((prev) => {
          const arr = [...prev];
          arr[idx] = e.target.files![0];
          return arr;
        });
      }
    },
    []
  );

  // ── Generate simulated classification suggestions ─────────────────────────
  const simulateClassification = useCallback(() => {
    const classified: ClassifiedDocument[] = uploadedFiles.map((file, idx) => {
      const slot = DOC_SLOTS[idx];
      const confidence = 0.85 + Math.random() * 0.12;
      return {
        doc_id: `doc_${idx + 1}`,
        file: file!,
        label: slot.label,
        suggested_type: slot.type,
        confirmed_type: slot.type,
        confidence: parseFloat(confidence.toFixed(2)),
      };
    });
    setClassifiedDocs(classified);
    setStep(4);
  }, [uploadedFiles]);

  // ── Handle type override for HITL step ────────────────────────────────────
  const updateDocType = (docId: string, newType: DocumentType) => {
    setClassifiedDocs((prev) =>
      prev.map((d) => (d.doc_id === docId ? { ...d, confirmed_type: newType } : d))
    );
  };

  // ── Animate pipeline steps ────────────────────────────────────────────────
  const animateSteps = (): Promise<void> =>
    new Promise((resolve) => {
      let i = 0;
      const total = PIPELINE_STAGES.length;
      const interval = setInterval(() => {
        if (i >= total) {
          clearInterval(interval);
          resolve();
          return;
        }
        setProcessingSteps((prev) =>
          prev.map((s, idx) => ({
            ...s,
            status: idx < i ? "done" : idx === i ? "active" : "pending",
          }))
        );
        i++;
      }, 900);
    });

  // ── Main analysis trigger ─────────────────────────────────────────────────
  const startAnalysis = async () => {
    setIsProcessing(true);
    setApiError(null);
    setLoading(true);

    const animationPromise = animateSteps();

    let apiResponse: any = null;
    let apiErr: string | null = null;

    try {
      const formData = new FormData();

      // Core company & entity details
      formData.append("company_name", companyName.trim());
      formData.append("promoter_name", promoterName.trim());
      formData.append("sector", sector);
      if (CIN)   formData.append("CIN", CIN.trim());
      if (PAN)   formData.append("PAN", PAN.trim());
      if (turnover) formData.append("turnover", turnover);

      // Loan details
      formData.append("loan_amount_requested", loanAmount);
      formData.append("loan_type", loanType);
      formData.append("loan_tenure", loanTenure);
      if (expectedInterestRate) formData.append("expected_interest_rate", expectedInterestRate);

      // Primary insights
      const primary_insights = {
        site_visit_notes: siteVisitNotes.trim(),
        management_interview_notes: managementNotes.trim(),
        operational_observations: operationalObservations.trim(),
      };
      formData.append("primary_insights", JSON.stringify(primary_insights));

      // Classification overrides (confirmed doc types from HITL step)
      const doc_type_overrides = classifiedDocs.map((d) => ({
        doc_id: d.doc_id,
        confirmed_type: d.confirmed_type,
      }));
      formData.append("doc_type_overrides", JSON.stringify(doc_type_overrides));

      // Attach document files in HITL confirmed order
      for (const docEntry of classifiedDocs) {
        formData.append("documents", docEntry.file);
      }

      console.log("[Zerve] Starting analysis for:", companyName);
      apiResponse = await analyzeCompany(formData);
      console.log("[Zerve] API response received:", apiResponse);
    } catch (err: any) {
      console.error("[Zerve] API error:", err);
      apiErr = err?.message ?? "Credit analysis failed. Please retry.";
    }

    await animationPromise;

    if (apiErr || !apiResponse) {
      setProcessingSteps((prev) => prev.map((s) => ({ ...s, status: "done" as const })));
      setApiError(apiErr ?? "No response from server.");
      setError(apiErr);
      return;
    }

    setProcessingSteps((prev) => prev.map((s) => ({ ...s, status: "done" as const })));
    setAnalysis(apiResponse);
    await new Promise((r) => setTimeout(r, 500));
    router.push("/dashboard");
  };

  // ── Rendering ────────────────────────────────────────────────────────────

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0F11]">
        <div className="max-w-md w-full px-6 space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#A1C9F4]/10 border border-[#A1C9F4]/30 mb-4">
              <Loader2 className="w-8 h-8 text-[#A1C9F4] animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-[#fbfbff]">Running AI Credit Analysis</h2>
            <p className="text-sm text-[#909094] mt-1">Zerve AI pipeline processing {companyName}…</p>
          </div>

          <div className="space-y-2">
            {processingSteps.map((s, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-500",
                  s.status === "done"   ? "border-[#8DE5A1]/30 bg-[#8DE5A1]/5"
                  : s.status === "active" ? "border-[#A1C9F4]/40 bg-[#A1C9F4]/5"
                  : "border-[#3f3f46] bg-transparent opacity-50"
                )}
              >
                {s.status === "done"    ? <CheckCircle2 className="w-4 h-4 text-[#8DE5A1] shrink-0" />
                : s.status === "active" ? <Loader2 className="w-4 h-4 text-[#A1C9F4] animate-spin shrink-0" />
                : <div className="w-4 h-4 rounded-full border border-[#52525b] shrink-0" />}
                <span className={cn(
                  "text-sm font-medium",
                  s.status === "done"   ? "text-[#8DE5A1]"
                  : s.status === "active" ? "text-[#A1C9F4]"
                  : "text-[#52525b]"
                )}>{s.label}</span>
              </div>
            ))}
          </div>

          {apiError && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-[#f04438]/10 border border-[#f04438]/30">
              <AlertCircle className="w-5 h-5 text-[#f04438] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#f04438]">Analysis Failed</p>
                <p className="text-xs text-[#909094] mt-1">{apiError}</p>
                <button
                  onClick={() => { setIsProcessing(false); setApiError(null); setProcessingSteps(PIPELINE_STAGES); }}
                  className="mt-2 flex items-center gap-1 text-xs font-medium text-[#A1C9F4] hover:text-[#fbfbff]"
                >
                  <RotateCcw className="w-3 h-3" /> Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F11] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl space-y-6">

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#A1C9F4]/10 border border-[#A1C9F4]/20 text-xs font-semibold text-[#A1C9F4] mb-3">
            <SparklesIcon className="w-3.5 h-3.5" /> Zerve AI Credit Officer
          </div>
          <h1 className="text-3xl font-bold text-[#fbfbff]">Credit Analysis Intake</h1>
          <p className="text-sm text-[#909094] mt-1">Complete all steps to initiate full AI-powered credit appraisal</p>
        </div>

        {/* Step Progress Bar */}
        <div className="flex items-center gap-0 px-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isDone = step > s.id;
            return (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all",
                    isDone  ? "bg-[#8DE5A1] border-[#8DE5A1]"
                    : isActive ? "bg-[#A1C9F4]/20 border-[#A1C9F4]"
                    : "bg-[#1D1D20] border-[#3f3f46]"
                  )}>
                    {isDone ? <CheckCircle2 className="w-4 h-4 text-[#1D1D20]" />
                    : <Icon className={cn("w-4 h-4", isActive ? "text-[#A1C9F4]" : "text-[#52525b]")} />}
                  </div>
                  <span className={cn("text-[10px] font-medium", isActive ? "text-[#A1C9F4]" : isDone ? "text-[#8DE5A1]" : "text-[#52525b]")}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn("h-0.5 flex-1 mx-1 rounded-full mt-[-1rem] transition-all", step > s.id ? "bg-[#8DE5A1]" : "bg-[#3f3f46]")} />
                )}
              </div>
            );
          })}
        </div>

        {/* Card Content */}
        <div className="bg-[#18181B] border border-[#27272a] rounded-2xl p-8 shadow-2xl">

          {/* ── Step 1: Company Details ─────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-[#fbfbff]">Company Details</h2>
                <p className="text-sm text-[#909094] mt-0.5">Basic entity information for credit profiling</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Company Name" value={companyName} onChange={setCompanyName} placeholder="ABC Private Limited" required />
                <InputField label="Promoter Name" value={promoterName} onChange={setPromoterName} placeholder="John Doe" required />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#909094] uppercase tracking-wider">Sector <span className="text-[#f04438]">*</span></label>
                  <select
                    value={sector} onChange={(e) => setSector(e.target.value)}
                    className="w-full bg-[#1D1D20] border border-[#3f3f46] rounded-lg px-3 py-2.5 text-sm text-[#fbfbff] focus:outline-none focus:border-[#A1C9F4] transition-colors"
                  >
                    {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <InputField label="CIN" value={CIN} onChange={setCIN} placeholder="U12345MH2015PTC123456" />
                <InputField label="PAN" value={PAN} onChange={setPAN} placeholder="ABCDE1234F" />
                <InputField label="Annual Turnover (₹)" value={turnover} onChange={setTurnover} placeholder="520000000" type="number" />
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setStep(2)}
                  disabled={!step1Valid}
                  className={cn("flex items-center gap-2 font-bold px-6 py-2.5 rounded-lg transition-colors",
                    step1Valid ? "bg-[#A1C9F4] hover:bg-[#8ebbf0] text-[#1D1D20]" : "bg-[#27272a] text-[#52525b] cursor-not-allowed"
                  )}
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Loan Details ────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-[#fbfbff]">Loan Details</h2>
                <p className="text-sm text-[#909094] mt-0.5">Credit facility parameters</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Loan Amount Requested (₹)" value={loanAmount} onChange={setLoanAmount} placeholder="150000000" type="number" required />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#909094] uppercase tracking-wider">Loan Type <span className="text-[#f04438]">*</span></label>
                  <select
                    value={loanType} onChange={(e) => setLoanType(e.target.value)}
                    className="w-full bg-[#1D1D20] border border-[#3f3f46] rounded-lg px-3 py-2.5 text-sm text-[#fbfbff] focus:outline-none focus:border-[#A1C9F4] transition-colors"
                  >
                    {LOAN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <InputField label="Loan Tenure" value={loanTenure} onChange={setLoanTenure} placeholder="36 months" required />
                <InputField label="Expected Interest Rate (%)" value={expectedInterestRate} onChange={setExpectedInterestRate} placeholder="9.5" type="number" />
              </div>
              <div className="flex justify-between pt-2">
                <button onClick={() => setStep(1)} className="text-[#909094] hover:text-[#fbfbff] font-medium px-4 py-2 transition-colors">
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!step2Valid}
                  className={cn("flex items-center gap-2 font-bold px-6 py-2.5 rounded-lg transition-colors",
                    step2Valid ? "bg-[#A1C9F4] hover:bg-[#8ebbf0] text-[#1D1D20]" : "bg-[#27272a] text-[#52525b] cursor-not-allowed"
                  )}
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Document Upload ─────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-[#fbfbff]">Upload Financial Documents</h2>
                <p className="text-sm text-[#909094] mt-0.5">All 5 documents are required to proceed to AI analysis</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DOC_SLOTS.map((slot, idx) => {
                  const file = uploadedFiles[idx];
                  return (
                    <div
                      key={slot.id}
                      className={cn("border rounded-xl p-4 flex flex-col items-start justify-center bg-[#1D1D20]/50 relative transition-all h-32",
                        file ? "border-[#8DE5A1]/40" : "border-[#3f3f46]"
                      )}
                    >
                      <p className="text-sm font-bold text-[#fbfbff] mb-2">{slot.label}</p>
                      {file ? (
                        <div className="w-full flex items-center justify-between p-2 rounded-lg bg-[#27272a] border border-[#3f3f46]">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileText className="w-4 h-4 text-[#8DE5A1] min-w-4" />
                            <span className="text-xs font-medium text-[#fbfbff] truncate">{file.name}</span>
                          </div>
                          <button
                            onClick={() => setUploadedFiles((prev) => { const a = [...prev]; a[idx] = null; return a; })}
                            className="text-xs text-[#909094] hover:text-[#f04438] ml-2 font-medium"
                          >Remove</button>
                        </div>
                      ) : (
                        <label className="w-full flex items-center justify-center gap-2 border border-dashed border-[#3f3f46] rounded-lg py-3 cursor-pointer hover:bg-[#27272a] transition-colors">
                          <Upload className="w-4 h-4 text-[#A1C9F4]" />
                          <span className="text-xs font-medium text-[#fbfbff]">Upload File</span>
                          <input type="file" accept=".pdf,.txt" onChange={(e) => handleDocUpload(e, idx)} className="hidden" />
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between pt-2">
                <button onClick={() => setStep(2)} className="text-[#909094] hover:text-[#fbfbff] font-medium px-4 py-2 transition-colors">
                  Back
                </button>
                <button
                  onClick={simulateClassification}
                  disabled={!allDocsUploaded}
                  className={cn("flex items-center gap-2 font-bold px-6 py-2.5 rounded-lg transition-colors",
                    allDocsUploaded ? "bg-[#A1C9F4] hover:bg-[#8ebbf0] text-[#1D1D20]" : "bg-[#27272a] text-[#52525b] cursor-not-allowed"
                  )}
                >
                  Classify Documents <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 4: HITL Document Classification ───────────────────── */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-[#fbfbff]">Review Document Classification</h2>
                <p className="text-sm text-[#909094] mt-0.5">AI has suggested document types. Confirm or adjust before analysis.</p>
              </div>
              <div className="space-y-3">
                {classifiedDocs.map((doc) => (
                  <div key={doc.doc_id} className="flex flex-col md:flex-row md:items-center gap-3 p-4 bg-[#1D1D20] rounded-xl border border-[#3f3f46]">
                    <div className="flex items-center gap-3 flex-1 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-[#A1C9F4]/10 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-[#A1C9F4]" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-[#fbfbff] truncate">{doc.file.name}</p>
                        <p className="text-xs text-[#52525b]">AI Confidence: {(doc.confidence * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 min-w-[200px]">
                      <p className="text-xs text-[#909094] font-semibold uppercase tracking-wider">Detected Type</p>
                      <select
                        value={doc.confirmed_type}
                        onChange={(e) => updateDocType(doc.doc_id, e.target.value as DocumentType)}
                        className="bg-[#27272a] border border-[#3f3f46] rounded-lg px-3 py-2 text-sm text-[#fbfbff] focus:outline-none focus:border-[#A1C9F4] transition-colors"
                      >
                        {ALL_DOC_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-2">
                <button onClick={() => setStep(3)} className="text-[#909094] hover:text-[#fbfbff] font-medium px-4 py-2 transition-colors">
                  Back
                </button>
                <button
                  onClick={() => setStep(5)}
                  className="flex items-center gap-2 font-bold px-6 py-2.5 rounded-lg bg-[#A1C9F4] hover:bg-[#8ebbf0] text-[#1D1D20] transition-colors"
                >
                  Confirm & Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 5: Primary Insights ───────────────────────────────── */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-[#fbfbff]">Primary Insights</h2>
                <p className="text-sm text-[#909094] mt-0.5">Qualitative observations that inform the AI credit model</p>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Site Visit Observations", value: siteVisitNotes, onChange: setSiteVisitNotes, placeholder: "e.g. Factory operating at 40% capacity, equipment in good condition…" },
                  { label: "Management Interview Notes", value: managementNotes, onChange: setManagementNotes, placeholder: "e.g. Demand recovery expected next quarter, promoter highly experienced…" },
                  { label: "Operational Concerns", value: operationalObservations, onChange: setOperationalObservations, placeholder: "e.g. Inventory movement slow, receivables aging beyond 90 days…" },
                ].map(({ label, value, onChange, placeholder }) => (
                  <div key={label} className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#909094] uppercase tracking-wider">{label}</label>
                    <textarea
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      placeholder={placeholder}
                      rows={3}
                      className="w-full bg-[#1D1D20] border border-[#3f3f46] rounded-lg px-3 py-2.5 text-sm text-[#fbfbff] placeholder-[#52525b] focus:outline-none focus:border-[#A1C9F4] transition-colors resize-none"
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-2">
                <button onClick={() => setStep(4)} className="text-[#909094] hover:text-[#fbfbff] font-medium px-4 py-2 transition-colors">
                  Back
                </button>
                <button
                  onClick={startAnalysis}
                  disabled={!companyName || !promoterName || !loanAmount}
                  className="flex items-center gap-2 font-bold px-6 py-2.5 rounded-lg bg-[#A1C9F4] hover:bg-[#8ebbf0] text-[#1D1D20] transition-colors"
                >
                  <SparklesIcon className="w-4 h-4" /> Run Credit Analysis
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer note */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-[#8DE5A1]/10 border border-[#8DE5A1]/20 max-w-xl mx-auto">
          <CheckCircle2 className="w-4 h-4 text-[#8DE5A1] shrink-0 mt-0.5" />
          <p className="text-xs text-[#8DE5A1]">
            All data is processed entirely by the Zerve AI Credit Officer engine. No manual scoring is applied.
          </p>
        </div>
      </div>
    </div>
  );
}
