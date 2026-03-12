"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { cn } from "@/lib/utils";

interface FeatureAttribution {
  feature: string;
  contribution: number;
}

interface FeatureAttributionChartProps {
  data: FeatureAttribution[];
  className?: string;
}

export function FeatureAttributionChart({ data, className }: FeatureAttributionChartProps) {
  // Format data for display: capitalize and replace underscores
  const formattedData = data.map((item) => ({
    ...item,
    displayName: item.feature
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
    // Determine color based on positive (increases risk) or negative (decreases risk)
    fill: item.contribution > 0 ? "#f04438" : "#A1C9F4", // Risk red vs Brand blue
    direction: item.contribution > 0 ? "Increases Risk" : "Reduces Risk"
  }));

  // Sort by absolute contribution size for better visual weight
  const sortedData = [...formattedData].sort(
    (a, b) => Math.abs(b.contribution) - Math.abs(a.contribution)
  );

  return (
    <div className={cn("w-full h-full min-h-[300px] flex flex-col", className)}>
      <div className="mb-4">
        <h3 className="text-lg font-bold text-[#fbfbff]">Feature Contributions</h3>
        <p className="text-sm text-[#909094]">SHAP-style attribution (Explainable AI)</p>
      </div>

      <div className="flex-1 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            barSize={16}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#3f3f46" />
            <XAxis 
              type="number" 
              stroke="#909094" 
              fontSize={12}
              tickFormatter={(val) => `${val > 0 ? '+' : ''}${val.toFixed(2)}`}
            />
            <YAxis 
              dataKey="displayName" 
              type="category" 
              stroke="#fbfbff" 
              fontSize={12}
              width={140}
              tick={{ fill: '#fbfbff' }}
            />
            <Tooltip
              cursor={{ fill: '#27272a' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-[#1D1D20] border border-[#3f3f46] p-3 rounded-md shadow-xl">
                      <p className="font-bold text-[#fbfbff] mb-1">{data.displayName}</p>
                      <p className="text-sm flex items-center gap-2">
                        <span className={data.contribution > 0 ? "text-[#f04438]" : "text-[#A1C9F4]"}>
                          {data.contribution > 0 ? "↑" : "↓"} {Math.abs(data.contribution).toFixed(4)}
                        </span>
                        <span className="text-[#909094]">({data.direction})</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="contribution" radius={[0, 4, 4, 0]}>
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 flex justify-center gap-6 text-xs text-[#909094]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#f04438]" />
          <span>Increases Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#A1C9F4]" />
          <span>Reduces Risk</span>
        </div>
      </div>
    </div>
  );
}
