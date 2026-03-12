"use client";

import { useCreditStore } from "@/store/creditStore";
import { RiskGauge } from "@/components/RiskGauge";
import { FeatureAttributionChart } from "@/components/FeatureAttributionChart";
import { FraudPanel, type FraudFlag } from "@/components/FraudPanel";
import { NewsPanel } from "@/components/NewsPanel";
import { RegulatoryPanel } from "@/components/RegulatoryPanel";
import { FinancialPanel } from "@/components/FinancialPanel";
import { AITimeline } from "@/components/AITimeline";
import { CompanyRadar } from "@/components/CompanyRadar";
import { AiChat } from "@/components/AiChat";
import SWOTPanel from "@/components/SWOTPanel";
import LegalMcaPanel from "@/components/LegalMcaPanel";
import InsightPanel from "@/components/InsightPanel";
import {
  Building2, Download, ArrowLeft, DollarSign, Briefcase, Hash,
  CreditCard, TrendingUp, Calendar, BarChart2,
} from "lucide-react";
import { useRouter } from "next/navigation";

// ── Helper ──────────────────────────────────────────────────────────────────

function InfoItem({ label, value, icon: Icon }: { label: string; value: string | number | undefined; icon: React.ElementType }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-[#52525b] mt-0.5 shrink-0" />
      <div>
        <p className="text-[10px] font-semibold text-[#52525b] uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-[#fbfbff]">{value}</p>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const analysis = useCreditStore((s) => s.analysis);
  const router = useRouter();

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
        <div className="w-20 h-20 rounded-full bg-[#27272a] border border-[#3f3f46] flex items-center justify-center">
          <Building2 className="w-10 h-10 text-[#909094]" />
        </div>
        <h2 className="text-2xl font-bold text-[#fbfbff]">No Analysis Data</h2>
        <p className="text-[#909094] max-w-md">
          Complete the onboarding wizard to trigger the Zerve AI credit analysis pipeline.
        </p>
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 bg-[#A1C9F4] hover:bg-[#8ebbf0] text-[#1D1D20] font-bold px-6 py-2.5 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Start New Analysis
        </button>
      </div>
    );
  }

  // ── Data Mappings (with safe fallbacks) ──────────────────────────────────

  const attributions = (analysis.feature_attributions || []).map((fa) => ({
    feature: fa.feature,
    contribution: fa.contribution,
  }));

  const fraudFlags: FraudFlag[] = (analysis.fraud_flags || []).map((ff) => ({
    flag_id: ff.flag_id,
    flag_name: ff.flag_name,
    description: ff.description,
    severity: (["HIGH", "MEDIUM", "LOW"].includes(ff.severity?.toUpperCase()) ? ff.severity.toUpperCase() : "LOW") as "HIGH" | "MEDIUM" | "LOW",
    doc_id: ff.doc_id,
  }));

  const flagSummary = analysis.risk_flag_summary || [];
  const radarData = flagSummary.filter((rf) => rf.flagged).map((rf) => {
    const score = Math.min(rf.trigger_count * 25, 100);
    return {
      category: rf.category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      score,
      label: (score >= 75 ? "CRITICAL" : score >= 55 ? "HIGH" : score >= 30 ? "MODERATE" : "LOW") as "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
    };
  });

  const fullRadar = radarData.length >= 3 ? radarData : flagSummary.map((rf) => {
    const score = rf.flagged ? Math.min(rf.trigger_count * 25 + 20, 100) : 10;
    return {
      category: rf.category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      score,
      label: (score >= 75 ? "CRITICAL" : score >= 55 ? "HIGH" : score >= 30 ? "MODERATE" : "LOW") as "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
    };
  });

  const timelineData = analysis.analysis_timeline || [];

  const newsArticles = (analysis.news_headlines || []).map((nh) => ({
    title: nh.headline,
    sentiment: nh.sentiment === "POSITIVE" ? 0.8 : nh.sentiment === "NEGATIVE" ? -0.8 : 0,
    label: (nh.sentiment?.toLowerCase() || "neutral") as "positive" | "negative" | "neutral",
    published_at: nh.source,
  }));

  const avgSentimentKey = analysis.sentiment_scores
    ? (analysis.sentiment_scores.positive - analysis.sentiment_scores.negative) /
      Math.max(1, analysis.sentiment_scores.positive + analysis.sentiment_scores.neutral + analysis.sentiment_scores.negative)
    : 0;

  const camFilename = analysis.cam_report_url?.split("/").pop() || "CAM_Report.pdf";
  const camProxyUrl = `/api/reports/${camFilename}`;

  const formatCurrency = (n?: number) =>
    n !== undefined ? `₹${(n / 1e7).toFixed(2)} Cr` : "—";

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto pb-12">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 w-full">
        <div>
          <button onClick={() => router.push("/")} className="flex items-center gap-1 text-sm text-[#909094] hover:text-[#fbfbff] transition-colors mb-2">
            <ArrowLeft className="w-3 h-3" /> New Analysis
          </button>
          <h1 className="text-3xl font-bold tracking-tight text-[#fbfbff] mb-1">Credit Intelligence Report</h1>
          <p className="text-[#909094] text-sm">
            Analysis ID: <span className="font-mono text-[#A1C9F4]">{analysis.analysis_id}</span>
            {" · "}{new Date(analysis.analysed_at).toLocaleString("en-IN")}
          </p>
        </div>
        <a
          href={camProxyUrl}
          download
          className="flex items-center gap-2 bg-[#A1C9F4] hover:bg-[#8ebbf0] text-[#1D1D20] font-bold px-4 py-2.5 rounded-lg transition-colors"
        >
          <Download className="w-5 h-5" />
          <span>Download CAM Report</span>
        </a>
      </div>

      {/* ── Company Overview Panel ─────────────────────────────────────────── */}
      <div className="bg-[#18181B] border border-[#27272a] rounded-2xl p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Company identity */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-[#A1C9F4]/10 border border-[#A1C9F4]/20 flex items-center justify-center shrink-0">
              <Building2 className="w-8 h-8 text-[#A1C9F4]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#fbfbff]">{analysis.company_name}</h2>
              <p className="text-sm text-[#909094]">{analysis.promoter_name} · {analysis.sector}</p>
              {analysis.loan_limit > 0 && (
                <span className="inline-block mt-1 text-sm font-bold text-[#ffd400] bg-[#ffd400]/10 px-2.5 py-0.5 rounded-full">
                  Approved Limit: {formatCurrency(analysis.loan_limit)}
                </span>
              )}
            </div>
          </div>

          {/* Entity metadata grid */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 pt-2 md:pt-0 border-t md:border-t-0 md:border-l border-[#27272a] md:pl-6">
            <InfoItem label="CIN" value={analysis.CIN} icon={Hash} />
            <InfoItem label="PAN" value={analysis.PAN} icon={CreditCard} />
            <InfoItem label="Annual Turnover" value={analysis.turnover !== undefined ? formatCurrency(analysis.turnover) : undefined} icon={TrendingUp} />
            <InfoItem label="Loan Requested" value={analysis.loan_amount_requested !== undefined ? formatCurrency(analysis.loan_amount_requested) : undefined} icon={DollarSign} />
            <InfoItem label="Loan Type" value={analysis.loan_type} icon={Briefcase} />
            <InfoItem label="Tenure" value={analysis.loan_tenure} icon={Calendar} />
          </div>
        </div>
      </div>

      {/* ── Row 1: Risk Gauge + AI Chat ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full h-[450px]">
        <div className="lg:col-span-4 bg-[#18181B] border border-[#27272a] rounded-2xl p-6 flex flex-col items-center">
          <div className="w-full mb-2">
            <h3 className="text-base font-bold text-[#fbfbff]">Underwriting Decision</h3>
            <p className="text-xs text-[#909094]">Model AUC: {(analysis.model_auc || 0).toFixed(2)}</p>
          </div>
          <div className="flex-1 w-full flex items-center justify-center">
            <RiskGauge score={analysis.risk_score} band={analysis.risk_band} decision={analysis.recommendation} className="mt-6" />
          </div>
        </div>

        <div className="lg:col-span-8 h-full">
          <AiChat
            initialMessage={`I've completed the analysis for **${analysis.company_name}**.\n\nRisk Score: **${analysis.risk_score}/100** (${analysis.risk_band})\nDecision: **${analysis.recommendation}**\nLoan Limit: ${formatCurrency(analysis.loan_limit)}\n\n${(analysis.cam_summary_excerpt || "").substring(0, 200)}...\n\nAsk me anything about this credit decision.`}
            className="h-full shadow-lg"
          />
        </div>
      </div>

      {/* ── Row 2: Feature Attributions + Fraud ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full h-[380px]">
        <div className="lg:col-span-8 bg-[#18181B] border border-[#27272a] rounded-2xl p-6 h-full overflow-hidden">
          <FeatureAttributionChart data={attributions} />
        </div>
        <div className="lg:col-span-4 h-full">
          <div className="bg-[#18181B] border border-[#27272a] rounded-2xl p-5 h-full overflow-hidden flex flex-col">
            <FraudPanel flags={fraudFlags} cross_doc_fraud_signals={analysis.cross_doc_fraud_signals || []} />
          </div>
        </div>
      </div>

      {/* ── Row 3: Regulatory + Financial + News ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        <div className="bg-[#18181B] border border-[#27272a] rounded-2xl p-5 min-h-[320px]">
          <RegulatoryPanel
            score={analysis.regulatory_compliance_score || 0}
            gstRisk={analysis.gst_compliance_risk || "UNKNOWN"}
            rbiRisk={analysis.rbi_exposure_risk || "UNKNOWN"}
            policyFlags={analysis.policy_flags || []}
          />
        </div>
        <div className="bg-[#18181B] border border-[#27272a] rounded-2xl p-5 min-h-[320px]">
          <FinancialPanel
            score={analysis.financial_consistency_score || 0}
            confidence_score={analysis.confidence_score || 0}
            flags={analysis.cross_document_flags || []}
          />
        </div>
        <div className="bg-[#18181B] border border-[#27272a] rounded-2xl overflow-hidden min-h-[320px]">
          <NewsPanel articles={newsArticles} averageSentiment={avgSentimentKey} />
        </div>
      </div>

      {/* ── Row 4: SWOT Analysis ─────────────────────────────────────────── */}
      {analysis.swot_analysis && (
        <SWOTPanel swot={analysis.swot_analysis} />
      )}

      {/* ── Row 5: Legal & MCA + Primary Insight ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        <LegalMcaPanel
          litigationRecords={analysis.litigation_records || []}
          directorRiskScore={analysis.director_risk_score}
          legalRiskSummary={analysis.legal_risk_summary}
        />
        <InsightPanel
          insights={analysis.primary_insight_output || {}}
        />
      </div>

      {/* ── Row 6: Timeline + Radar + CAM Summary ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full h-[450px]">
        <div className="lg:col-span-4 bg-[#18181B] border border-[#27272a] rounded-2xl p-5 h-full overflow-hidden">
          <AITimeline timeline={timelineData} />
        </div>
        <div className="lg:col-span-4 bg-[#18181B] border border-[#27272a] rounded-2xl p-5 h-full overflow-hidden">
          <CompanyRadar data={fullRadar} />
        </div>
        <div className="lg:col-span-4 bg-[#18181B] border border-[#27272a] rounded-2xl p-5 h-full flex flex-col">
          <h3 className="text-base font-bold text-[#fbfbff] mb-1">CAM Summary</h3>
          <p className="text-xs text-[#909094] mb-3">Credit Appraisal Memo excerpt</p>
          <div className="flex-1 overflow-y-auto pr-1">
            <p className="text-sm text-[#d4d4d8] whitespace-pre-wrap leading-relaxed">
              {analysis.cam_summary_excerpt || "CAM summary will appear here after AI analysis completes."}
            </p>
          </div>
          <a
            href={camProxyUrl}
            download
            className="mt-4 flex items-center justify-center gap-2 bg-[#A1C9F4]/10 hover:bg-[#A1C9F4]/20 text-[#A1C9F4] font-bold px-4 py-2 rounded-lg transition-colors border border-[#A1C9F4]/30 text-sm"
          >
            <Download className="w-4 h-4" /> Full CAM PDF
          </a>
        </div>
      </div>

    </div>
  );
}
