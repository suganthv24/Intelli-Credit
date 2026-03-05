import React from 'react';
import { AlertTriangle, AlertCircle, Info, Clock } from 'lucide-react';
import { useCreditData, DataLoading } from '../../hooks/useCreditData';

export const RiskFlags: React.FC = () => {
    const { data, loading } = useCreditData();
    if (loading || !data) return <DataLoading />;

    const severityConfig = {
        critical: { icon: AlertCircle, color: 'text-alert-400', bg: 'bg-alert-500/10', border: 'border-alert-500/20', label: 'CRITICAL' },
        warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'WARNING' },
        info: { icon: Info, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', label: 'INFO' },
    };

    return (
        <div className="glass-card animate-slide-up">
            <h2 className="section-header">Early Warning Signals (EWS)</h2>
            <div className="space-y-3">
                {data.risk_flags.map(flag => {
                    const config = severityConfig[flag.severity];
                    const Icon = config.icon;
                    return (
                        <div key={flag.id} className={`p-3 rounded-lg ${config.bg} border ${config.border}`}>
                            <div className="flex items-start gap-3">
                                <Icon className={`w-5 h-5 ${config.color} shrink-0 mt-0.5`} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-sm font-semibold text-white">{flag.title}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${config.bg} ${config.color} border ${config.border} font-semibold shrink-0`}>{config.label}</span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">{flag.description}</p>
                                    <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{flag.date}</span>
                                        <span>• {flag.source}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
