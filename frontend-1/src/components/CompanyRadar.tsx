"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { cn } from "@/lib/utils";

interface RiskProfile {
  category: string;
  score: number; // 0 to 100
  label: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
}

interface CompanyRadarProps {
  data: RiskProfile[];
  className?: string;
}

export function CompanyRadar({ data, className }: CompanyRadarProps) {
  // Format data for Recharts Radar
  const radarData = data.map(item => ({
    subject: item.category,
    A: item.score,
    fullMark: 100,
    label: item.label
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      let color = "#8DE5A1"; // LOW
      if (data.label === "MODERATE") color = "#FFB482";
      if (data.label === "HIGH") color = "#ffd400";
      if (data.label === "CRITICAL") color = "#f04438";

      return (
        <div className="bg-[#1D1D20] border border-[#3f3f46] p-3 rounded-md shadow-xl">
          <p className="font-bold text-[#fbfbff] mb-1">{data.subject}</p>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[#909094] text-sm">Risk Score:</span>
            <span className="font-bold text-[#fbfbff]">{data.A}/100</span>
          </div>
          <div className="mt-2 text-xs font-bold px-2 py-1 rounded w-fit" style={{ backgroundColor: `${color}20`, color }}>
            {data.label} RISK
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn("w-full h-full min-h-[300px] flex flex-col", className)}>
      <div className="mb-2">
        <h3 className="text-lg font-bold text-[#fbfbff]">Company Risk Profile</h3>
        <p className="text-sm text-[#909094]">Multi-dimensional risk assessment</p>
      </div>

      <div className="flex-1 w-full relative -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
            <PolarGrid stroke="#3f3f46" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#fbfbff', fontSize: 11 }} 
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={{ fill: '#909094', fontSize: 10 }}
              tickCount={5}
              stroke="#3f3f46"
            />
            <Radar
              name="Risk Score"
              dataKey="A"
              stroke="#A1C9F4"
              strokeWidth={2}
              fill="#A1C9F4"
              fillOpacity={0.4}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
