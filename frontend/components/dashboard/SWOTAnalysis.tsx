import { Target, AlertTriangle, Lightbulb, ShieldAlert } from "lucide-react";

export default function SWOTAnalysis({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
          <Target className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">GenAI SWOT Analysis</h2>
          <p className="text-sm text-slate-500">Synthesized from Financials & OSINT</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-semibold text-emerald-900 dark:text-emerald-300">Strengths</h3>
          </div>
          <ul className="space-y-2">
            {data.strengths.map((item: string, idx: number) => (
              <li key={idx} className="text-sm text-emerald-800 dark:text-emerald-400/90 flex items-start gap-2">
                <span className="mt-1.5 w-1 h-1 bg-emerald-500 rounded-full shrink-0"></span> {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h3 className="font-semibold text-amber-900 dark:text-amber-300">Weaknesses</h3>
          </div>
          <ul className="space-y-2">
            {data.weaknesses.map((item: string, idx: number) => (
              <li key={idx} className="text-sm text-amber-800 dark:text-amber-400/90 flex items-start gap-2">
                <span className="mt-1.5 w-1 h-1 bg-amber-500 rounded-full shrink-0"></span> {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Opportunities */}
        <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-blue-900 dark:text-blue-300">Opportunities</h3>
          </div>
          <ul className="space-y-2">
            {data.opportunities.map((item: string, idx: number) => (
              <li key={idx} className="text-sm text-blue-800 dark:text-blue-400/90 flex items-start gap-2">
                <span className="mt-1.5 w-1 h-1 bg-blue-500 rounded-full shrink-0"></span> {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Threats */}
        <div className="bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <h3 className="font-semibold text-rose-900 dark:text-rose-300">Threats</h3>
          </div>
          <ul className="space-y-2">
            {data.threats.map((item: string, idx: number) => (
              <li key={idx} className="text-sm text-rose-800 dark:text-rose-400/90 flex items-start gap-2">
                <span className="mt-1.5 w-1 h-1 bg-rose-500 rounded-full shrink-0"></span> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
