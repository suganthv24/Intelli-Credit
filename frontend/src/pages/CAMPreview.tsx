import React, { useState } from 'react';
import {
    FileText, Download, Building2, Shield, Fingerprint,
    CheckCircle2, AlertTriangle, Printer,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useCreditData, DataLoading } from '../hooks/useCreditData';

export const CAMPreview: React.FC = () => {
    const { data, loading } = useCreditData();
    const [generating, setGenerating] = useState(false);

    if (loading || !data) return <DataLoading />;

    const b = data.borrower_details;
    const d = data.ai_decision;
    const cam = data.cam_sections;

    const handleGeneratePDF = () => {
        setGenerating(true);
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text('Credit Application Memorandum (CAM)', 20, 20);
        doc.setFontSize(10);
        doc.text(`Application ID: ${data.application_id}`, 20, 30);
        doc.text(`Borrower: ${b.name}`, 20, 38);
        doc.text(`CIN: ${b.cin} | GSTIN: ${b.gstin}`, 20, 46);
        doc.text(`Sector: ${b.sector}`, 20, 54);
        doc.text(`Decision: ${d.verdict.toUpperCase()} | Limit: Rs.${d.suggested_limit} Cr`, 20, 66);
        doc.text(`Risk Premium: MCLR + ${d.risk_premium}% | Tenor: ${d.tenor_months} months`, 20, 74);

        let y = 90;
        doc.setFontSize(12);
        doc.text('Executive Summary', 20, y);
        doc.setFontSize(9);
        const lines = doc.splitTextToSize(cam.executive_summary, 170);
        doc.text(lines, 20, y + 8);
        y += 8 + lines.length * 4;

        y += 8;
        doc.setFontSize(12);
        doc.text('Financial Ratios', 20, y);
        y += 8;
        doc.setFontSize(8);
        cam.financial_ratios.forEach(r => {
            doc.text(`${r.ratio}: FY22=${r.fy22}, FY23=${r.fy23}, FY24=${r.fy24} (Benchmark: ${r.benchmark}) [${r.status}]`, 20, y);
            y += 5;
        });

        y += 8;
        doc.setFontSize(12);
        doc.text('Sanction Conditions', 20, y);
        y += 8;
        doc.setFontSize(8);
        cam.sanction_conditions.forEach((c, i) => {
            doc.text(`${i + 1}. ${c}`, 20, y);
            y += 5;
        });

        doc.save(`CAM_${data.application_id}.pdf`);
        setGenerating(false);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-white uppercase tracking-wide">Credit Application Memorandum</h1>
                    <p className="text-sm text-slate-400 mt-1">Preview & export bank-ready CAM document</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-slate-300 hover:bg-white/[0.1] transition-colors">
                        <Printer className="w-4 h-4" /> Print
                    </button>
                    <button
                        onClick={handleGeneratePDF}
                        disabled={generating}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" /> {generating ? 'Generating...' : 'Generate PDF'}
                    </button>
                </div>
            </div>

            {/* Letterhead Style Document */}
            <div className="glass-card max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/[0.08]">
                    <div className="flex items-center gap-3">
                        <Building2 className="w-8 h-8 text-emerald-400" />
                        <div>
                            <h2 className="text-lg font-bold text-white">CREDIT APPLICATION MEMORANDUM</h2>
                            <span className="text-xs text-slate-500">Ref: {data.application_id} | Confidential</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <Shield className="w-6 h-6 text-amber-400 ml-auto" />
                        <span className="text-[10px] text-slate-500 block mt-1">CIBIL: {b.cibil_score}</span>
                    </div>
                </div>

                {/* Borrower Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Borrower</span>
                        <span className="block text-sm text-white font-semibold mt-0.5">{b.name}</span>
                    </div>
                    <div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">GSTIN</span>
                        <span className="block text-sm text-white font-mono mt-0.5">{b.gstin}</span>
                    </div>
                    <div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">CIN</span>
                        <span className="block text-sm text-white font-mono mt-0.5">{b.cin}</span>
                    </div>
                    <div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Sector</span>
                        <span className="block text-sm text-white mt-0.5">{b.sector}</span>
                    </div>
                </div>

                {/* Decision */}
                <div className={`p-4 rounded-xl mb-6 ${d.verdict === 'Approve' ? 'bg-emerald-500/[0.06] border border-emerald-500/20' : 'bg-alert-500/[0.06] border border-alert-500/20'}`}>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">AI Decision</span>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                        <span className={`text-2xl font-black ${d.verdict === 'Approve' ? 'text-emerald-400' : 'text-alert-400'}`}>{d.verdict.toUpperCase()}</span>
                        <span className="text-sm text-white">₹{d.suggested_limit} Cr</span>
                        <span className="text-sm text-slate-400">MCLR + {d.risk_premium}%</span>
                        <span className="text-sm text-slate-400">{d.tenor_months} months</span>
                    </div>
                </div>

                {/* Executive Summary */}
                <div className="mb-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-400" /> Executive Summary
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{cam.executive_summary}</p>
                </div>

                {/* Financial Ratios Table */}
                <div className="mb-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Financial Ratios</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-white/[0.08]">
                                    <th className="text-left text-slate-500 pb-2 font-semibold">Ratio</th>
                                    <th className="text-right text-slate-500 pb-2 font-semibold">FY22</th>
                                    <th className="text-right text-slate-500 pb-2 font-semibold">FY23</th>
                                    <th className="text-right text-slate-500 pb-2 font-semibold">FY24</th>
                                    <th className="text-right text-slate-500 pb-2 font-semibold">Benchmark</th>
                                    <th className="text-right text-slate-500 pb-2 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cam.financial_ratios.map((r, i) => (
                                    <tr key={i} className="border-b border-white/[0.04]">
                                        <td className="py-2 text-white font-medium">{r.ratio}</td>
                                        <td className="py-2 text-right text-slate-300">{r.fy22}</td>
                                        <td className="py-2 text-right text-slate-300">{r.fy23}</td>
                                        <td className="py-2 text-right text-white font-semibold">{r.fy24}</td>
                                        <td className="py-2 text-right text-slate-500">{r.benchmark}</td>
                                        <td className="py-2 text-right">
                                            <span className="inline-flex items-center gap-1 text-emerald-400"><CheckCircle2 className="w-3 h-3" />{r.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Risk Mitigants */}
                <div className="mb-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Risk Mitigants</h3>
                    <div className="space-y-2">
                        {cam.risk_mitigants.map((m, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                                <span>{m}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sanction Conditions */}
                <div className="mb-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Sanction Conditions</h3>
                    <div className="space-y-2">
                        {cam.sanction_conditions.map((c, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                                <span className="w-5 h-5 rounded-full bg-white/[0.06] flex items-center justify-center text-[10px] text-slate-400 font-semibold shrink-0">{i + 1}</span>
                                <span>{c}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Aadhaar eSign Placeholder */}
                <div className="p-4 rounded-xl bg-cyan-500/[0.04] border border-cyan-500/15">
                    <div className="flex items-center gap-3 mb-2">
                        <Fingerprint className="w-5 h-5 text-cyan-400" />
                        <h4 className="text-sm font-bold text-white">Aadhaar eSign Integration</h4>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">
                        IT Act 2000 compliant digital signature. This section will integrate with UIDAI's eSign API for authorized signatories.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-center">
                            <span className="text-[10px] text-slate-500 block">Credit Officer</span>
                            <span className="text-xs text-amber-400 mt-1 block">⏳ Pending eSign</span>
                        </div>
                        <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-center">
                            <span className="text-[10px] text-slate-500 block">Branch Manager</span>
                            <span className="text-xs text-amber-400 mt-1 block">⏳ Pending eSign</span>
                        </div>
                        <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-center">
                            <span className="text-[10px] text-slate-500 block">Zonal Head</span>
                            <span className="text-xs text-amber-400 mt-1 block">⏳ Pending eSign</span>
                        </div>
                    </div>
                </div>

                {/* Warnings */}
                <div className="mt-4 flex items-start gap-2 text-[10px] text-amber-400/60">
                    <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                    <span>This document is system-generated and requires authorized signatures before submission to the sanctioning authority.</span>
                </div>
            </div>
        </div>
    );
};
