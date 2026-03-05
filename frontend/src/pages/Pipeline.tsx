import React, { useState } from 'react';
import {
    Search, Filter, LayoutGrid, FileText, Pencil, MoreHorizontal,
    Plus, AlertTriangle, CheckCircle2, Clock, Loader2,
} from 'lucide-react';
import { useCreditData, DataLoading } from '../hooks/useCreditData';

export const Pipeline: React.FC = () => {
    const { data, loading } = useCreditData();
    const [searchQuery, setSearchQuery] = useState('');

    if (loading || !data) return <DataLoading />;

    const getStatusStyle = (statusType: string | null) => {
        switch (statusType) {
            case 'approve': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'warning': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'critical': return 'bg-alert-500/10 text-alert-400 border-alert-500/20';
            case 'info': return 'bg-white/[0.04] text-slate-300 border-white/[0.08]';
            case 'progress': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
            default: return 'bg-white/[0.04] text-slate-400 border-white/[0.08]';
        }
    };

    const getStatusIcon = (statusType: string | null) => {
        switch (statusType) {
            case 'approve': return <CheckCircle2 className="w-3 h-3" />;
            case 'warning': return <AlertTriangle className="w-3 h-3" />;
            case 'critical': return <AlertTriangle className="w-3 h-3" />;
            case 'progress': return <Loader2 className="w-3 h-3" />;
            default: return <Clock className="w-3 h-3" />;
        }
    };

    const filteredColumns = data.pipeline_columns.map(col => ({
        ...col,
        cards: col.cards.filter(card =>
            card.company.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    }));

    return (
        <div className="space-y-5 animate-fade-in h-full flex flex-col">
            <div>
                <h1 className="text-xl font-bold text-white uppercase tracking-wide">Credit Application Pipeline</h1>
                <p className="text-sm text-slate-400 mt-1">Preview & export bank-ready CAM document</p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-slate-300">
                        <LayoutGrid className="w-4 h-4" /> Kanban
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search applications..."
                            className="pl-9 pr-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 transition-colors w-48"
                        />
                    </div>
                    <button className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-slate-400 hover:text-white transition-colors">
                        <Filter className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex gap-4 flex-1 overflow-x-auto pb-4">
                {filteredColumns.map((column) => (
                    <div key={column.id} className="flex flex-col min-w-[250px] w-[250px] shrink-0">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{column.title}</span>
                            <div className="flex items-center gap-1">
                                <button className="p-1 rounded text-slate-500 hover:text-white transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                                <button className="p-1 rounded text-slate-500 hover:text-white transition-colors"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                            </div>
                        </div>

                        <div className="space-y-3 flex-1">
                            {column.cards.map((card, ci) => (
                                <div key={ci} className="glass-card !p-4 hover:border-cyan-500/20 transition-all duration-200 cursor-pointer">
                                    <h4 className="text-sm font-semibold text-white mb-1">{card.company} - ₹{card.amount} Cr</h4>
                                    <p className="text-[11px] text-slate-400 mb-3">Requested</p>

                                    {card.status && (
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border mb-3 ${getStatusStyle(card.status_type)}`}>
                                            {getStatusIcon(card.status_type)}
                                            {card.status}
                                        </div>
                                    )}

                                    {card.status_type === 'progress' && (
                                        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mb-3">
                                            <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500" style={{ width: '60%' }} />
                                        </div>
                                    )}

                                    {card.badge && (
                                        <div className="flex items-center gap-1.5 text-[10px] text-alert-400 mb-3">
                                            <AlertTriangle className="w-3 h-3" />
                                            <span>{card.badge}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 pt-2 border-t border-white/[0.04]">
                                        <button className="p-1.5 rounded text-slate-500 hover:text-white hover:bg-white/[0.05] transition-colors"><FileText className="w-3.5 h-3.5" /></button>
                                        <button className="p-1.5 rounded text-slate-500 hover:text-white hover:bg-white/[0.05] transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                                        <button className="ml-auto p-1.5 rounded text-slate-500 hover:text-white hover:bg-white/[0.05] transition-colors"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
