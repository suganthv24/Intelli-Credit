"use client";

import { useState, useEffect } from "react";
import Header from "@/components/dashboard/Header";
import KPICards from "@/components/dashboard/KPICards";
import DocumentUpload from "@/components/dashboard/DocumentUpload";
import FraudDetection from "@/components/dashboard/FraudDetection";
import RiskIndicators from "@/components/dashboard/RiskIndicators";
import Charts from "@/components/dashboard/Charts";
import DueDiligence from "@/components/dashboard/DueDiligence";
import FinalReport from "@/components/dashboard/FinalReport";
import ExternalIntelligence from "@/components/dashboard/ExternalIntelligence";
import { runAnalysis, fetchDashboardData } from "@/services/api";
import { Loader2, CheckCircle2, Circle } from "lucide-react";

export default function Dashboard() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // New States
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dueDiligenceNotes, setDueDiligenceNotes] = useState<any>({
    utilization: 82,
    inventory: 'Normal',
    notes: ''
  });

  useEffect(() => {
    // Start with a clean slate on refresh
    setUploadedFiles([]);
    setAnalysisData(null);
    setIsInitializing(false);
  }, []);

  const handleRunAnalysis = async () => {
    if (uploadedFiles.length === 0) {
      alert("Please upload documents before running analysis.");
      return;
    }
    
    setIsAnalyzing(true);
    setLoadingStep(0);
    try {
      // Step 1: Document Processing already done conceptually, simulate next steps
      await new Promise(r => setTimeout(r, 800));
      setLoadingStep(1); // Analyzing Financial Statements
      await new Promise(r => setTimeout(r, 1200));
      setLoadingStep(2); // Performing Web Research
      await new Promise(r => setTimeout(r, 1500));
      setLoadingStep(3); // Generating Recommendation
      
      const result = await runAnalysis({
        financial: {
          debt: 1200000,
          equity: 800000,
          revenue_current: 5000000,
          revenue_previous: 4200000,
          ebit: 850000,
          interest_expense: 150000,
        }
      });
      
      await new Promise(r => setTimeout(r, 600));
      setLoadingStep(4); // CAM ready
      setAnalysisData(result);
    } catch (error) {
      console.error(error);
      alert("Analysis failed. Ensure the backend is running.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Safe defaults if analysis hasn't run
  const recommendationData = analysisData?.recommendation || {
    loan_decision: "PENDING",
    risk_probability: 0.0,
    recommended_limit: 0,
    interest_rate: 0,
  };

  const rawFinancials = analysisData?.financial_analysis;
  const financialsData = {
    revenue: rawFinancials?.revenue_trend ? rawFinancials.revenue_trend.map((t: any) => t.revenue) : [0, 0, 0, 0],
    labels: rawFinancials?.revenue_trend ? rawFinancials.revenue_trend.map((t: any) => t.period) : ["Q1", "Q2", "Q3", "Q4"],
    gst_sales: 1200000, // Assuming static fallback since external backend doesn't explicitly furnish this metric yet
    bank_deposits: 1150000,
  };

  const explanationData = analysisData?.explanation || {
    risk_factors: [],
    positive_signals: []
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const pipelineSteps = [
    "Running AI Credit Analysis...",
    "Analyzing Financial Statements...",
    "Performing Web Research...",
    "Generating Credit Recommendation...",
    "Finalizing UI..."
  ];

  const pipelineLabels = [
    "Document Processing",
    "Financial Analysis",
    "Research Agent",
    "Risk Modeling",
    "CAM Generation"
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased min-h-screen relative">
      
      {/* Loading Overlay */}
      {isAnalyzing && (
        <div className="absolute inset-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col items-center text-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
                {pipelineSteps[loadingStep]}
              </h2>
              
              <div className="w-full space-y-3">
                {pipelineLabels.map((label, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    {loadingStep > idx ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : loadingStep === idx ? (
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-300 dark:text-slate-600" />
                    )}
                    <span className={`${loadingStep === idx ? 'text-primary font-bold' : loadingStep > idx ? 'text-slate-500' : 'text-slate-400'}`}>
                      {label} {loadingStep > idx && "✓"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <Header onRunAnalysis={handleRunAnalysis} isAnalyzing={isAnalyzing} />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <KPICards data={recommendationData} />
        
        <DocumentUpload 
          uploadedFiles={uploadedFiles} 
          setUploadedFiles={setUploadedFiles} 
          isUploading={isUploading} 
          setIsUploading={setIsUploading} 
        />
        
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FraudDetection fraudFlag={analysisData?.recommendation?.fraud_flag || false} />
          <RiskIndicators explanation={explanationData} />
        </section>

        <ExternalIntelligence researchData={analysisData?.research_agent || null} />

        <Charts data={financialsData} />
        
        <DueDiligence 
          dueDiligenceNotes={dueDiligenceNotes} 
          setDueDiligenceNotes={setDueDiligenceNotes} 
        />
        
        <FinalReport analysisData={{...analysisData, diligence: dueDiligenceNotes}} />
      </main>
      
      <footer className="max-w-5xl mx-auto px-4 py-12 text-center text-slate-400 text-xs">
        <p>© 2024 Intelli-Credit AI • Regulatory Compliance V3.4.1 • Secure 256-bit Encrypted Session</p>
      </footer>
    </div>
  );
}
