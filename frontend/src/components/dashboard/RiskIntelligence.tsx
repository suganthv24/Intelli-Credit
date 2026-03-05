import React from 'react';
import { ShieldAlert, AlertTriangle, AlertCircle, CheckCircle2, Clock, Info } from 'lucide-react';
import { useCreditData, DataLoading } from '../../hooks/useCreditData';

export const RiskIntelligence: React.FC = () => {
    const { data, loading } = useCreditData();
    if (loading || !data) return <DataLoading />;

    const flags = data.risk_flags;
    const criticalFlags = flags.filter(f => f.severity === 'critical');
    const warningFlags = flags.filter(f => f.severity === 'warning');
    const infoFlags = flags.filter(f => f.severity === 'info');
    const positiveSignals = data.shap_explanations.filter(s => s.direction === 'positive');

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical': return <AlertCircle className="w-4 h-4 text-alert-400" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
            default: return <Info className="w-4 h-4 text-cyan-400" />;
        }
    };

    return (
        <div className="glass-card animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-alert-500/10 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5 text-alert-400" />
                </div>
                <div className="flex-1">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">Risk Intelligence</h2>
                    <span className="text-xs text-slate-500">Consolidated risk assessment from all data sources</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-alert-500/10 text-alert-400 border border-alert-500/20 font-semibold">
                        {criticalFlags.length} Critical
                    </span>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                        {warningFlags.length} Warning
                    </span>
                </div>
            </div>

            {/* Critical Risks */}
            {criticalFlags.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-[11px] text-alert-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" /> Critical Risks ({criticalFlags.length})
                    </h4>
                    {criticalFlags.map(flag => (
                        <div key={flag.id} className="p-3 mb-2 rounded-lg bg-alert-500/[0.04] border border-alert-500/15">
                            <div className="flex items-start gap-2">
                                <div className="w-2 h-2 rounded-full bg-alert-400 mt-1.5 shrink-0" />
                                <div>
                                    <span className="text-sm font-bold text-white">{flag.title}</span>
                                    <p className="text-xs text-slate-400 mt-0.5">{flag.description}</p>
                                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-500">
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{flag.date}</span>
                                        <span>• {flag.source}</span>
                                    </div>
                                </div>
                                <span className="shrink-0 text-[10px] px-2 py-0.5 rounded bg-alert-500/15 text-alert-400 border border-alert-500/20 font-semibold">
                                    ▲ Critical
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Warning Risks */}
            {warningFlags.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-[11px] text-amber-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> Moderate Risks ({warningFlags.length})
                    </h4>
                    {warningFlags.map(flag => (
                        <div key={flag.id} className="p-3 mb-2 rounded-lg bg-amber-500/[0.04] border border-amber-500/15">
                            <div className="flex items-start gap-2">
                                {getSeverityIcon(flag.severity)}
                                <div className="flex-1">
                                    <span className="text-sm font-semibold text-white">{flag.title}</span>
                                    <p className="text-xs text-slate-400 mt-0.5">{flag.description}</p>
                                    <span className="text-[10px] text-slate-500 mt-1 block">{flag.date} • {flag.source}</span>
                                </div>
                                <span className="shrink-0 text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20 font-semibold">
                                    ▲ Warning
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Info Flags */}
            {infoFlags.length > 0 && (
                <div className="mb-4">
                    {infoFlags.map(flag => (
                        <div key={flag.id} className="p-3 mb-2 rounded-lg bg-cyan-500/[0.04] border border-cyan-500/15">
                            <div className="flex items-start gap-2">
                                {getSeverityIcon(flag.severity)}
                                <div className="flex-1">
                                    <span className="text-sm font-semibold text-white">{flag.title}</span>
                                    <p className="text-xs text-slate-400 mt-0.5">{flag.description}</p>
                                    <span className="text-[10px] text-slate-500 mt-1 block">{flag.date} • {flag.source}</span>
                                </div>
                                <span className="shrink-0 text-[10px] px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 font-semibold">
                                    ℹ Info
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Positive Signals */}
            <h4 className="text-[11px] text-emerald-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Positive Signals
            </h4>
            {positiveSignals.map((sig, i) => (
                <div key={i} className="flex items-center gap-2 mb-1.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{sig.factor}</span>
                    <span className="text-emerald-400 font-semibold ml-auto">+{sig.impact}%</span>
                </div>
            ))}
        </div>
    );
};
