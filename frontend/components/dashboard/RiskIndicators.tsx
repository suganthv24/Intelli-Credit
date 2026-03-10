import { AlertTriangle, TrendingUp } from "lucide-react";

interface RiskIndicatorsProps {
  explanation: {
    risk_factors: string[];
    positive_signals: string[];
  };
}

export default function RiskIndicators({ explanation }: RiskIndicatorsProps) {
  return (
    <div className="md:col-span-2 space-y-4 h-full flex flex-col justify-between">
      <div className="bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-5 rounded-xl flex-1">
        <h4 className="text-red-700 dark:text-red-400 text-sm font-bold flex items-center gap-2 mb-3">
          <AlertTriangle className="h-4 w-4" /> Primary Risk Drivers
        </h4>
        <ul className="space-y-2">
          {explanation?.risk_factors?.map((factor, idx) => (
            <li key={idx} className="text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></span> {factor}
            </li>
          ))}
          {(!explanation?.risk_factors || explanation.risk_factors.length === 0) && (
            <li className="text-xs text-slate-500 italic">No significant risk factors identified.</li>
          )}
        </ul>
      </div>
      <div className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 p-5 rounded-xl flex-1 mt-4">
        <h4 className="text-emerald-700 dark:text-emerald-400 text-sm font-bold flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4" /> Positive Indicators
        </h4>
        <ul className="space-y-2">
          {explanation?.positive_signals?.map((signal, idx) => (
            <li key={idx} className="text-xs text-emerald-600 dark:text-emerald-300 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span> {signal}
            </li>
          ))}
          {(!explanation?.positive_signals || explanation.positive_signals.length === 0) && (
            <li className="text-xs text-slate-500 italic">No positive signals available yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
