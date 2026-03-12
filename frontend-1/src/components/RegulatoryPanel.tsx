import { Scale, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RegulatoryPanelProps {
  score: number;
  gstRisk: string;
  rbiRisk: string;
  policyFlags: { flag: string; severity: string }[];
  className?: string;
}

export function RegulatoryPanel({ score, gstRisk, rbiRisk, policyFlags, className }: RegulatoryPanelProps) {
  
  const getRiskColor = (risk: string) => {
    switch (risk.toUpperCase()) {
      case "HIGH": return "text-[#f04438] bg-[#f04438]/10 border-[#f04438]/30";
      case "MEDIUM": return "text-[#ffd400] bg-[#ffd400]/10 border-[#ffd400]/30";
      default: return "text-[#8DE5A1] bg-[#8DE5A1]/10 border-[#8DE5A1]/30";
    }
  };

  const getScoreColor = (sc: number) => {
    if (sc >= 80) return "text-[#8DE5A1]";
    if (sc >= 50) return "text-[#ffd400]";
    return "text-[#f04438]";
  };

  return (
    <div className={cn("w-full h-full flex flex-col", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#fbfbff]" />
            <h3 className="text-lg font-bold text-[#fbfbff]">Regulatory Compliance</h3>
          </div>
          <p className="text-sm text-[#909094]">Statutory & Policy Assessment</p>
        </div>
        
        <div className="text-right">
          <span className={cn("text-2xl font-black", getScoreColor(score))}>{score}/100</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className={cn("p-2 rounded-lg border", getRiskColor(gstRisk))}>
          <p className="text-xs uppercase font-bold opacity-80 mb-1">GST Compliance</p>
          <p className="text-sm font-bold">{gstRisk.toUpperCase()}</p>
        </div>
        <div className={cn("p-2 rounded-lg border", getRiskColor(rbiRisk))}>
          <p className="text-xs uppercase font-bold opacity-80 mb-1">RBI Exposure</p>
          <p className="text-sm font-bold">{rbiRisk.toUpperCase()}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        <p className="text-xs font-bold text-[#909094] mb-2 uppercase">Policy Flags</p>
        {policyFlags && policyFlags.length > 0 ? (
          <div className="space-y-2">
            {policyFlags.map((flag, idx) => {
              const Icon = flag.severity === "HIGH" ? AlertTriangle : CheckCircle;
              const colorCls = flag.severity === "HIGH" ? "text-[#f04438]" : flag.severity === "MEDIUM" ? "text-[#ffd400]" : "text-[#8DE5A1]";
              
              return (
                <div key={idx} className="flex items-start gap-2 bg-[#1D1D20]/50 p-2 rounded border border-[#3f3f46]">
                  <Icon className={cn("w-4 h-4 mt-0.5", colorCls)} />
                  <span className="text-sm text-[#fbfbff]">{flag.flag}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-[#8DE5A1]">All policies compliant. No flags detected.</p>
        )}
      </div>
    </div>
  );
}
