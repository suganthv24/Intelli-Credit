import React from 'react';
import {
    CheckCircle2, XCircle, Download, Send,
    TrendingUp, TrendingDown, Shield,
} from 'lucide-react';
import { useCreditData, DataLoading } from '../../hooks/useCreditData';

export const DecisionVerdict: React.FC = () => {
    const { data, loading } = useCreditData();
    if (loading || !data) return <DataLoading />;

    const d = data.ai_decision;
    const b = data.borrower_details;
    const shap = data.shap_explanations;
    const isApproved = d.verdict === 'Approve';

    const positiveFactors = shap.filter(s => s.direction === 'positive');
    const negativeFactors = shap.filter(s => s.direction === 'negative');

    return (
        <div className="glass-card animate-slide-up">
            {/* Hero Banner */}
            <div className={`-mx-5 -mt-5 px-6 py-5 rounded-t-xl ${isApproved
                    ? 'bg-gradient-to-r from-emerald-500/15 to-cyan-500/10 border-b border-emerald-500/20'
                    : 'bg-gradient-to-r from-alert-500/15 to-amber-500/10 border-b border-alert-500/20'
                }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isApproved ? 'bg-emerald-500/20' : 'bg-alert-500/20'
                            }`}>
                            {isApproved
                                ? <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                                : <XCircle className="w-8 h-8 text-alert-400" />
                            }
                        </div>
                        <div>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider">AI Decision Verdict</span>
                            <h2 className={`text-3xl font-black tracking-tight ${isApproved ? 'text-emerald-400' : 'text-alert-400'
                                }`}>
                                {d.verdict.toUpperCase()}
                            </h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.06] border border-white/[0.1] text-sm text-slate-300 hover:bg-white/[0.1] transition-colors">
                            <Download className="w-4 h-4" /> Download CAM
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-sm font-semibold text-white hover:opacity-90 transition-opacity">
                            <Send className="w-4 h-4" /> Send to Committee
                        </button>
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">Recommended Limit</span>
                    <div className="text-2xl font-bold text-white mt-1">₹{d.suggested_limit} Cr</div>
                    <span className="text-xs text-amber-400">Requested: ₹{b.loan_requested} Cr ({Math.round((1 - d.suggested_limit / b.loan_requested) * 100)}% reduction)</span>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">Risk Premium</span>
                    <div className="text-2xl font-bold text-white mt-1">MCLR + {d.risk_premium}%</div>
                    <span className="text-xs text-slate-500">Interest margin</span>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">Tenor</span>
                    <div className="text-2xl font-bold text-white mt-1">{d.tenor_months} months</div>
                    <span className="text-xs text-slate-500">With annual review</span>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">Confidence</span>
                    <div className="text-2xl font-bold text-white mt-1">{d.confidence}%</div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 mt-2 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500" style={{ width: `${d.confidence}%` }} />
                    </div>
                </div>
            </div>

            {/* Positive & Negative Signals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                <div>
                    <h4 className="text-[11px] text-emerald-400 uppercase tracking-wider font-semibold mb-3 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" /> Positive Signals
                    </h4>
                    {positiveFactors.map((f, i) => (
                        <div key={i} className="flex items-start gap-2 mb-2">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                            <span className="text-xs text-slate-300">{f.factor} <span className="text-emerald-400 font-semibold">+{f.impact}%</span></span>
                        </div>
                    ))}
                </div>
                <div>
                    <h4 className="text-[11px] text-alert-400 uppercase tracking-wider font-semibold mb-3">Risk Signals</h4>
                    {negativeFactors.map((f, i) => (
                        <div key={i} className="flex items-start gap-2 mb-2">
                            <TrendingDown className="w-3.5 h-3.5 text-alert-400 mt-0.5 shrink-0" />
                            <span className="text-xs text-slate-300">{f.factor} <span className="text-alert-400 font-semibold">{f.impact}%</span></span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
