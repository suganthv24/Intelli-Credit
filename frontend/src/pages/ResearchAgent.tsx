import React, { useState } from 'react';
import {
    Scale, FileWarning, AlertTriangle,
    ExternalLink, Clock, Activity, Building, FileText,
    Plus, ChevronRight,
} from 'lucide-react';
import { useCreditData, DataLoading } from '../hooks/useCreditData';

export const ResearchAgent: React.FC = () => {
    const { data, loading } = useCreditData();
    const [siteVisitNote, setSiteVisitNote] = useState('');
    const [riskAdjustment, setRiskAdjustment] = useState(0);

    if (loading || !data) return <DataLoading />;

    const overallScore = Math.round(data.five_cs.reduce((s, c) => s + c.score, 0) / data.five_cs.length) + riskAdjustment;

    const handleSiteVisitChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setSiteVisitNote(e.target.value);
        // Simulate real-time risk adjustment from site visit observations
        const len = e.target.value.length;
        if (len > 100) setRiskAdjustment(-3); // Negative finding
        else if (len > 50) setRiskAdjustment(-1);
        else setRiskAdjustment(0);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-xl font-bold text-white uppercase tracking-wide">Risk Intelligence & Research</h1>
                <p className="text-sm text-slate-400 mt-1">e-Courts, MCA filings, and dynamic risk scoring</p>
            </div>

            {/* Dynamic Risk Score */}
            <div className="glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black ${overallScore >= 80 ? 'bg-emerald-500/15 text-emerald-400' :
                        overallScore >= 65 ? 'bg-amber-500/15 text-amber-400' : 'bg-alert-500/15 text-alert-400'
                        }`}>
                        {overallScore}
                    </div>
                    <div>
                        <span className="text-sm font-bold text-white">AI Risk Score</span>
                        <p className="text-xs text-slate-400">Aggregated from Five Cs, litigation, MCA, and field visit data</p>
                        {riskAdjustment !== 0 && (
                            <span className="text-[10px] text-amber-400">↓ Adjusted by {riskAdjustment} pts (site visit input)</span>
                        )}
                    </div>
                </div>
                <Activity className="w-6 h-6 text-cyan-400 hidden sm:block" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* e-Courts Litigation */}
                <div className="glass-card">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-alert-500/10 flex items-center justify-center">
                            <Scale className="w-5 h-5 text-alert-400" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-white uppercase tracking-wider">e-Courts Litigation</h2>
                            <span className="text-xs text-slate-500">CNR-based case tracking</span>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {data.litigation_records.map((lit, i) => (
                            <div key={i} className={`p-4 rounded-xl border ${lit.status === 'Pending'
                                ? 'bg-alert-500/[0.04] border-alert-500/15'
                                : 'bg-white/[0.02] border-white/[0.05]'
                                }`}>
                                <div className="flex items-start justify-between mb-2">
                                    <span className="text-sm font-bold text-white">{lit.case_type}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${lit.status === 'Pending'
                                        ? 'bg-alert-500/15 text-alert-400 border border-alert-500/20'
                                        : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                        }`}>{lit.status}</span>
                                </div>
                                <div className="space-y-1 text-xs text-slate-400">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-slate-500 w-12 shrink-0">CNR:</span>
                                        <span className="text-cyan-400 font-mono">{lit.cnr}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-slate-500 w-12 shrink-0">Court:</span>
                                        <span>{lit.court}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-slate-500 w-12 shrink-0">Claim:</span>
                                        <span className="text-white font-semibold">₹{lit.claim_amount} Cr</span>
                                    </div>
                                    <p className="text-slate-400 mt-2">{lit.summary}</p>
                                    {lit.next_hearing && (
                                        <div className="flex items-center gap-1.5 mt-2 text-amber-400">
                                            <Clock className="w-3 h-3" /> Next hearing: {lit.next_hearing}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/[0.04]">
                                    <span className="text-[10px] text-slate-500">{lit.petitioner} vs {lit.respondent}</span>
                                    <ExternalLink className="w-3 h-3 text-slate-500 ml-auto cursor-pointer hover:text-cyan-400 transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] text-alert-400 mt-3 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Score reduced due to pending suit in {data.litigation_records[0]?.court}
                    </p>
                </div>

                {/* MCA Filings */}
                <div className="glass-card">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <Building className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-white uppercase tracking-wider">MCA Filing Alerts</h2>
                            <span className="text-xs text-slate-500">Corporate governance signals</span>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {data.mca_filings.map((filing, i) => (
                            <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0 mt-0.5">
                                        <FileText className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-white">{filing.form}</span>
                                            <span className="text-[10px] text-slate-500">{filing.date}</span>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">{filing.description}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-600 shrink-0 mt-1" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Early Warning Signals */}
                    <div className="mt-6 pt-4 border-t border-white/[0.05]">
                        <h3 className="text-[11px] font-semibold text-alert-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <FileWarning className="w-3.5 h-3.5" /> Early Warning Signals
                        </h3>
                        {data.risk_flags.filter(f => f.severity === 'critical' || f.severity === 'warning').slice(0, 3).map(flag => (
                            <div key={flag.id} className="flex items-start gap-2 mb-2 text-xs">
                                {flag.severity === 'critical'
                                    ? <AlertTriangle className="w-3.5 h-3.5 text-alert-400 mt-0.5 shrink-0" />
                                    : <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                                }
                                <div>
                                    <span className="text-white font-medium">{flag.title}</span>
                                    <span className="text-slate-500 block">{flag.description}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Site Visit Note Input — changes risk score in real-time */}
            <div className="glass-card">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                        <Plus className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Site Visit Note</h2>
                        <span className="text-xs text-slate-500">Field observations that influence the risk score in real-time</span>
                    </div>
                </div>
                <textarea
                    value={siteVisitNote}
                    onChange={handleSiteVisitChange}
                    rows={4}
                    className="w-full p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 transition-colors resize-none"
                    placeholder="Enter site visit observations... (e.g., 'Factory utilization appears lower than reported. Stock discrepancy noted in raw material yard.')"
                />
                {siteVisitNote.length > 0 && (
                    <div className="mt-3 p-3 rounded-lg bg-amber-500/[0.04] border border-amber-500/15">
                        <div className="flex items-center gap-2 text-xs">
                            <Activity className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-amber-400 font-semibold">Live Risk Adjustment: {riskAdjustment} pts</span>
                            <span className="text-slate-500 ml-2">→ New Score: {overallScore}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
