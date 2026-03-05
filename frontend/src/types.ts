// ─── Credit Application Data Types ──────────────────────────────
// All types mirror the structure of mock_credit_data.json
// and are ready for /api/v1/ endpoint responses.

export interface BorrowerDetails {
    name: string;
    cin: string;
    pan: string;
    gstin: string;
    incorporation_date: string;
    sector: string;
    promoter: string;
    cibil_score: number;
    cibil_rating: string;
    loan_requested: number;
    existing_exposure: number;
}

export interface FiveC {
    label: string;
    score: number;
    risk: string;
    tooltip: string;
    factors: string[];
    key_metric: string;
}

export interface FinancialMetric {
    value: number;
    target?: number;
    unit?: string;
    trend: number[];
}

export interface FinancialHealth {
    dscr: FinancialMetric;
    current_ratio: FinancialMetric;
    tnw: FinancialMetric;
    debt_equity: FinancialMetric;
    interest_coverage: FinancialMetric;
    years: string[];
}

export interface GSTAnalytics {
    mismatch_percent: number;
    months: string[];
    gstr1_turnover: number[];
    bank_credits: number[];
    itc_utilization: number[];
    gstr2a_3b_mismatch: number[];
}

export interface NetworkNode {
    id: string;
    label: string;
    type: 'borrower' | 'counterparty' | 'external';
    x: number;
    y: number;
}

export interface NetworkEdge {
    from: string;
    to: string;
    amount: number;
    circular: boolean;
}

export interface NetworkGraph {
    nodes: NetworkNode[];
    edges: NetworkEdge[];
}

export interface MPBFBreakdownItem {
    label: string;
    value: number;
}

export interface MPBF {
    current_assets: number;
    current_liabilities: number;
    target_current_ratio: number;
    breakdown: MPBFBreakdownItem[];
}

export interface RiskFlag {
    id: number;
    title: string;
    severity: 'critical' | 'warning' | 'info';
    description: string;
    date: string;
    source: string;
}

export interface LitigationRecord {
    cnr: string;
    court: string;
    case_type: string;
    status: string;
    filing_date: string;
    next_hearing: string | null;
    petitioner: string;
    respondent: string;
    claim_amount: number;
    summary: string;
}

export interface MCAFiling {
    date: string;
    form: string;
    description: string;
}

export interface AIDecision {
    verdict: string;
    confidence: number;
    suggested_limit: number;
    risk_premium: number;
    tenor_months: number;
    conditions: string[];
}

export interface SHAPExplanation {
    factor: string;
    impact: number;
    direction: 'positive' | 'negative';
    source: string;
    detail: string;
}

export interface PipelineStage {
    id: number;
    label: string;
    description: string;
}

export interface SampleDocument {
    name: string;
    type: string;
    size: string;
    status: 'verified' | 'warning' | 'processing' | 'pending';
    dna_score: number;
    stage: number;
    flags: string[];
}

export interface FinancialRatio {
    ratio: string;
    fy22: string;
    fy23: string;
    fy24: string;
    benchmark: string;
    status: string;
}

export interface CAMSections {
    executive_summary: string;
    financial_ratios: FinancialRatio[];
    risk_mitigants: string[];
    sanction_conditions: string[];
}

export interface ActiveLoan {
    type: string;
    amount: number;
    status: string;
    next_due: string;
}

export interface CreditHealthPoint {
    month: string;
    score: number;
}

export interface RecentDocument {
    name: string;
    date: string;
}

export interface PendingTask {
    title: string;
    due_date: string;
    priority: string;
}

export interface PipelineCard {
    company: string;
    amount: number;
    status: string | null;
    status_type: string | null;
    badge: string | null;
}

export interface PipelineColumn {
    id: string;
    title: string;
    cards: PipelineCard[];
}

// ─── Root Data Model ────────────────────────────────────────────
export interface CreditData {
    application_id: string;
    borrower_details: BorrowerDetails;
    five_cs: FiveC[];
    financial_health: FinancialHealth;
    gst_analytics: GSTAnalytics;
    network_graph: NetworkGraph;
    mpbf: MPBF;
    risk_flags: RiskFlag[];
    litigation_records: LitigationRecord[];
    mca_filings: MCAFiling[];
    ai_decision: AIDecision;
    shap_explanations: SHAPExplanation[];
    pipeline_stages: PipelineStage[];
    sample_documents: SampleDocument[];
    cam_sections: CAMSections;
    active_loans: ActiveLoan[];
    credit_health_trend: CreditHealthPoint[];
    recent_documents: RecentDocument[];
    pending_tasks: PendingTask[];
    pipeline_columns: PipelineColumn[];
}
