import React, { useState } from 'react';

interface ExplainabilityTooltipProps {
    source: string;
    detail?: string;
    children: React.ReactNode;
}

export const ExplainabilityTooltip: React.FC<ExplainabilityTooltipProps> = ({ source, detail, children }) => {
    const [show, setShow] = useState(false);

    return (
        <span
            className="relative inline-flex items-center cursor-help"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            <span className="border-b border-dashed border-navy-500/50">{children}</span>
            <svg className="w-3 h-3 ml-1 text-cyan-400 opacity-60" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm1 12H7V7h2v5zM8 6a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
            {show && (
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 min-w-[220px] max-w-[320px] p-3 rounded-lg bg-navy-800 border border-white/10 shadow-2xl text-xs text-slate-300 whitespace-normal animate-fade-in">
                    <span className="block text-cyan-400 font-semibold mb-1 text-[10px] uppercase tracking-wider">Source</span>
                    <span className="block mb-1">{source}</span>
                    {detail && (
                        <>
                            <span className="block text-cyan-400 font-semibold mt-2 mb-1 text-[10px] uppercase tracking-wider">Detail</span>
                            <span className="block text-slate-400">{detail}</span>
                        </>
                    )}
                    <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-navy-800" />
                </span>
            )}
        </span>
    );
};
