"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, AlertTriangle, IndianRupee, Percent } from "lucide-react";

interface RiskDashboardProps {
  data: {
    loan_decision: string;
    risk_probability: number;
    recommended_limit: number;
    interest_rate: number;
    fraud_flag: boolean;
  };
}

export default function RiskDashboard({ data }: RiskDashboardProps) {
  const isApproved = data.loan_decision === "APPROVED";
  const probabilityPercent = Math.round(data.risk_probability * 100);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Loan Decision</CardTitle>
          {isApproved ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.loan_decision}</div>
          <p className="text-xs text-muted-foreground">
            Based on ML risk assessment
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Risk Probability</CardTitle>
          <AlertTriangle className={`h-4 w-4 ${probabilityPercent > 50 ? 'text-red-500' : 'text-yellow-500'}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{probabilityPercent}%</div>
          <Progress value={probabilityPercent} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recommended Limit</CardTitle>
          <IndianRupee className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₹{(data.recommended_limit / 10000000).toFixed(2)} Cr
          </div>
          <p className="text-xs text-muted-foreground">
            Maximum exposure limit
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Interest Rate</CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.interest_rate}%</div>
          <p className="text-xs text-muted-foreground">
            Risk-adjusted pricing
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-4 border-red-200 bg-red-50/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            Fraud Detection System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-sm">Status:</span>
            {data.fraud_flag ? (
              <Badge variant="destructive">ANOMALY DETECTED</Badge>
            ) : (
              <Badge variant="outline" className="text-green-600 border-green-600">CLEAN</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
