import { Activity, ShieldAlert, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FinancialPanelProps {
  score: number;
  confidence_score?: number;
  flags: { issue: string; severity: string }[];
  className?: string;
}

export function FinancialPanel({ score, confidence_score, flags, className }: FinancialPanelProps) {
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
            <Activity className="w-5 h-5 text-[#fbfbff]" />
            <h3 className="text-lg font-bold text-[#fbfbff]">Financial Consistency</h3>
            {confidence_score !== undefined && (
              <span className="ml-2 bg-[#1D1D20] text-[#909094] border border-[#3f3f46] text-xs font-bold px-2 py-0.5 rounded-full">
                {confidence_score * 100}% Conf.
              </span>
            )}
          </div>
          <p className="text-sm text-[#909094]">Cross-Document Validation</p>
        </div>
        
        <div className="text-right">
          <span className={cn("text-2xl font-black", getScoreColor(score))}>{score}/100</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        <p className="text-xs font-bold text-[#909094] mb-2 uppercase">Discrepancy Flags</p>
        {flags && flags.length > 0 ? (
          <div className="space-y-2">
            {flags.map((flag, idx) => {
              const colorCls = flag.severity === "HIGH" ? "text-[#f04438]" : flag.severity === "MEDIUM" ? "text-[#ffd400]" : "text-[#8DE5A1]";
              
              return (
                <div key={idx} className="flex items-start gap-2 bg-[#1D1D20]/50 p-2 rounded border border-[#3f3f46]">
                  <ShieldAlert className={cn("w-4 h-4 mt-0.5", colorCls)} />
                  <span className="text-sm text-[#fbfbff]">{flag.issue}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 rounded bg-[#8DE5A1]/10 border border-[#8DE5A1]/20">
            <CheckCircle className="w-5 h-5 text-[#8DE5A1]" />
            <p className="text-sm text-[#8DE5A1] font-medium">Financials are mathematically consistent across all documents.</p>
          </div>
        )}
      </div>
    </div>
  );
}
