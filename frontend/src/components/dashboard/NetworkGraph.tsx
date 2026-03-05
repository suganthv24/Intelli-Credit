import React, { useEffect, useRef, useState } from 'react';
import { useCreditData, DataLoading } from '../../hooks/useCreditData';

interface NodePosition {
    id: string;
    label: string;
    type: 'borrower' | 'counterparty' | 'external';
    x: number;
    y: number;
    vx: number;
    vy: number;
}

export const NetworkGraph: React.FC = () => {
    const { data, loading } = useCreditData();
    const svgRef = useRef<SVGSVGElement>(null);
    const [nodes, setNodes] = useState<NodePosition[]>([]);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const animRef = useRef<number>(0);
    const initialized = useRef(false);

    useEffect(() => {
        if (!data || initialized.current) return;
        initialized.current = true;
        setNodes(data.network_graph.nodes.map(n => ({ ...n, type: n.type as 'borrower' | 'counterparty' | 'external', vx: 0, vy: 0 })));
    }, [data]);

    useEffect(() => {
        if (!data || nodes.length === 0) return;
        const edges = data.network_graph.edges;
        let frame = 0;
        const maxFrames = 120;

        const simulate = () => {
            if (frame >= maxFrames) return;
            frame++;

            setNodes(prev => {
                const updated = prev.map(n => ({ ...n }));
                for (let i = 0; i < updated.length; i++) {
                    for (let j = i + 1; j < updated.length; j++) {
                        const dx = updated[j].x - updated[i].x;
                        const dy = updated[j].y - updated[i].y;
                        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
                        const repulsion = 2000 / (dist * dist);
                        const fx = (dx / dist) * repulsion;
                        const fy = (dy / dist) * repulsion;
                        updated[i].vx -= fx * 0.1;
                        updated[i].vy -= fy * 0.1;
                        updated[j].vx += fx * 0.1;
                        updated[j].vy += fy * 0.1;
                    }
                }

                edges.forEach(edge => {
                    const source = updated.find(n => n.id === edge.from);
                    const target = updated.find(n => n.id === edge.to);
                    if (source && target) {
                        const dx = target.x - source.x;
                        const dy = target.y - source.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const attraction = (dist - 150) * 0.005;
                        source.vx += (dx / dist) * attraction;
                        source.vy += (dy / dist) * attraction;
                        target.vx -= (dx / dist) * attraction;
                        target.vy -= (dy / dist) * attraction;
                    }
                });

                updated.forEach(n => {
                    n.vx += (350 - n.x) * 0.002;
                    n.vy += (180 - n.y) * 0.002;
                    n.vx *= 0.85;
                    n.vy *= 0.85;
                    n.x += n.vx;
                    n.y += n.vy;
                    n.x = Math.max(60, Math.min(640, n.x));
                    n.y = Math.max(40, Math.min(320, n.y));
                });

                return updated;
            });

            animRef.current = requestAnimationFrame(simulate);
        };

        animRef.current = requestAnimationFrame(simulate);
        return () => cancelAnimationFrame(animRef.current);
    }, [data, nodes.length]);

    if (loading || !data) return <DataLoading />;

    const edges = data.network_graph.edges;
    const getNodeColor = (type: string) => {
        switch (type) {
            case 'borrower': return '#10b981';
            case 'counterparty': return '#06b6d4';
            case 'external': return '#64748b';
            default: return '#64748b';
        }
    };

    const circularEdges = edges.filter(e => e.circular);
    const normalEdges = edges.filter(e => !e.circular);

    return (
        <div className="glass-card animate-slide-up">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="section-header mb-0">Circular Trading Detection</h2>
                    <p className="text-xs text-slate-500 mt-1">Transaction network analysis between borrower and counterparties</p>
                </div>
                {circularEdges.length > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-alert-500/10 border border-alert-500/20">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-alert-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-alert-400" />
                        </span>
                        <span className="text-xs font-semibold text-alert-400">
                            {circularEdges.length} Circular Flows Detected
                        </span>
                    </div>
                )}
            </div>

            <svg ref={svgRef} viewBox="0 0 700 360" className="w-full h-[320px]">
                <defs>
                    <marker id="arrow-normal" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                        <path d="M0,0 L8,3 L0,6 Z" fill="#475569" />
                    </marker>
                    <marker id="arrow-circular" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                        <path d="M0,0 L8,3 L0,6 Z" fill="#ef4444" />
                    </marker>
                    <filter id="glow"><feGaussianBlur stdDeviation="3" result="coloredBlur" /><feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                </defs>

                {normalEdges.map((edge, i) => {
                    const source = nodes.find(n => n.id === edge.from);
                    const target = nodes.find(n => n.id === edge.to);
                    if (!source || !target) return null;
                    return (
                        <g key={`edge-n-${i}`}>
                            <line x1={source.x} y1={source.y} x2={target.x} y2={target.y} stroke="#334155" strokeWidth={1.5} markerEnd="url(#arrow-normal)" opacity={0.6} />
                            <text x={(source.x + target.x) / 2} y={(source.y + target.y) / 2 - 6} fill="#64748b" fontSize="9" textAnchor="middle">₹{edge.amount} Cr</text>
                        </g>
                    );
                })}

                {circularEdges.map((edge, i) => {
                    const source = nodes.find(n => n.id === edge.from);
                    const target = nodes.find(n => n.id === edge.to);
                    if (!source || !target) return null;
                    return (
                        <g key={`edge-c-${i}`}>
                            <line x1={source.x} y1={source.y} x2={target.x} y2={target.y} stroke="#ef4444" strokeWidth={2.5} markerEnd="url(#arrow-circular)" opacity={0.8} filter="url(#glow)">
                                <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
                            </line>
                            <text x={(source.x + target.x) / 2} y={(source.y + target.y) / 2 - 8} fill="#f87171" fontSize="10" fontWeight="600" textAnchor="middle">₹{edge.amount} Cr</text>
                        </g>
                    );
                })}

                {nodes.map(node => (
                    <g key={node.id} onMouseEnter={() => setHoveredNode(node.id)} onMouseLeave={() => setHoveredNode(null)} className="cursor-pointer">
                        <circle cx={node.x} cy={node.y} r={node.type === 'borrower' ? 28 : 22} fill={`${getNodeColor(node.type)}20`} stroke={getNodeColor(node.type)} strokeWidth={hoveredNode === node.id ? 3 : 2} style={{ transition: 'stroke-width 0.2s' }} />
                        <text x={node.x} y={node.y + 1} fill="white" fontSize="9" fontWeight="600" textAnchor="middle" dominantBaseline="middle">{node.label.split(' ')[0]}</text>
                        <text x={node.x} y={node.y + (node.type === 'borrower' ? 40 : 34)} fill="#94a3b8" fontSize="8" textAnchor="middle">{node.label}</text>
                    </g>
                ))}
            </svg>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-3 pt-3 border-t border-white/[0.05]">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500/30 border border-emerald-500" /><span className="text-[10px] text-slate-500">Borrower</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-cyan-500/30 border border-cyan-500" /><span className="text-[10px] text-slate-500">Counterparty</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-500/30 border border-slate-500" /><span className="text-[10px] text-slate-500">External</span></div>
                <div className="flex items-center gap-2"><div className="w-8 h-0.5 bg-alert-500" /><span className="text-[10px] text-alert-400">Circular Flow</span></div>
            </div>

            {circularEdges.length > 0 && (
                <div className="mt-4 p-4 rounded-xl bg-alert-500/[0.04] border border-alert-500/15">
                    <h4 className="text-[11px] text-alert-400 uppercase tracking-wider font-semibold mb-2">Transaction Intelligence</h4>
                    <p className="text-xs text-slate-300 leading-relaxed mb-2">
                        Circular trading detected among: <span className="text-white font-semibold">{data.borrower_details.name.split(' ')[0]} → Apex Trading → Nova Metals → {data.borrower_details.name.split(' ')[0]}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                        <div><span className="text-[10px] text-slate-500 uppercase tracking-wider block">Total Loop Value</span><span className="text-sm font-bold text-alert-400">₹{circularEdges.reduce((s, e) => s + e.amount, 0).toFixed(1)} Cr</span></div>
                        <div><span className="text-[10px] text-slate-500 uppercase tracking-wider block">Risk Score Impact</span><span className="text-sm font-bold text-alert-400">-20%</span></div>
                        <div><span className="text-[10px] text-slate-500 uppercase tracking-wider block">Source</span><span className="text-xs text-slate-400">GST Network Analysis</span></div>
                    </div>
                </div>
            )}
        </div>
    );
};
