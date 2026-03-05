import React from 'react';

interface ScoreRingProps {
    score: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    label?: string;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
    score,
    size = 80,
    strokeWidth = 6,
    color,
    label,
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const getColor = () => {
        if (color) return color;
        if (score >= 80) return '#10b981';
        if (score >= 60) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div className="flex flex-col items-center gap-1">
            <svg width={size} height={size} className="-rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(100,116,139,0.2)"
                    strokeWidth={strokeWidth}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={getColor()}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
                <span className="text-lg font-bold text-white">{score}</span>
                {label && <span className="text-[10px] text-slate-400 uppercase tracking-wider">{label}</span>}
            </div>
        </div>
    );
};
