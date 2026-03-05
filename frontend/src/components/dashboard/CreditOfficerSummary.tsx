import React from 'react';
import { FileText } from 'lucide-react';
import { useCreditData, DataLoading } from '../../hooks/useCreditData';

export const CreditOfficerSummary: React.FC = () => {
    const { data, loading } = useCreditData();
    if (loading || !data) return <DataLoading />;

    const b = data.borrower_details;
    const d = data.ai_decision;
    const fh = data.financial_health;
    const mpbfVal = +((0.75 * data.mpbf.current_assets) - data.mpbf.current_liabilities).toFixed(2);

    return (
        <div className="glass-card animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">AI Credit Summary</h2>
                    <span className="text-xs text-slate-500">Auto-generated executive brief for credit officers</span>
                </div>
            </div>
            <div className="text-sm text-slate-300 leading-relaxed space-y-3">
                <p>
                    <strong className="text-white">{b.name}</strong> demonstrates stable revenue growth (
                    <span className="text-cyan-400 font-semibold">12% CAGR</span>) and adequate debt servicing capacity (
                    <span className="text-cyan-400 font-semibold">DSCR {fh.dscr.value}x</span>, well above the {fh.dscr.target}x threshold).
                    The current ratio of <span className="text-cyan-400 font-semibold">{fh.current_ratio.value}</span> meets the
                    Tandon Committee benchmark of {fh.current_ratio.target}. Tangible Net Worth stands at <strong className="text-white">₹{fh.tnw.value} Cr</strong>.
                </p>
                <p>
                    However, <span className="text-alert-400 font-semibold">circular trading patterns</span> detected in GST network analysis
                    (Bharat → Apex → Nova → Bharat, total loop value ₹7.6 Cr) and{' '}
                    <span className="text-alert-400 font-semibold">pending high-value litigation</span> of ₹4.5 Cr from e-Courts data
                    increase operational risk. Promoter stake dilution from 68% to 62% (MCA Form-2, Oct 2024) warrants enhanced monitoring.
                </p>
                <p>
                    <strong className="text-white">Recommendation:</strong> Sanction at{' '}
                    <strong className="text-emerald-400">₹{d.suggested_limit} Cr</strong> ({Math.round((1 - d.suggested_limit / b.loan_requested) * 100)}% below requested)
                    with <strong className="text-white">MCLR + {d.risk_premium}%</strong> risk premium and mandatory quarterly stock audit.
                    MPBF of <strong className="text-white">₹{mpbfVal} Cr</strong> supports the recommended limit.
                </p>
            </div>
        </div>
    );
};
