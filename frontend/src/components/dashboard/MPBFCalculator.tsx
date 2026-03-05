import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell,
} from 'recharts';
import { Calculator } from 'lucide-react';
import { useCreditData, DataLoading } from '../../hooks/useCreditData';

export const MPBFCalculator: React.FC = () => {
    const { data, loading } = useCreditData();
    if (loading || !data) return <DataLoading />;

    const m = data.mpbf;
    const mpbfVal = +((0.75 * m.current_assets) - m.current_liabilities).toFixed(2);
    const currentRatio = +(m.current_assets / m.current_liabilities).toFixed(2);
    const permissible = +(mpbfVal * 0.9).toFixed(2);

    const pieData = [
        { name: 'Used', value: permissible },
        { name: 'Remaining', value: mpbfVal - permissible },
    ];
    const PIE_COLORS = ['#06b6d4', '#1e293b'];

    return (
        <div className="glass-card animate-slide-up">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="section-header mb-0">MPBF Calculator</h2>
                    <span className="text-[10px] text-slate-500">Tandon Committee — Method II</span>
                </div>
                <button className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white transition-colors">
                    <Calculator className="w-4 h-4" />
                </button>
            </div>

            {/* Formula */}
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] mb-4">
                <span className="text-[10px] text-slate-500">MPBF = (0.75 × Current Assets) − Current Liabilities</span>
                <div className="flex items-center gap-2 mt-2 text-sm">
                    <span className="text-cyan-400 font-semibold">0.75 × ₹{m.current_assets} Cr</span>
                    <span className="text-slate-500">−</span>
                    <span className="text-amber-400 font-semibold">₹{m.current_liabilities} Cr</span>
                    <span className="text-slate-500">=</span>
                    <span className="text-2xl font-bold text-white">₹{mpbfVal} Cr</span>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Current Ratio</span>
                    <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{currentRatio}</span>
                        <span className="text-[10px] text-slate-500">/ {m.target_current_ratio}</span>
                    </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">MPBF</span>
                    <span className="text-white font-bold">₹{mpbfVal} Cr</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Permissible Drawing</span>
                    <span className="text-white font-bold">₹{permissible} Cr</span>
                </div>
            </div>

            {/* Pie + Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-center">
                    <PieChart width={120} height={120}>
                        <Pie data={pieData} cx={55} cy={55} innerRadius={35} outerRadius={50} dataKey="value" startAngle={90} endAngle={-270}>
                            {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                        </Pie>
                    </PieChart>
                </div>
                <div>
                    <h4 className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-2">Current Asset Composition</h4>
                    <ResponsiveContainer width="100%" height={100}>
                        <BarChart data={m.breakdown} layout="vertical" barSize={12}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" />
                            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} />
                            <YAxis type="category" dataKey="label" tick={{ fill: '#94a3b8', fontSize: 9 }} axisLine={false} tickLine={false} width={80} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: 11 }}
                                formatter={((v: number) => [`₹${v} Cr`]) as any}
                            />
                            <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                                {m.breakdown.map((_, i) => <Cell key={i} fill={['#10b981', '#06b6d4', '#f59e0b', '#64748b'][i]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
