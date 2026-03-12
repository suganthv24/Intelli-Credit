"use client";

import { LitigationRecord } from "@/store/creditStore";
import { Scale, User, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Props {
  litigationRecords: LitigationRecord[];
  directorRiskScore?: number;
  legalRiskSummary?: string;
}

const severityColors: Record<string, string> = {
  HIGH: "text-[#f04438] bg-[#f04438]/10 border-[#f04438]/20",
  MEDIUM: "text-[#FBBF24] bg-[#FBBF24]/10 border-[#FBBF24]/20",
  LOW: "text-[#8DE5A1] bg-[#8DE5A1]/10 border-[#8DE5A1]/20",
};

function ScoreBar({ label, value }: { label: string; value: number }) {
  const capped = Math.min(Math.max(value, 0), 100);
  const color = capped > 65 ? "#f04438" : capped > 40 ? "#FBBF24" : "#8DE5A1";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#909094]">{label}</span>
        <span className="text-xs font-bold" style={{ color }}>{capped.toFixed(0)}/100</span>
      </div>
      <div className="h-2 bg-[#27272a] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${capped}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function LegalMcaPanel({ litigationRecords, directorRiskScore, legalRiskSummary }: Props) {
  const records = litigationRecords || [];

  return (
    <div className="bg-[#18181B] border border-[#27272a] rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-[#fbfbff] flex items-center gap-2">
          <Scale className="w-4 h-4 text-[#A1C9F4]" /> Legal & MCA Intelligence
        </h3>
        {records.length === 0 && (
          <div className="flex items-center gap-1.5 text-xs text-[#8DE5A1]">
            <CheckCircle2 className="w-3.5 h-3.5" /> No Litigation Found
          </div>
        )}
      </div>

      {/* Director Risk Score */}
      {directorRiskScore !== undefined && (
        <ScoreBar label="Director Risk Score" value={directorRiskScore} />
      )}

      {/* Legal Risk Summary */}
      {legalRiskSummary && (
        <div className="p-3 rounded-lg bg-[#1D1D20] border border-[#3f3f46]">
          <p className="text-xs text-[#d4d4d8] leading-relaxed">{legalRiskSummary}</p>
        </div>
      )}

      {/* Litigation Records */}
      {records.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-[#909094] uppercase tracking-wider">
            {records.length} Litigation Record{records.length !== 1 ? "s" : ""} Found
          </p>
          {records.map((rec, i) => (
            <div key={i} className="p-3 rounded-xl bg-[#1D1D20] border border-[#3f3f46] space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Scale className="w-3.5 h-3.5 text-[#909094] shrink-0" />
                  <span className="text-xs font-semibold text-[#fbfbff]">{rec.case_type || "Legal Case"}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${severityColors[rec.status?.toUpperCase() ?? "MEDIUM"] || severityColors.MEDIUM}`}>
                  {rec.status}
                </span>
              </div>
              {rec.description && <p className="text-xs text-[#909094] leading-relaxed">{rec.description}</p>}
              <div className="flex items-center gap-4 text-[10px] text-[#52525b]">
                {rec.case_id && <span>Case: {rec.case_id}</span>}
                {rec.filing_date && <span>Filed: {rec.filing_date}</span>}
                {rec.amount_involved !== undefined && <span>₹{(rec.amount_involved / 1e5).toFixed(1)}L involved</span>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-[#8DE5A1]/5 border border-[#8DE5A1]/20 text-center">
          <CheckCircle2 className="w-6 h-6 text-[#8DE5A1] mx-auto mb-1" />
          <p className="text-xs text-[#8DE5A1]">No litigation records identified for this entity</p>
        </div>
      )}
    </div>
  );
}
