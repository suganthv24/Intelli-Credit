import { AlertTriangle, AlertCircle, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FraudFlag {
  flag_id: string;
  flag_name: string;
  description: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  doc_id?: string;
}

interface FraudPanelProps {
  flags: FraudFlag[];
  cross_doc_fraud_signals?: string[];
  className?: string;
}

export function FraudPanel({ flags, cross_doc_fraud_signals = [], className }: FraudPanelProps) {
  if (!flags || flags.length === 0) {
    return (
      <div className={cn("w-full h-full flex flex-col items-center justify-center p-8 border border-[#3f3f46] rounded-xl bg-[#27272a]/30", className)}>
        <div className="w-12 h-12 rounded-full bg-[#8DE5A1]/20 flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6 text-[#8DE5A1]" />
        </div>
        <h3 className="text-lg font-bold text-[#fbfbff] mb-1">No Fraud Signals</h3>
        <p className="text-sm text-[#909094] text-center max-w-xs">Cross-validation checks passed successfully. Financial metrics appear consistent.</p>
      </div>
    );
  }

  // Sort flags by severity
  const sortedFlags = [...flags].sort((a, b) => {
    if (a.severity === "HIGH" && b.severity !== "HIGH") return -1;
    if (a.severity !== "HIGH" && b.severity === "HIGH") return 1;
    if (a.severity === "MEDIUM" && b.severity === "LOW") return -1;
    if (a.severity === "LOW" && b.severity === "MEDIUM") return 1;
    return 0;
  });

  return (
    <div className={cn("w-full h-full flex flex-col", className)}>
      <div className="flex items-center gap-2 mb-4">
        <ShieldAlert className="w-5 h-5 text-[#f04438]" />
        <h3 className="text-lg font-bold text-[#fbfbff]">Fraud Detection</h3>
        <span className="ml-auto bg-[#f04438]/20 text-[#f04438] text-xs font-bold px-2 py-0.5 rounded-full">
          {flags.length + cross_doc_fraud_signals.length} DETECTED
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {cross_doc_fraud_signals.map((signal, idx) => (
          <div key={`cross-${idx}`} className="p-4 rounded-lg border bg-[#f04438]/10 border-[#f04438]/30">
            <div className="flex justify-between items-start mb-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#f04438]" />
                <span className="font-bold text-[#fbfbff] text-sm">Cross-Document Conflict</span>
              </div>
              <span className="text-[10px] font-black tracking-wider px-1.5 py-0.5 rounded uppercase bg-[#f04438] text-white">
                CRITICAL
              </span>
            </div>
            <p className="text-sm text-[#909094] mt-2 pl-6">{signal}</p>
          </div>
        ))}
        {sortedFlags.map((flag, idx) => (
          <div 
            key={`${flag.flag_id}-${idx}`}
            className={cn(
              "p-4 rounded-lg border",
              flag.severity === "HIGH" 
                ? "bg-[#f04438]/10 border-[#f04438]/30" 
                : flag.severity === "MEDIUM"
                ? "bg-[#ffd400]/10 border-[#ffd400]/30"
                : "bg-[#8DE5A1]/10 border-[#8DE5A1]/30"
            )}
          >
            <div className="flex justify-between items-start mb-1">
              <div className="flex items-center gap-2">
                <AlertTriangle 
                  className={cn("w-4 h-4", 
                    flag.severity === "HIGH" ? "text-[#f04438]" : 
                    flag.severity === "MEDIUM" ? "text-[#ffd400]" : "text-[#8DE5A1]"
                  )} 
                />
                <span className="font-bold text-[#fbfbff] text-sm">{flag.flag_name}</span>
              </div>
              <span className={cn(
                "text-[10px] font-black tracking-wider px-1.5 py-0.5 rounded uppercase",
                flag.severity === "HIGH" ? "bg-[#f04438] text-white" : 
                flag.severity === "MEDIUM" ? "bg-[#ffd400] text-[#1D1D20]" : "bg-[#8DE5A1] text-[#1D1D20]"
              )}>
                {flag.severity}
              </span>
            </div>
            
            <p className="text-sm text-[#909094] mt-2 pl-6">{flag.description}</p>
            
            {flag.doc_id && (
              <div className="mt-3 pl-6 flex items-center gap-1.5 text-xs text-[#909094]">
                <span className="px-1.5 py-0.5 bg-[#1D1D20] border border-[#3f3f46] rounded font-mono">
                  {flag.doc_id.length > 20 ? flag.doc_id.substring(0, 20) + '...' : flag.doc_id}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
