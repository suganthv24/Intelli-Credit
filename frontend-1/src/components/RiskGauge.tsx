"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface RiskGaugeProps {
  score: number;
  band: string;
  decision: string;
  className?: string;
}

// AI palette colors for the risk bands
const RISK_COLORS = [
  "#8DE5A1", // Low (0-30)
  "#FFB482", // Moderate (30-55)
  "#ffd400", // High (55-75)
  "#f04438", // Critical (75-100)
];

const GAUGE_DATA = [
  { name: "Low", value: 30, color: RISK_COLORS[0] },
  { name: "Moderate", value: 25, color: RISK_COLORS[1] },
  { name: "High", value: 20, color: RISK_COLORS[2] },
  { name: "Critical", value: 25, color: RISK_COLORS[3] },
];

export function RiskGauge({ score, band, decision, className }: RiskGaugeProps) {
  // Convert score (0-100) to angle (-180 to 0)
  // Recharts Pie starts at 180 (left) and ends at 0 (right)
  const scoreRatio = Math.min(Math.max(score, 0), 100) / 100;
  const angle = 180 - scoreRatio * 180;
  
  // Calculate pointer coordinates
  const cx = 50;
  const cy = 100; // bottom of container for semi-circle
  const r = 40; // radius

  // Map decision to a specific color
  let decisionColor = "#909094";
  if (decision === "APPROVED") decisionColor = RISK_COLORS[0];
  if (decision === "CONDITIONAL") decisionColor = RISK_COLORS[1];
  if (decision === "REVIEW") decisionColor = RISK_COLORS[2];
  if (decision === "DECLINED") decisionColor = RISK_COLORS[3];

  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      <div className="h-[160px] w-full max-w-[320px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={GAUGE_DATA}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius="75%"
              outerRadius="100%"
              paddingAngle={2}
              dataKey="value"
              stroke="none"
              isAnimationActive={true}
            >
              {GAUGE_DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        <div 
          className="absolute bottom-0 left-1/2 w-1 h-[75%] origin-bottom bg-[#fbfbff] transition-transform duration-1000 ease-out z-10 rounded-full"
          style={{ 
            transform: `translateX(-50%) rotate(${scoreRatio * 180 - 90}deg)`,
            transformOrigin: "bottom center"
          }}
        >
          <div className="absolute -bottom-2 -left-1.5 w-4 h-4 rounded-full bg-[#fbfbff] border-4 border-[#27272a]" />
        </div>
      </div>
      
      {/* ── Center Label ────────────────────────────────────────────────── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center mt-8">
        <p className="text-[10px] font-bold text-[#909094] uppercase tracking-widest mb-1">AI INSIGHT</p>
        <div className="text-4xl font-black text-[#fbfbff] tracking-tighter leading-none mb-1">
          {score.toFixed(1)}
        </div>
        <p className={cn("text-[10px] font-black px-2 py-0.5 rounded inline-block", 
          score < 30 ? "bg-[#8DE5A1]/20 text-[#8DE5A1]" : 
          score < 55 ? "bg-[#FFB482]/20 text-[#FFB482]" : 
          score < 75 ? "bg-[#ffd400]/20 text-[#ffd400]" : "bg-[#f04438]/20 text-[#f04438]"
        )}>
          {band}
        </p>
      </div>
      
      {/* Metrics breakdown */}
      <div className="mt-6 flex w-full flex-col items-center justify-center space-y-2 text-center">
        <div className="flex items-center gap-3">
          <span className="text-4xl font-bold tracking-tight text-[#fbfbff]">{score.toFixed(1)}</span>
          <span className="text-lg font-medium text-[#909094]">/ 100</span>
        </div>
        
        <div className="flex flex-col gap-1 w-full max-w-xs pt-3 border-t border-[#3f3f46]">
          <div className="flex justify-between items-center px-2 py-1">
            <span className="text-sm font-medium text-[#909094]">Risk Band</span>
            <span className="text-sm font-bold uppercase tracking-wider" style={{ color: decisionColor }}>{band}</span>
          </div>
          <div className="flex justify-between items-center px-2 py-1 bg-[#27272a] rounded-md">
            <span className="text-sm font-medium text-[#909094]">Decision</span>
            <span className="text-base font-bold uppercase tracking-wider" style={{ color: decisionColor }}>{decision}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
