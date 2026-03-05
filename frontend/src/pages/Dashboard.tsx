import React, { useState } from 'react';
import { useCreditData, DataLoading } from '../hooks/useCreditData';
import { DecisionVerdict } from '../components/dashboard/DecisionVerdict';
import { CreditOfficerSummary } from '../components/dashboard/CreditOfficerSummary';
import { FiveCsScorecard } from '../components/dashboard/FiveCsScorecard';
import { FinancialHealth } from '../components/dashboard/FinancialHealth';
import { RevenueSynthesis } from '../components/dashboard/RevenueSynthesis';
import { GSTAnalytics } from '../components/dashboard/GSTAnalytics';
import { NetworkGraph } from '../components/dashboard/NetworkGraph';
import { MPBFCalculator } from '../components/dashboard/MPBFCalculator';
import { RiskIntelligence } from '../components/dashboard/RiskIntelligence';
import { WhyBox } from '../components/dashboard/WhyBox';
import {
    Building2, Hash, CreditCard, Shield,
    ToggleLeft, ToggleRight, CheckCircle2,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
    const { data, loading } = useCreditData();
    const [committeeMode, setCommitteeMode] = useState(false);

    if (loading || !data) return <DataLoading />;

    const d = data.ai_decision;
    const b = data.borrower_details;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Sticky Decision Bar */}
            <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 px-4 sm:px-6 py-3 mb-0 bg-navy-950/90 backdrop-blur-xl border-b border-white/[0.06]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${d.verdict === 'Approve'
                            ? 'bg-emerald-500/15 border border-emerald-500/30'
                            : 'bg-alert-500/15 border border-alert-500/30'
                            }`}>
                            <div className={`w-2.5 h-2.5 rounded-full ${d.verdict === 'Approve' ? 'bg-emerald-400' : 'bg-alert-400'
                                } animate-pulse`} />
                            <span className={`text-sm font-bold ${d.verdict === 'Approve' ? 'text-emerald-400' : 'text-alert-400'
                                }`}>
                                {d.verdict.toUpperCase()}
                            </span>
                        </div>
                        <span className="text-sm text-white font-medium">₹{d.suggested_limit} Cr</span>
                        <span className="text-xs text-slate-500 hidden sm:inline">|</span>
                        <span className="text-xs text-slate-400 hidden sm:inline">Risk {b.cibil_rating}</span>
                        <span className="text-xs text-slate-500 hidden sm:inline">|</span>
                        <span className="text-xs text-slate-400 hidden sm:inline">MCLR + {d.risk_premium}%</span>
                    </div>
                    <button
                        onClick={() => setCommitteeMode(!committeeMode)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors self-start sm:self-auto"
                    >
                        {committeeMode
                            ? <ToggleRight className="w-4 h-4 text-emerald-400" />
                            : <ToggleLeft className="w-4 h-4 text-slate-500" />
                        }
                        <span className="text-xs text-slate-300">Committee View</span>
                    </button>
                </div>
            </div>

            {/* Company Header */}
            <div className="glass-card !py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <Building2 className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white">{b.name}</h1>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-0.5">
                            <span className="flex items-center gap-1 text-[11px] text-slate-500">
                                <Hash className="w-3 h-3" /> CIN: {b.cin}
                            </span>
                            <span className="text-[11px] text-slate-600 hidden sm:inline">|</span>
                            <span className="text-[11px] text-slate-500">GSTIN: {b.gstin}</span>
                            <span className="text-[11px] text-slate-600 hidden sm:inline">|</span>
                            <span className="text-[11px] text-slate-500">{b.sector}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block">CIBIL Score</span>
                        <div className="flex items-center gap-1.5 justify-end">
                            <Shield className="w-4 h-4 text-amber-400" />
                            <span className="text-lg font-bold text-white">{b.cibil_score}</span>
                            <span className="text-xs text-amber-400">({b.cibil_rating})</span>
                        </div>
                    </div>
                    <div className="w-px h-10 bg-white/10" />
                    <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Loan Requested</span>
                        <div className="flex items-center gap-1 justify-end">
                            <CreditCard className="w-4 h-4 text-cyan-400" />
                            <span className="text-lg font-bold text-white">₹{b.loan_requested} Cr</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 1. DECISION */}
            <DecisionVerdict />

            {/* Sanction Conditions */}
            <div className="glass-card !py-4">
                <h3 className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-3">Sanction Conditions</h3>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    {d.conditions.slice(0, 2).map((condition, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>{i + 1} {condition}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. FIVE Cs */}
            <FiveCsScorecard />

            {committeeMode ? (
                <>
                    <CreditOfficerSummary />
                    <RiskIntelligence />
                </>
            ) : (
                <>
                    <CreditOfficerSummary />
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <RiskIntelligence />
                        <WhyBox />
                    </div>
                    <FinancialHealth />
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <RevenueSynthesis />
                        <GSTAnalytics />
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <NetworkGraph />
                        <MPBFCalculator />
                    </div>
                </>
            )}
        </div>
    );
};
