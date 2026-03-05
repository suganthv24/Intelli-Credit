import React from 'react';
import { FileText, TrendingUp, TrendingDown } from 'lucide-react';
import { useCreditData, DataLoading } from '../../hooks/useCreditData';

export const WhyBox: React.FC = () => {
    const { data, loading } = useCreditData();
    if (loading || !data) return <DataLoading />;

    const d = data.ai_decision;
    const b = data.borrower_details;
    const shap = data.shap_explanations;
    const positiveFactors = shap.filter(s => s.direction === 'positive');
    const negativeFactors = shap.filter(s => s.direction === 'negative');

    return (
        <div className="glass-card animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">The "Why" — Explainable AI</h2>
                    <span className="text-xs text-slate-500">Human-readable SHAP-style factor analysis</span>
                </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-4">
                <span className="text-emerald-400 font-semibold">Recommended for {d.verdict.toLowerCase()}</span> at ₹{d.suggested_limit} Cr
                ({Math.round((1 - d.suggested_limit / b.loan_requested) * 100)}% below requested limit) due to strong GST flows and adequate collateral coverage.{' '}
                <span className="text-alert-400 font-semibold">Limit reduced</span> primarily due to circular trading patterns detected
                in the transaction network and pending high-value litigation of ₹4.5 Cr from e-Courts data, despite consistent revenue generation.
            </p>

            <div className="space-y-2">
                {positiveFactors.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02]">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-xs text-slate-300">{f.factor}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 rounded-full bg-emerald-500/20 overflow-hidden">
                                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, f.impact * 5)}%` }} />
                            </div>
                            <span className="text-xs text-emerald-400 font-semibold w-10 text-right">+{f.impact}%</span>
                        </div>
                    </div>
                ))}
                {negativeFactors.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02]">
                        <div className="flex items-center gap-2">
                            <TrendingDown className="w-3.5 h-3.5 text-alert-400" />
                            <span className="text-xs text-slate-300">{f.factor}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 rounded-full bg-alert-500/20 overflow-hidden">
                                <div className="h-full rounded-full bg-alert-500" style={{ width: `${Math.min(100, Math.abs(f.impact) * 5)}%` }} />
                            </div>
                            <span className="text-xs text-alert-400 font-semibold w-10 text-right">{f.impact}%</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
