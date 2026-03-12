import { Clock, Activity, FileText, CheckCircle2, Search, Database, Scale, ShieldAlert, Cpu, FileSignature } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineStep {
  step: string;
  timestamp: string;
  description: string;
}

interface AITimelineProps {
  timeline: TimelineStep[];
  className?: string;
}

const STEP_ICONS: Record<string, React.ReactNode> = {
  document_intelligence: <FileText className="w-4 h-4 text-[#A1C9F4]" />,
  financial_extraction: <Database className="w-4 h-4 text-[#A1C9F4]" />,
  cross_document_financial_reasoning: <Activity className="w-4 h-4 text-[#ffd400]" />,
  fraud_detection: <ShieldAlert className="w-4 h-4 text-[#f04438]" />,
  web_research: <Search className="w-4 h-4 text-[#A1C9F4]" />,
  regulatory_compliance_check: <Scale className="w-4 h-4 text-[#FFB482]" />,
  risk_model: <Cpu className="w-4 h-4 text-[#8DE5A1]" />,
  explainability: <Activity className="w-4 h-4 text-[#A1C9F4]" />,
  cam_generator: <FileSignature className="w-4 h-4 text-[#8DE5A1]" />,
};

const STEP_COLORS: Record<string, string> = {
  document_intelligence: "#A1C9F4",
  financial_extraction: "#A1C9F4",
  cross_document_financial_reasoning: "#ffd400",
  fraud_detection: "#f04438",
  web_research: "#A1C9F4",
  regulatory_compliance_check: "#FFB482",
  risk_model: "#8DE5A1",
  explainability: "#A1C9F4",
  cam_generator: "#8DE5A1",
};

export function AITimeline({ timeline, className }: AITimelineProps) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className={cn("w-full h-full flex flex-col items-center justify-center p-8 bg-[#27272a]/30 rounded-xl", className)}>
        <p className="text-[#909094]">No timeline data available</p>
      </div>
    );
  }

  return (
    <div className={cn("w-full h-full flex flex-col", className)}>
      <div className="mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-[#fbfbff]" />
        <h3 className="text-lg font-bold text-[#fbfbff]">AI Reasoning Timeline</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 relative">
        <div className="absolute left-4 top-2 bottom-2 w-px bg-[#3f3f46]" />
        
        <div className="space-y-4">
          {timeline.map((item, idx) => {
            const icon = (item.step && STEP_ICONS[item.step]) || <CheckCircle2 className="w-4 h-4 text-[#8DE5A1]" />;
            const color = (item.step && STEP_COLORS[item.step]) || "#8DE5A1";
            const formattedStep = item.step 
              ? item.step.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
              : "Analysis Step";

            return (
              <div key={idx} className="relative pl-10">
                <div className="absolute left-1.5 top-1 w-5 h-5 rounded-full bg-[#1D1D20] border-2 flex items-center justify-center z-10" style={{ borderColor: color }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                </div>
                
                <div className="bg-[#27272a]/50 border border-[#3f3f46] rounded-lg p-3">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      {icon}
                      <span className="font-bold text-sm text-[#fbfbff]">{formattedStep}</span>
                    </div>
                    <span className="text-xs text-[#909094] font-mono">{item.timestamp}</span>
                  </div>
                  <p className="text-sm text-[#909094]">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
