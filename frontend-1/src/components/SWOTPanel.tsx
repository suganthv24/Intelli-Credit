"use client";

import { SWOTAnalysis } from "@/store/creditStore";
import { TrendingUp, TrendingDown, Lightbulb, AlertTriangle } from "lucide-react";

interface Props {
  swot: SWOTAnalysis;
}

const sections = [
  {
    key: "strengths"     as const,
    label: "Strengths",
    icon: TrendingUp,
    color: "#8DE5A1",
    bg: "bg-[#8DE5A1]/5",
    border: "border-[#8DE5A1]/20",
    iconColor: "text-[#8DE5A1]",
    dot: "bg-[#8DE5A1]",
  },
  {
    key: "weaknesses"    as const,
    label: "Weaknesses",
    icon: TrendingDown,
    color: "#f04438",
    bg: "bg-[#f04438]/5",
    border: "border-[#f04438]/20",
    iconColor: "text-[#f04438]",
    dot: "bg-[#f04438]",
  },
  {
    key: "opportunities" as const,
    label: "Opportunities",
    icon: Lightbulb,
    color: "#A1C9F4",
    bg: "bg-[#A1C9F4]/5",
    border: "border-[#A1C9F4]/20",
    iconColor: "text-[#A1C9F4]",
    dot: "bg-[#A1C9F4]",
  },
  {
    key: "threats"       as const,
    label: "Threats",
    icon: AlertTriangle,
    color: "#FBBF24",
    bg: "bg-[#FBBF24]/5",
    border: "border-[#FBBF24]/20",
    iconColor: "text-[#FBBF24]",
    dot: "bg-[#FBBF24]",
  },
];

export default function SWOTPanel({ swot }: Props) {
  return (
    <div className="bg-[#18181B] border border-[#27272a] rounded-2xl p-6">
      <h3 className="text-base font-bold text-[#fbfbff] mb-4">SWOT Analysis</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map(({ key, label, icon: Icon, bg, border, iconColor, dot }) => {
          const items: string[] = swot[key] || [];
          return (
            <div key={key} className={`rounded-xl p-4 border ${bg} ${border}`}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`w-4 h-4 ${iconColor}`} />
                <span className={`text-sm font-bold ${iconColor}`}>{label}</span>
                <span className="ml-auto text-xs text-[#52525b]">{items.length}</span>
              </div>
              {items.length === 0 ? (
                <p className="text-xs text-[#52525b] italic">No data returned</p>
              ) : (
                <ul className="space-y-1.5">
                  {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[#d4d4d8]">
                      <span className={`w-1.5 h-1.5 rounded-full ${dot} shrink-0 mt-1.5`} />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
