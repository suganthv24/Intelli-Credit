import React, { useState, useCallback } from 'react';
import {
    Upload, FileText, CheckCircle2, AlertTriangle, Loader2,
    Shield, Eye, Clock,
} from 'lucide-react';
import { useCreditData, DataLoading } from '../hooks/useCreditData';
import { StatusBadge } from '../components/ui/StatusBadge';
import type { SampleDocument } from '../types';

export const DataIngestor: React.FC = () => {
    const { data, loading } = useCreditData();
    const [isDragging, setIsDragging] = useState(false);
    const [localDocs, setLocalDocs] = useState<SampleDocument[]>([]);
    const [activeStage, setActiveStage] = useState(3);

    const documents = localDocs.length > 0 ? localDocs : (data?.sample_documents ?? []);
    const stages = data?.pipeline_stages ?? [];

    const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
    const handleDragLeave = useCallback(() => { setIsDragging(false); }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        const newDocs: SampleDocument[] = files.map(file => ({
            name: file.name, type: 'Uploaded Document',
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            status: 'processing', dna_score: 0, stage: 1, flags: [],
        }));
        setLocalDocs(prev => [...newDocs, ...(prev.length > 0 ? prev : data?.sample_documents ?? [])]);

        setTimeout(() => {
            setLocalDocs(prev =>
                prev.map(doc =>
                    newDocs.some(nd => nd.name === doc.name)
                        ? { ...doc, stage: 3, status: 'processing', dna_score: Math.floor(Math.random() * 20) + 80 }
                        : doc
                )
            );
        }, 2000);

        setTimeout(() => {
            setLocalDocs(prev =>
                prev.map(doc =>
                    newDocs.some(nd => nd.name === doc.name)
                        ? { ...doc, stage: 5, status: 'verified' }
                        : doc
                )
            );
            setActiveStage(5);
        }, 4000);
    }, [data]);

    if (loading || !data) return <DataLoading />;

    const dnaColor = (score: number) => {
        if (score === 0) return 'text-slate-500';
        if (score >= 90) return 'text-emerald-400';
        if (score >= 70) return 'text-amber-400';
        return 'text-alert-400';
    };

    const statusIcon = (status: string) => {
        switch (status) {
            case 'verified': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
            case 'processing': return <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />;
            default: return <Clock className="w-4 h-4 text-slate-500" />;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">Data Ingestor</h1>
                    <p className="text-sm text-slate-400 mt-1">Command Center — Upload, validate, and analyze financial documents</p>
                </div>
            </div>

            {/* Document Completeness Score */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card flex items-center gap-4">
                    <div className="relative w-16 h-16 shrink-0">
                        <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
                            <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(100,116,139,0.2)" strokeWidth="6" />
                            <circle cx="32" cy="32" r="26" fill="none" stroke="#10b981" strokeWidth="6" strokeLinecap="round"
                                strokeDasharray={`${(documents.filter(d => d.status === 'verified').length / Math.max(documents.length, 1)) * 163.36} 163.36`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-bold text-emerald-400">{Math.round((documents.filter(d => d.status === 'verified').length / Math.max(documents.length, 1)) * 100)}%</span>
                        </div>
                    </div>
                    <div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Document Completeness</span>
                        <span className="block text-sm text-white font-semibold mt-0.5">{documents.filter(d => d.status === 'verified').length} of {documents.length} documents verified</span>
                    </div>
                </div>

                <div className="glass-card">
                    <span className="text-[10px] text-amber-400 uppercase tracking-wider font-semibold block mb-2">Missing Documents</span>
                    <div className="space-y-1.5">
                        {documents.filter(d => d.status === 'processing').map((doc, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-amber-400/80">
                                <AlertTriangle className="w-3 h-3 shrink-0" />
                                <span>{doc.name} (in progress)</span>
                            </div>
                        ))}
                        {documents.filter(d => d.status === 'processing').length === 0 && (
                            <span className="text-xs text-emerald-400">All documents received</span>
                        )}
                    </div>
                </div>

                <div className="glass-card">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-2">Data Quality Summary</span>
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-400">GST Mismatch</span>
                            <span className={`font-semibold ${data.gst_analytics.mismatch_percent > 5 ? 'text-alert-400' : 'text-amber-400'}`}>{data.gst_analytics.mismatch_percent}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Avg DNA Score</span>
                            <span className="text-emerald-400 font-semibold">{Math.round(documents.filter(d => d.dna_score > 0).reduce((s, d) => s + d.dna_score, 0) / Math.max(documents.filter(d => d.dna_score > 0).length, 1))}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Integrity Alerts</span>
                            <span className="text-amber-400 font-semibold">{documents.reduce((s, d) => s + d.flags.length, 0)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pipeline Progress */}
            <div className="glass-card">
                <h2 className="section-header">Pipeline Progress</h2>
                <div className="flex items-center justify-between relative">
                    <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-white/10">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-1000"
                            style={{ width: `${((activeStage - 1) / (stages.length - 1)) * 100}%` }}
                        />
                    </div>
                    {stages.map((stage) => {
                        const isComplete = stage.id < activeStage;
                        const isActive = stage.id === activeStage;
                        return (
                            <div key={stage.id} className="flex flex-col items-center relative z-10 w-1/5">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isComplete
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : isActive
                                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 animate-pulse'
                                        : 'bg-navy-800 border-white/10 text-slate-500'
                                    }`}>
                                    {isComplete ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-sm font-bold">{stage.id}</span>}
                                </div>
                                <span className={`text-xs font-semibold mt-2 ${isComplete ? 'text-emerald-400' : isActive ? 'text-cyan-400' : 'text-slate-500'}`}>
                                    {stage.label}
                                </span>
                                <span className={`text-[10px] mt-0.5 text-center hidden sm:block ${stage.id > activeStage ? 'text-slate-600' : 'text-slate-400'}`}>
                                    {stage.description}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Drag & Drop Zone */}
            <div
                className={`glass-card !p-0 overflow-hidden transition-all duration-300 ${isDragging ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/10' : ''}`}
                onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
            >
                <div className={`flex flex-col items-center justify-center py-12 sm:py-16 px-8 transition-colors duration-200 ${isDragging ? 'bg-cyan-500/[0.05]' : ''}`}>
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 ${isDragging ? 'scale-110 bg-cyan-500/20' : 'bg-white/[0.04]'}`}>
                        <Upload className={`w-8 h-8 transition-colors duration-300 ${isDragging ? 'text-cyan-400' : 'text-slate-500'}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">{isDragging ? 'Drop files here' : 'Drag & Drop Documents'}</h3>
                    <p className="text-sm text-slate-400 mb-4">PDF Annual Reports, GSTR-2A/3B files, Bank Statements</p>
                    <div className="flex flex-wrap items-center gap-3 justify-center">
                        <span className="badge badge-info">PDF</span>
                        <span className="badge badge-info">GSTR-2A</span>
                        <span className="badge badge-info">GSTR-3B</span>
                        <span className="badge badge-info">Bank Stmt</span>
                    </div>
                </div>
            </div>

            {/* Document DNA Status */}
            <div className="glass-card">
                <h2 className="section-header">Document DNA Status</h2>
                <div className="space-y-3">
                    {documents.map((doc, i) => (
                        <div key={`${doc.name}-${i}`} className="flex items-center gap-3 sm:gap-4 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.03] transition-colors">
                            <div className="shrink-0">{statusIcon(doc.status)}</div>
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                                <div className="min-w-0">
                                    <span className="text-sm text-white font-medium block truncate">{doc.name}</span>
                                    <span className="text-[10px] text-slate-500">{doc.type} • {doc.size}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Shield className={`w-4 h-4 ${dnaColor(doc.dna_score)}`} />
                                <div className="text-right">
                                    <span className={`text-sm font-bold ${dnaColor(doc.dna_score)}`}>{doc.dna_score > 0 ? `${doc.dna_score}%` : '—'}</span>
                                    <span className="block text-[10px] text-slate-500">DNA Score</span>
                                </div>
                            </div>
                            <StatusBadge variant={doc.status === 'verified' ? 'approve' : doc.status === 'warning' ? 'warning' : 'info'}>
                                Stage {doc.stage}/{stages.length}
                            </StatusBadge>
                            <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors">
                                <Eye className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>

                {documents.some(d => d.flags.length > 0) && (
                    <div className="mt-4 pt-4 border-t border-white/[0.05]">
                        <h3 className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" /> Document Integrity Alerts
                        </h3>
                        {documents.filter(d => d.flags.length > 0).map(doc => (
                            <div key={doc.name} className="mb-3">
                                <span className="text-xs text-white font-medium">{doc.name}</span>
                                <div className="mt-1 space-y-1">
                                    {doc.flags.map((flag, fi) => (
                                        <div key={fi} className="flex items-start gap-2 text-xs text-amber-400/80">
                                            <span className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                            {flag}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
