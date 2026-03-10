import { Globe, FileSearch, Scale } from "lucide-react";

interface ExternalIntelligenceProps {
  researchData: {
    news_summary: string;
    sector_risk: string;
    litigation_cases: number;
  };
}

export default function ExternalIntelligence({ researchData }: ExternalIntelligenceProps) {
  return (
    <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
      <h3 className="font-bold flex items-center gap-2 mb-6">
        <Globe className="h-5 w-5 text-primary" /> External Intelligence
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* News Summary */}
        <div className="md:col-span-2 space-y-2">
          <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-500 tracking-wider">
            <FileSearch className="h-4 w-4" /> Market News Summary
          </h4>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
            {researchData?.news_summary || "No recent market news accessed."}
          </p>
        </div>

        {/* Sector & Litigation Risk */}
        <div className="space-y-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-1">Sector Risk</p>
              <p className="text-base font-bold">{researchData?.sector_risk || "Unknown"}</p>
            </div>
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${researchData?.sector_risk === "High" ? "bg-red-100 text-red-600" : researchData?.sector_risk === "Moderate" ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"}`}>
              <Globe className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-1">Litigation Cases</p>
              <p className="text-base font-bold">{researchData?.litigation_cases ?? 0}</p>
            </div>
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${(researchData?.litigation_cases || 0) > 0 ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"}`}>
              <Scale className="h-5 w-5" />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
