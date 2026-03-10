import { ShieldCheck, Crosshair, AlertOctagon } from "lucide-react";

interface FraudDetectionProps {
  fraudFlag: boolean;
}

export default function FraudDetection({ fraudFlag }: FraudDetectionProps) {
  const isClean = !fraudFlag;
  const isWarning = fraudFlag;
  const colorClass = isClean ? 'text-emerald-500' : 'text-red-500';
  const strokeColor = isClean ? '#10b981' : '#ef4444';
  const dashOffset = isClean ? 0 : 300;
  
  const status = isClean ? "CLEAN" : "SUSPICIOUS";

  return (
    <div className="md:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center h-full">
      <h3 className="text-sm font-semibold text-slate-500 uppercase mb-6">Fraud Detection</h3>
      <div className="relative w-40 h-40 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle className="text-slate-100 dark:text-slate-800" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="8"></circle>
          <circle 
            className="transition-all duration-1000 ease-in-out" 
            cx="80" cy="80" fill="transparent" r="70" 
            stroke={strokeColor} 
            strokeDasharray="440" 
            strokeDashoffset={dashOffset} 
            strokeWidth="8">
          </circle>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isClean && <ShieldCheck className={`h-8 w-8 mb-1 ${colorClass}`} />}
          {isWarning && <Crosshair className={`h-8 w-8 mb-1 ${colorClass}`} />}
          {!isClean && !isWarning && <AlertOctagon className={`h-8 w-8 mb-1 ${colorClass}`} />}
          <span className="text-lg font-bold">{status}</span>
          <span className="text-[10px] text-slate-400 mt-1">STATUS</span>
        </div>
      </div>
      <p className="text-xs text-slate-400 mt-4 leading-relaxed">
        {isClean ? "No red flags detected in credit bureau or public records." : "Some inconsistencies found across provided documents. Review required."}
      </p>
    </div>
  );
}
