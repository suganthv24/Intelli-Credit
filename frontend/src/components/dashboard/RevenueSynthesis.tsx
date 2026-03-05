import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { useCreditData, DataLoading } from '../../hooks/useCreditData';

export const RevenueSynthesis: React.FC = () => {
    const { data, loading } = useCreditData();
    if (loading || !data) return <DataLoading />;

    const gst = data.gst_analytics;
    const chartData = gst.months.map((month, i) => ({
        month,
        gstr1: gst.gstr1_turnover[i],
        bankCredits: gst.bank_credits[i],
        discrepancy: +(gst.gstr1_turnover[i] - gst.bank_credits[i]).toFixed(2),
    }));

    const avgDiscrepancy = +(chartData.reduce((s, d) => s + d.discrepancy, 0) / chartData.length).toFixed(2);

    return (
        <div className="glass-card animate-slide-up">
            <h2 className="section-header">Revenue Synthesis — GSTR-1 vs Bank Credits</h2>
            <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" />
                    <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} unit=" Cr" />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: 11 }}
                        formatter={((v: number) => [`₹${v} Cr`]) as any}
                    />
                    <Bar dataKey="bankCredits" fill="#1e3a5f" name="Bank Credits" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="gstr1" fill="#10b981" name="GSTR-1 Turnover" radius={[2, 2, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.05]">
                <span className="text-xs text-amber-400">Avg. monthly discrepancy: ₹{avgDiscrepancy} Cr</span>
                <span className="text-[10px] text-slate-500">Source: GSTR-1 filings & Bank Statement (H1 FY25)</span>
            </div>
        </div>
    );
};
