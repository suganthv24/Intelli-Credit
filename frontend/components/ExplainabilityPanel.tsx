"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus } from "lucide-react";

interface ExplainabilityPanelProps {
  data: {
    risk_factors: string[];
    positive_signals: string[];
  };
}

export default function ExplainabilityPanel({ data }: ExplainabilityPanelProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="border-red-100">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center">
              <Plus className="h-3 w-3" />
            </Badge>
            Primary Risk Drivers
          </CardTitle>
          <CardDescription>Negative signals impacting the score</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {data.risk_factors.map((factor, idx) => (
              <li key={idx} className="text-sm flex items-start gap-2">
                <span className="text-red-500 font-bold">+</span>
                {factor}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-green-100">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Badge variant="outline" className="h-5 w-5 rounded-full p-0 flex items-center justify-center border-green-500 text-green-500">
              <Minus className="h-3 w-3" />
            </Badge>
            Positive Indicators
          </CardTitle>
          <CardDescription>Factors supporting credit strength</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {data.positive_signals.map((signal, idx) => (
              <li key={idx} className="text-sm flex items-start gap-2">
                <span className="text-green-500 font-bold">-</span>
                {signal}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
