import React from 'react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { TrendingUp, CheckCircle2 } from 'lucide-react';
import { useCreditData, DataLoading } from '../../hooks/useCreditData';

interface MetricCardProps {
    label: string;
    value: number;
    unit?: string;
    target?: number;
    trend: number[];
    color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, unit, target, trend, color }) => {
    const chartData = trend.map((v, i) => ({ i, value: v }));
    const isUp = trend[trend.length - 1] > trend[0];

    return (
        <div className="glass-card animate-slide-up">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">{label}</span>
            <div className="flex items-end gap-2 mt-2 mb-3">
                <span className="text-3xl font-bold text-white">{value}</span>
                {unit && <span className="text-sm text-slate-400 mb-1">{unit}</span>}
                <TrendingUp className={`w-5 h-5 mb-1 ${isUp ? 'text-emerald-400' : 'text-alert-400 rotate-180'}`} />
            </div>

            <div className="h-16 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                                <stop offset="100%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={2}
                            fill={`url(#grad-${label})`}
                            dot={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {target !== undefined && (
                <div className="flex items-center gap-1.5 mt-2 text-xs">
                    <span className="text-slate-500">Target: {target}</span>
                    {value >= target && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
            )}
        </div>
    );
};

export const FinancialHealth: React.FC = () => {
    const { data, loading } = useCreditData();
    if (loading || !data) return <DataLoading />;

    const fh = data.financial_health;

    return (
        <div>
            <h2 className="section-header">Financial Health Indicators</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard label="DSCR" value={fh.dscr.value} target={fh.dscr.target} trend={fh.dscr.trend} color="#10b981" />
                <MetricCard label="Current Ratio" value={fh.current_ratio.value} target={fh.current_ratio.target} trend={fh.current_ratio.trend} color="#10b981" />
                <MetricCard label="Tangible Net Worth" value={fh.tnw.value} unit={fh.tnw.unit} trend={fh.tnw.trend} color="#06b6d4" />
                <MetricCard label="Debt-Equity" value={fh.debt_equity.value} trend={fh.debt_equity.trend} color="#06b6d4" />
            </div>
        </div>
    );
};
