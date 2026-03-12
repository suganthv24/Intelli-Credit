"use client";

import { PrimaryInsightOutput } from "@/store/creditStore";
import { ClipboardList, Activity, Users, Factory } from "lucide-react";

interface Props {
  insights: PrimaryInsightOutput;
  siteVisitNotes?: string;
  managementNotes?: string;
  operationalObservations?: string;
}

function ScoreCircle({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  const capped = Math.min(Math.max(value ?? 0, 0), 100);
  const color = capped > 70 ? "#8DE5A1" : capped > 40 ? "#FBBF24" : "#f04438";
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (capped / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={r} fill="none" stroke="#27272a" strokeWidth="5" />
          <circle
            cx="36" cy="36" r={r} fill="none"
            stroke={color} strokeWidth="5"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-base font-bold text-[#fbfbff]">{capped.toFixed(0)}</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-[11px] text-[#909094]">
        <Icon className="w-3 h-3" />
        {label}
      </div>
    </div>
  );
}

export default function InsightPanel({ insights, siteVisitNotes, managementNotes, operationalObservations }: Props) {
  const hasScores =
    insights.operational_risk_score !== undefined ||
    insights.management_quality_score !== undefined ||
    insights.capacity_utilization_estimate !== undefined;

  return (
    <div className="bg-[#18181B] border border-[#27272a] rounded-2xl p-6 space-y-5">
      <h3 className="text-base font-bold text-[#fbfbff] flex items-center gap-2">
        <ClipboardList className="w-4 h-4 text-[#A1C9F4]" /> Primary Insight Analysis
      </h3>

      {/* Score circles */}
      {hasScores && (
        <div className="flex items-center justify-around py-2">
          {insights.operational_risk_score !== undefined && (
            <ScoreCircle label="Operational Risk" value={insights.operational_risk_score} icon={Factory} />
          )}
          {insights.management_quality_score !== undefined && (
            <ScoreCircle label="Mgmt. Quality" value={insights.management_quality_score} icon={Users} />
          )}
          {insights.capacity_utilization_estimate !== undefined && (
            <ScoreCircle label="Capacity Util." value={insights.capacity_utilization_estimate} icon={Activity} />
          )}
        </div>
      )}

      {/* Key observations from AI */}
      {(insights.key_observations ?? []).length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[#909094] uppercase tracking-wider">AI Observations</p>
          {(insights.key_observations ?? []).map((obs, i) => (
            <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-[#1D1D20] border border-[#3f3f46]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#A1C9F4] shrink-0 mt-1.5" />
              <p className="text-xs text-[#d4d4d8] leading-relaxed">{obs}</p>
            </div>
          ))}
        </div>
      )}

      {/* Original credit officer notes (echoed back) */}
      {(siteVisitNotes || managementNotes || operationalObservations) && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[#909094] uppercase tracking-wider">Credit Officer Notes</p>
          {[
            { label: "Site Visit", text: siteVisitNotes },
            { label: "Management", text: managementNotes },
            { label: "Operations", text: operationalObservations },
          ].filter((n) => n.text).map(({ label, text }) => (
            <div key={label} className="p-3 rounded-lg bg-[#1D1D20] border border-[#3f3f46]">
              <p className="text-[10px] font-bold text-[#52525b] uppercase mb-1">{label}</p>
              <p className="text-xs text-[#d4d4d8] leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      )}

      {!hasScores && !(insights.key_observations ?? []).length && !siteVisitNotes && !managementNotes && !operationalObservations && (
        <p className="text-xs text-[#52525b] text-center italic py-4">No qualitative insights available from this analysis.</p>
      )}
    </div>
  );
}
