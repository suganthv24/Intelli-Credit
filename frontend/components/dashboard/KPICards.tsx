interface RiskData {
  loan_decision: string;
  risk_probability: number;
  recommended_limit: number;
  interest_rate: number;
}

interface KPICardsProps {
  data: RiskData;
}

export default function KPICards({ data }: KPICardsProps) {
  // Format currency
  const limitFormatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    notation: "compact",
    compactDisplay: "short"
  }).format(data.recommended_limit);

  return (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Loan Decision</p>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${data.loan_decision === "PENDING" ? "bg-amber-400 animate-pulse" : data.loan_decision === "PROCEED" ? "bg-emerald-500" : "bg-red-500"}`}></span>
          <h3 className="text-2xl font-bold capitalize">{data.loan_decision.toLowerCase()}</h3>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Risk Probability</p>
        <h3 className={`text-2xl font-bold ${data.risk_probability < 0.4 ? 'text-emerald-500' : 'text-amber-500'}`}>
          {(data.risk_probability * 100).toFixed(0)}%
        </h3>
      </div>
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Recommended Limit</p>
        <h3 className="text-2xl font-bold">{limitFormatted}</h3>
      </div>
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Interest Rate</p>
        <h3 className="text-2xl font-bold">{data.interest_rate}%</h3>
      </div>
    </section>
  );
}
