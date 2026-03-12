import { create } from "zustand";

// ── Types matching the backend CreditAnalysisResponse ──────────────────────

export interface FeatureAttribution {
  feature: string;
  value: number;
  contribution: number;
  direction: "increases_risk" | "reduces_risk";
}

export interface DocumentSummary {
  doc_id: string;
  doc_type: string;
  char_count: number;
}

export interface FraudFlag {
  flag_id: string;
  flag_name: string;
  severity: string;
  description: string;
  doc_id: string;
}

export interface RiskFlagSummary {
  category: string;
  flagged: boolean;
  trigger_count: number;
}

// ── New: SWOT Analysis ──────────────────────────────────────────────────────

export interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

// ── New: Legal & MCA Intelligence ──────────────────────────────────────────

export interface LitigationRecord {
  case_id: string;
  case_type: string;
  status: string;
  amount_involved?: number;
  filing_date?: string;
  description?: string;
}

// ── New: Primary Insight Processing Output ─────────────────────────────────

export interface PrimaryInsightOutput {
  operational_risk_score?: number;
  management_quality_score?: number;
  capacity_utilization_estimate?: number;
  key_observations?: string[];
}

// ── Main Analysis Interface ─────────────────────────────────────────────────

export interface CreditAnalysis {
  // Core decision
  risk_score: number;
  risk_band: string;
  recommendation: string;
  loan_limit: number;
  interest_rate: number | null;

  // Report
  cam_report_url: string;
  cam_summary_excerpt: string;

  // Analytics
  model_auc: number;
  feature_attributions: FeatureAttribution[];
  documents_processed: DocumentSummary[];
  fraud_flags: FraudFlag[];
  risk_flag_summary: RiskFlagSummary[];

  // Regulatory
  regulatory_compliance_score: number;
  gst_compliance_risk: string;
  rbi_exposure_risk: string;
  policy_flags: { flag: string; severity: string }[];

  // Financial
  financial_consistency_score: number;
  confidence_score: number;
  cross_document_flags: { issue: string; severity: string }[];
  cross_doc_fraud_signals: string[];

  // News
  news_headlines: { headline: string; source: string; sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL" }[];
  sentiment_scores: { positive: number; neutral: number; negative: number };

  // Timeline
  analysis_timeline: { step: string; timestamp: string; description: string }[];

  // SWOT
  swot_analysis?: SWOTAnalysis;

  // Legal & MCA
  litigation_records?: LitigationRecord[];
  director_risk_score?: number;
  legal_risk_summary?: string;

  // Primary Insights processed output
  primary_insight_output?: PrimaryInsightOutput;

  // Company metadata (echoed from request)
  company_name: string;
  promoter_name: string;
  sector: string;
  CIN?: string;
  PAN?: string;
  turnover?: number;
  loan_amount_requested?: number;
  loan_type?: string;
  loan_tenure?: string;

  analysis_id: string;
  analysed_at: string;
}

// ── Document Classification (HITL) ─────────────────────────────────────────

export type DocumentType =
  | "annual_report"
  | "shareholding_pattern"
  | "alm_report"
  | "borrowing_profile"
  | "portfolio_performance"
  | "unknown";

export interface ClassifiedDocument {
  doc_id: string;
  file: File;
  label: string;
  suggested_type: DocumentType;
  confirmed_type: DocumentType;
  confidence: number;
}

// ── Zustand Store ──────────────────────────────────────────────────────────

interface CreditStoreState {
  analysis: CreditAnalysis | null;
  isLoading: boolean;
  error: string | null;
  setAnalysis: (data: CreditAnalysis) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useCreditStore = create<CreditStoreState>((set) => ({
  analysis: null,
  isLoading: false,
  error: null,
  setAnalysis: (data) => set({ analysis: data, isLoading: false, error: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),
  reset: () => set({ analysis: null, isLoading: false, error: null }),
}));
