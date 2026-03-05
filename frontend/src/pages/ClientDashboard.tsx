import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
    Building2, CreditCard, Shield, User, FileText,
    Download, Clock, ArrowUpRight,
} from 'lucide-react';
import { useCreditData, DataLoading } from '../hooks/useCreditData';

export const ClientDashboard: React.FC = () => {
    const { data, loading } = useCreditData();
    if (loading || !data) return <DataLoading />;

    const b = data.borrower_details;
    const totalExposure = data.active_loans.reduce((sum, l) => sum + l.amount, 0).toFixed(2);

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-xl font-bold text-white uppercase tracking-wide">Client Relationship Dashboard</h1>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left: Client Overview + Credit Health */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="glass-card">
                        <h2 className="section-header">Client Overview</h2>
                        <div className="flex items-center gap-4 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20 flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-emerald-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white">{b.name}</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">Total Exposure</span>
                                </div>
                                <span className="text-xl font-bold text-white">₹{totalExposure} Cr</span>
                            </div>
                            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <Shield className="w-3.5 h-3.5 text-slate-500" />
                                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">CIBIL Score</span>
                                </div>
                                <span className="text-xl font-bold text-emerald-400">{b.cibil_score} ({b.cibil_rating})</span>
                            </div>
                            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <User className="w-3.5 h-3.5 text-slate-500" />
                                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">Relationship Manager</span>
                                </div>
                                <span className="text-xl font-bold text-white">{b.promoter}</span>
                            </div>
                        </div>
                    </div>

                    {/* Credit Health Score Trend */}
                    <div className="glass-card">
                        <h2 className="section-header">Credit Health Score Trend</h2>
                        <ResponsiveContainer width="100%" height={240}>
                            <LineChart data={data.credit_health_trend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.12)" />
                                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} domain={[700, 750]} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: 12 }} />
                                <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#0f172a', stroke: '#10b981', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right: Active Loans + Recent Documents */}
                <div className="space-y-6">
                    <div className="glass-card !p-0 overflow-hidden">
                        <h2 className="section-header px-5 pt-5">Active Loans</h2>
                        <table className="w-full">
                            <tbody>
                                {data.active_loans.map((loan, i) => (
                                    <tr key={i} className={`border-t border-white/[0.04] ${i % 2 === 1 ? 'bg-white/[0.01]' : ''}`}>
                                        <td className="px-5 py-3.5">
                                            <span className="text-sm font-medium text-white block">{loan.type}</span>
                                            <span className="text-xs text-slate-400">₹{loan.amount} Cr</span>
                                        </td>
                                        <td className="px-3 py-3.5 text-center">
                                            <span className="text-xs font-medium text-emerald-400">{loan.status}</span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <span className="text-[10px] text-slate-500 uppercase block">Next Due</span>
                                            <span className="text-xs text-white font-semibold">{loan.next_due}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="glass-card">
                        <h2 className="section-header">Recent Documents</h2>
                        <div className="space-y-3">
                            {data.recent_documents.map((doc, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-4 h-4 text-slate-500" />
                                        <div>
                                            <span className="text-sm text-white block">{doc.name}</span>
                                            <span className="text-[10px] text-slate-500">({doc.date})</span>
                                        </div>
                                    </div>
                                    <button className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium flex items-center gap-1">
                                        <Download className="w-3 h-3" /> Download
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending Tasks */}
            <div>
                <h2 className="section-header">Pending Tasks</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {data.pending_tasks.map((task, i) => (
                        <div key={i} className="glass-card flex flex-col">
                            <div className="flex items-start justify-between mb-3">
                                <span className="text-sm font-semibold text-white">{task.title}</span>
                                <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-alert-500/10 text-alert-400 border border-alert-500/20">
                                    {task.priority}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
                                <Clock className="w-3 h-3" />
                                <span>Due on: {task.due_date}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-auto">
                                <button className="px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-xs text-slate-300 hover:bg-white/[0.08] transition-colors">Details</button>
                                <button className="px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-xs text-slate-300 hover:bg-white/[0.08] transition-colors">Action</button>
                                <button className="ml-auto px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-xs font-semibold text-white hover:opacity-90 transition-opacity flex items-center gap-1">
                                    <ArrowUpRight className="w-3 h-3" /> Action
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
