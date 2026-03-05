import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';
import { AlertTriangle } from 'lucide-react';
import { useCreditData, DataLoading } from '../../hooks/useCreditData';

export const GSTAnalytics: React.FC = () => {
    const { data, loading } = useCreditData();
    if (loading || !data) return <DataLoading />;

    const gst = data.gst_analytics;
    const mismatchData = gst.months.map((month, i) => ({
        month,
        mismatch: gst.gstr2a_3b_mismatch[i],
    }));

    return (
        <div className="glass-card animate-slide-up">
            <div className="flex items-center justify-between mb-4">
                <h2 className="section-header mb-0">GST Analytics — 2A vs 3B Mismatch</h2>
                <div className="flex items-center gap-1.5 text-xs">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-amber-400 font-semibold">Avg Mismatch: {gst.mismatch_percent}%</span>
                </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={mismatchData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" />
                    <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: 11 }}
                        formatter={((v: number) => [`${v}%`, 'Mismatch']) as any}
                    />
                    <Bar dataKey="mismatch" radius={[3, 3, 0, 0]}>
                        {mismatchData.map((entry, i) => (
                            <Cell key={i} fill={entry.mismatch > 5 ? '#ef4444' : entry.mismatch > 3 ? '#f59e0b' : '#10b981'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 pt-3 border-t border-white/[0.05]">
                <span className="text-[10px] text-slate-500">ITC discrepancies highlighted in red if {'>'} 5%. Source: GSTR-2A/3B reconciliation</span>
            </div>
        </div>
    );
};
