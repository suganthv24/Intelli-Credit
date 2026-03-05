import React from 'react';
import { Shield, TrendingUp, Landmark, Building2, CloudSun, MoreVertical } from 'lucide-react';
import { useCreditData, DataLoading } from '../../hooks/useCreditData';
import { ScoreRing } from '../ui/ScoreRing';

const icons = [Shield, TrendingUp, Landmark, Building2, CloudSun];

export const FiveCsScorecard: React.FC = () => {
    const { data, loading } = useCreditData();
    if (loading || !data) return <DataLoading />;

    return (
        <div>
            <h2 className="section-header">Five Cs Credit Assessment</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {data.five_cs.map((cs, i) => {
                    const Icon = icons[i];
                    const riskColor = cs.risk === 'Low' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : cs.risk === 'Moderate' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-alert-500/10 text-alert-400 border-alert-500/20';

                    return (
                        <div
                            key={cs.label}
                            className="glass-card flex flex-col items-center text-center animate-slide-up"
                            style={{ animationDelay: `${i * 60}ms` }}
                        >
                            <div className="flex items-center justify-between w-full mb-3">
                                <div className="flex items-center gap-2">
                                    <Icon className="w-4 h-4 text-cyan-400" />
                                    <span className="text-sm font-bold text-white">{cs.label}</span>
                                </div>
                                <button className="p-1 rounded text-slate-500 hover:text-white transition-colors">
                                    <MoreVertical className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border mb-4 ${riskColor}`}>
                                {cs.risk}
                            </span>

                            <div className="mb-4">
                                <ScoreRing score={cs.score} size={100} strokeWidth={6} />
                            </div>

                            <span className="text-xs text-slate-400 mt-auto">{cs.key_metric}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
