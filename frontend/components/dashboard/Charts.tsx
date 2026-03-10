interface FinancialData {
  revenue: number[];
  labels: string[];
  gst_sales: number;
  bank_deposits: number;
}

interface ChartsProps {
  data: FinancialData;
}

export default function Charts({ data }: ChartsProps) {
  // Static placeholder chart visuals from Stitch HTML for now
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold">Revenue Growth Trend</h3>
          <span className="text-[10px] text-slate-400 font-mono">FY 2023-24</span>
        </div>
        <div className="h-48 flex items-end gap-2 px-2">
          {data.revenue.map((val, idx) => {
            const maxRev = Math.max(...data.revenue, 1);
            const heightPct = Math.max((val / maxRev) * 100, 5); // min 5% height
            return (
              <div 
                key={idx} 
                className={`flex-1 rounded-t-sm transition-all duration-1000 ${idx === data.revenue.length - 1 ? 'bg-primary' : 'bg-primary/40'}`} 
                style={{ height: `${heightPct}%` }}
                title={`${data.labels[idx] || ''}: ${val}`}
              ></div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 px-2 text-[10px] text-slate-400 uppercase">
          {data.labels.map((lbl, idx) => <span key={idx}>{lbl}</span>)}
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold">GST vs Bank Deposits</h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary"></span><span className="text-[10px] text-slate-400">GST</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-300"></span><span className="text-[10px] text-slate-400">Bank</span></div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary bg-primary/10">
                  Variance: {Math.abs(((data.gst_sales - data.bank_deposits) / Math.max(data.bank_deposits, 1)) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="text-right"><span className="text-xs font-semibold inline-block text-primary">High Correlation</span></div>
            </div>
            
            {/* We show them relative to the max of the two */}
            {(() => {
              const maxVal = Math.max(data.gst_sales, data.bank_deposits, 1);
              const gstPct = (data.gst_sales / maxVal) * 100;
              const bankPct = (data.bank_deposits / maxVal) * 100;
              
              return (
                <div className="overflow-hidden h-4 mb-4 text-xs flex rounded bg-slate-100 dark:bg-slate-800 gap-1">
                  <div className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-1000" style={{ width: `${gstPct}%` }}></div>
                  <div className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-slate-400 dark:bg-slate-600 transition-all duration-1000" style={{ width: `${bankPct}%` }}></div>
                </div>
              );
            })()}
          </div>
          <p className="text-xs text-slate-500 leading-relaxed italic">The banking transactions closely match the declared GST turnover, indicating a low risk of hidden liabilities.</p>
        </div>
      </div>
    </section>
  );
}
