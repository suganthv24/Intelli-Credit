"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { cn } from "@/lib/utils";

interface TimelineDataPoint {
  year: number;
  risk_score: number;
}

interface RiskTimelineProps {
  data: TimelineDataPoint[];
  className?: string;
}

export function RiskTimeline({ data, className }: RiskTimelineProps) {
  // Custom tooltip to format risk score and determine band
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const score = payload[0].value;
      let band = "LOW";
      let color = "#8DE5A1";
      
      if (score >= 30) { band = "MODERATE"; color = "#FFB482"; }
      if (score >= 55) { band = "HIGH"; color = "#ffd400"; }
      if (score >= 75) { band = "CRITICAL"; color = "#f04438"; }

      return (
        <div className="bg-[#1D1D20] border border-[#3f3f46] p-3 rounded-md shadow-xl">
          <p className="font-medium text-[#909094] mb-1">{label}</p>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-xl text-[#fbfbff]">{score}</span>
            <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${color}20`, color }}>
              {band}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn("w-full h-full min-h-[300px] flex flex-col", className)}>
      <div className="mb-4">
        <h3 className="text-lg font-bold text-[#fbfbff]">Risk Trend Analysis</h3>
        <p className="text-sm text-[#909094]">Historical credit risk evolution</p>
      </div>

      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" />
            
            {/* Background color bands for risk levels */}
            <ReferenceLine y={30} stroke="#8DE5A1" strokeDasharray="3 3" opacity={0.5} />
            <ReferenceLine y={55} stroke="#FFB482" strokeDasharray="3 3" opacity={0.5} />
            <ReferenceLine y={75} stroke="#ffd400" strokeDasharray="3 3" opacity={0.5} />

            <XAxis 
              dataKey="year" 
              stroke="#909094" 
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#3f3f46' }}
              padding={{ left: 20, right: 20 }}
            />
            <YAxis 
              stroke="#909094" 
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#3f3f46' }}
              domain={[0, 100]}
              ticks={[0, 30, 55, 75, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            
            <Line
              type="monotone"
              dataKey="risk_score"
              stroke="#A1C9F4"
              strokeWidth={3}
              dot={{ fill: '#1D1D20', stroke: '#A1C9F4', strokeWidth: 2, r: 4 }}
              activeDot={{ fill: '#A1C9F4', stroke: '#1D1D20', strokeWidth: 2, r: 6 }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
