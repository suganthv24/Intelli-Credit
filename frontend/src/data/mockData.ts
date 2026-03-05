// ─── Company Profile ─────────────────────────────────────────────
export const companyProfile = {
    name: 'Bharat Steel Industries Ltd.',
    cin: 'L27100MH2005PLC123456',
    pan: 'AABCB1234F',
    gstin: '27AABCB1234F1Z5',
    incorporationDate: '2005-06-15',
    sector: 'Iron & Steel Manufacturing',
    promoter: 'Rajesh K. Mehta',
    cibilScore: 742,
    cibilRating: 'BBB+',
    loanRequested: 45, // INR Cr
    existingExposure: 22.5, // INR Cr
};

// ─── Five Cs Scores ──────────────────────────────────────────────
export const fiveCsScores = [
    {
        label: 'Character',
        score: 78,
        risk: 'Moderate',
        tooltip: 'Based on CIBIL Commercial Score (742), promoter track record, and litigation history.',
        factors: ['CIBIL Score: 742 (BBB+)', 'Promoter experience: 18 yrs', '2 pending litigations'],
    },
    {
        label: 'Capacity',
        score: 82,
        risk: 'Low',
        tooltip: 'Derived from DSCR (1.85x), revenue trends, and debt-to-equity ratio.',
        factors: ['DSCR: 1.85x', 'Revenue CAGR: 12%', 'Debt-to-Equity: 1.2'],
    },
    {
        label: 'Capital',
        score: 71,
        risk: 'Moderate',
        tooltip: 'Assessed via Tangible Net Worth, capital adequacy, and promoter contribution.',
        factors: ['TNW: ₹38.5 Cr', 'Promoter Stake: 62%', 'Capital Infusion: ₹5 Cr (FY24)'],
    },
    {
        label: 'Collateral',
        score: 88,
        risk: 'Low',
        tooltip: 'Primary: Plant & Machinery (₹52 Cr). Collateral cover ratio: 1.45x.',
        factors: ['Primary Security: ₹52 Cr', 'Collateral Cover: 1.45x', 'Insurance: Current'],
    },
    {
        label: 'Conditions',
        score: 65,
        risk: 'Elevated',
        tooltip: 'Steel sector headwinds due to global oversupply. Domestic demand stable.',
        factors: ['Sector Outlook: Neutral', 'Global oversupply risk', 'Govt infra push: Positive'],
    },
];

// ─── Financial Health ────────────────────────────────────────────
export const financialHealth = {
    dscr: { value: 1.85, target: 1.5, trend: [1.42, 1.55, 1.68, 1.72, 1.85] as number[] },
    currentRatio: { value: 1.38, target: 1.33, trend: [1.21, 1.25, 1.30, 1.35, 1.38] as number[] },
    tnw: { value: 38.5, unit: '₹ Cr', trend: [28.2, 30.1, 33.4, 36.0, 38.5] as number[] },
    debtEquity: { value: 1.2, trend: [1.8, 1.6, 1.45, 1.3, 1.2] as number[] },
    interestCoverage: { value: 3.2, trend: [2.1, 2.5, 2.8, 3.0, 3.2] as number[] },
    years: ['FY20', 'FY21', 'FY22', 'FY23', 'FY24'],
};

// ─── GST Analytics ───────────────────────────────────────────────
export const gstAnalytics = {
    mismatchPercent: 8.7,
    months: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    gstr1Turnover: [4.2, 4.5, 3.8, 5.1, 4.9, 5.3, 5.5, 4.8, 6.2, 5.8, 5.0, 6.5],
    bankCredits: [3.9, 4.1, 3.6, 4.7, 4.5, 4.9, 5.0, 4.4, 5.7, 5.4, 4.6, 5.9],
    itcUtilization: [82, 78, 85, 80, 77, 83, 79, 81, 76, 84, 80, 78],
    gstr2a3bMismatch: [2.1, 3.4, 1.8, 4.2, 3.1, 2.5, 5.1, 3.8, 4.5, 2.9, 3.2, 4.0],
};

// ─── Revenue Synthesis ───────────────────────────────────────────
export const revenueSynthesis = gstAnalytics.months.map((month, i) => ({
    month,
    gstr1: gstAnalytics.gstr1Turnover[i],
    bankCredits: gstAnalytics.bankCredits[i],
    discrepancy: +(gstAnalytics.gstr1Turnover[i] - gstAnalytics.bankCredits[i]).toFixed(2),
}));

// ─── Network Graph (Circular Trading) ───────────────────────────
export const networkNodes = [
    { id: 'bharat', label: 'Bharat Steel', type: 'borrower' as const, x: 300, y: 200 },
    { id: 'apex', label: 'Apex Trading Co.', type: 'counterparty' as const, x: 520, y: 100 },
    { id: 'nova', label: 'Nova Metals Pvt.', type: 'counterparty' as const, x: 520, y: 300 },
    { id: 'zenith', label: 'Zenith Logistics', type: 'counterparty' as const, x: 150, y: 80 },
    { id: 'pioneer', label: 'Pioneer Infra', type: 'counterparty' as const, x: 100, y: 320 },
    { id: 'global', label: 'Global Raw Mat.', type: 'external' as const, x: 680, y: 200 },
];

export const networkEdges = [
    { from: 'bharat', to: 'apex', amount: 2.8, circular: true },
    { from: 'apex', to: 'nova', amount: 2.5, circular: true },
    { from: 'nova', to: 'bharat', amount: 2.3, circular: true },
    { from: 'bharat', to: 'zenith', amount: 1.5, circular: false },
    { from: 'pioneer', to: 'bharat', amount: 3.2, circular: false },
    { from: 'global', to: 'apex', amount: 4.1, circular: false },
    { from: 'bharat', to: 'pioneer', amount: 0.8, circular: false },
];

// ─── MPBF Calculator ─────────────────────────────────────────────
export const mpbfData = {
    currentAssets: 62.4,    // ₹ Cr
    currentLiabilities: 28.1,
    get mpbf() { return +((0.75 * this.currentAssets) - this.currentLiabilities).toFixed(2); },
    get currentRatio() { return +(this.currentAssets / this.currentLiabilities).toFixed(2); },
    targetCurrentRatio: 1.33,
    breakdown: [
        { label: 'Inventory', value: 24.5 },
        { label: 'Receivables', value: 18.3 },
        { label: 'Cash & Bank', value: 8.2 },
        { label: 'Other Current Assets', value: 11.4 },
    ],
    liabilityBreakdown: [
        { label: 'Sundry Creditors', value: 14.2 },
        { label: 'Short-term Borrowings', value: 8.5 },
        { label: 'Other CL', value: 5.4 },
    ],
};

// ─── Risk Flags (EWS) ───────────────────────────────────────────
export const riskFlags = [
    { id: 1, title: 'High-Value Cheque Bouncing', severity: 'critical' as const, description: '3 cheques > ₹10L returned unpaid in Q3 FY24.', date: '2024-12-15', source: 'Bank Statement Analysis' },
    { id: 2, title: 'BG Invocation', severity: 'warning' as const, description: 'Bank Guarantee of ₹1.2 Cr invoked by Zenith Logistics.', date: '2024-11-20', source: 'Banking Records' },
    { id: 3, title: 'Promoter Stake Dilution', severity: 'warning' as const, description: 'Promoter stake reduced from 68% to 62% via MCA Form-2 filing.', date: '2024-10-05', source: 'MCA Filings' },
    { id: 4, title: 'Circular Trading Pattern', severity: 'critical' as const, description: 'Closed-loop transaction detected: Bharat → Apex → Nova → Bharat (₹2.3-2.8 Cr).', date: '2024-09-18', source: 'GST Network Analysis' },
    { id: 5, title: 'Delayed GST Filing', severity: 'info' as const, description: 'GSTR-3B filed 12 days late for Sep 2024.', date: '2024-10-22', source: 'GST Portal' },
    { id: 6, title: 'Contingent Liabilities Increase', severity: 'warning' as const, description: 'Contingent liabilities up 35% YoY to ₹8.2 Cr.', date: '2024-08-30', source: 'Annual Report FY24' },
];

// ─── Litigation (e-Courts) ───────────────────────────────────────
export const litigationRecords = [
    {
        cnr: 'MHBB01-012345-2023',
        court: 'Bombay High Court',
        caseType: 'Commercial Suit',
        status: 'Pending',
        filingDate: '2023-05-10',
        nextHearing: '2025-04-15',
        petitioner: 'Zenith Logistics Ltd.',
        respondent: 'Bharat Steel Industries Ltd.',
        claimAmount: 4.5,
        summary: 'Dispute over non-payment for logistics services amounting to ₹4.5 Cr.',
    },
    {
        cnr: 'MHBB02-067890-2022',
        court: 'NCLT Mumbai Bench',
        caseType: 'Insolvency Application',
        status: 'Dismissed',
        filingDate: '2022-08-22',
        nextHearing: null,
        petitioner: 'ABC Suppliers Pvt. Ltd.',
        respondent: 'Bharat Steel Industries Ltd.',
        claimAmount: 1.8,
        summary: 'Insolvency petition filed for unpaid invoices. Dismissed as debt was disputed.',
    },
];

// ─── MCA Filings ─────────────────────────────────────────────────
export const mcaFilings = [
    { date: '2024-10-05', form: 'Form-2 (Allotment)', description: 'Allotment of 5,00,000 equity shares. Promoter stake reduced from 68% to 62%.' },
    { date: '2024-07-15', form: 'Form-20A (Business Commencement)', description: 'Declaration of commencement of new Steel Rolling Mill division.' },
    { date: '2024-03-30', form: 'AOC-4 (Annual Financials)', description: 'FY24 Annual Financial Statements filed. PAT: ₹7.8 Cr.' },
    { date: '2023-11-12', form: 'Form-8 (Charge)', description: 'Charge created on Plant & Machinery for ₹22 Cr term loan from SBI.' },
];

// ─── AI Decision ─────────────────────────────────────────────────
export const aiDecision = {
    verdict: 'Approve' as const,
    confidence: 76,
    suggestedLimit: 38.25,  // INR Cr (reduced from 45 requested)
    riskPremium: 2.75,      // % interest margin
    tenorMonths: 60,
    conditions: [
        'Quarterly stock audit by approved auditor',
        'Promoter to maintain minimum 60% stake',
        'No further BG exposure without bank NOC',
        'Submission of monthly GST compliance certificate',
    ],
};

// ─── SHAP Explanations (Why Box) ─────────────────────────────────
export const shapExplanations = [
    { factor: 'Strong GST turnover consistency', impact: +12, direction: 'positive' as const, source: 'GSTR-1 & Bank Statement Analysis', detail: 'Monthly GST filings show consistent revenue over ₹4.5 Cr with only 8.7% bank credit mismatch.' },
    { factor: 'Adequate Collateral Coverage (1.45x)', impact: +18, direction: 'positive' as const, source: 'Collateral Valuation Report', detail: 'Primary security of ₹52 Cr against exposure of ₹38.25 Cr provides comfortable margin.' },
    { factor: 'DSCR above threshold (1.85x vs 1.5x target)', impact: +10, direction: 'positive' as const, source: 'Financial Statement FY24', detail: 'Cash flow generation adequate to service existing + proposed debt.' },
    { factor: 'High litigation risk from e-Courts', impact: -15, direction: 'negative' as const, source: 'e-Courts Portal (CNR: MHBB01-012345-2023)', detail: 'Pending commercial suit of ₹4.5 Cr with Zenith Logistics. Next hearing Apr 2025.' },
    { factor: 'Circular trading pattern detected', impact: -20, direction: 'negative' as const, source: 'GST Network Graph Analysis', detail: 'Closed-loop: Bharat → Apex → Nova → Bharat. Total circular volume: ₹7.6 Cr.' },
    { factor: 'Promoter stake dilution by 6%', impact: -8, direction: 'negative' as const, source: 'MCA Form-2 Filing (Oct 2024)', detail: 'Promoter reduced holding from 68% to 62%. May indicate reduced skin-in-the-game.' },
    { factor: 'Steel sector neutral outlook', impact: -5, direction: 'negative' as const, source: 'RBI Sectoral Report Q3-2024', detail: 'Global oversupply weighing on pricing; domestic infra demand partially offsetting.' },
];

// ─── Pipeline Stages (Data Ingestor) ─────────────────────────────
export const pipelineStages = [
    { id: 1, label: 'Upload', description: 'Files received & queued' },
    { id: 2, label: 'OCR & Extraction', description: 'Text extraction via intelligent OCR' },
    { id: 3, label: 'Validation', description: 'Cross-referencing & anomaly detection' },
    { id: 4, label: 'Analysis', description: 'AI-driven financial analysis' },
    { id: 5, label: 'Complete', description: 'Report generated & ready' },
];

export const sampleDocuments = [
    { name: 'Annual_Report_FY24.pdf', type: 'Annual Report', size: '4.2 MB', status: 'verified' as const, dnaScore: 96, stage: 5, flags: [] as string[] },
    { name: 'GSTR-2A_Oct2024.pdf', type: 'GSTR-2A', size: '1.8 MB', status: 'verified' as const, dnaScore: 92, stage: 5, flags: [] as string[] },
    { name: 'GSTR-3B_Oct2024.pdf', type: 'GSTR-3B', size: '0.9 MB', status: 'warning' as const, dnaScore: 67, stage: 5, flags: ['Flat-image scan detected on page 3', 'Metadata timestamp mismatch'] },
    { name: 'SBI_Statement_H1FY25.pdf', type: 'Bank Statement', size: '2.1 MB', status: 'processing' as const, dnaScore: 0, stage: 3, flags: [] as string[] },
];

// ─── CAM Sections ────────────────────────────────────────────────
export const camSections = {
    executiveSummary: `Bharat Steel Industries Ltd. ("the Company"), incorporated in 2005, is a mid-sized steel manufacturer based in Mumbai, Maharashtra. The Company has requested a credit facility of ₹45 Cr for working capital expansion. After comprehensive AI-driven analysis encompassing financial statements (FY20-FY24), GST filings, bank statements, litigation history, and network transaction patterns, we recommend a sanctioned limit of ₹38.25 Cr with specific conditions.\n\nThe Company demonstrates stable revenue growth (12% CAGR) with adequate debt servicing capacity (DSCR: 1.85x). However, risk factors including circular trading patterns, pending litigation (₹4.5 Cr), and recent promoter stake dilution warrant a reduced limit with enhanced monitoring.`,
    financialRatios: [
        { ratio: 'DSCR', fy22: '1.68', fy23: '1.72', fy24: '1.85', benchmark: '≥1.50', status: 'Pass' },
        { ratio: 'Current Ratio', fy22: '1.30', fy23: '1.35', fy24: '1.38', benchmark: '≥1.33', status: 'Pass' },
        { ratio: 'Debt-Equity', fy22: '1.45', fy23: '1.30', fy24: '1.20', benchmark: '≤2.00', status: 'Pass' },
        { ratio: 'TNW (₹ Cr)', fy22: '33.4', fy23: '36.0', fy24: '38.5', benchmark: '≥25.0', status: 'Pass' },
        { ratio: 'Interest Coverage', fy22: '2.80', fy23: '3.00', fy24: '3.20', benchmark: '≥2.00', status: 'Pass' },
        { ratio: 'PAT Margin (%)', fy22: '5.2', fy23: '5.8', fy24: '6.1', benchmark: '≥4.0%', status: 'Pass' },
    ],
    riskMitigants: [
        'Primary security: First charge on fixed assets (Plant & Machinery) valued at ₹52 Cr.',
        'Personal guarantee of promoter Mr. Rajesh K. Mehta.',
        'Mandatory quarterly stock audit by bank-approved auditor.',
        'ECGC cover for export receivables (20% of total AR).',
        'Escrow mechanism for circular trading counterparties.',
    ],
    sanctionConditions: [
        'Sanctioned limit: ₹38.25 Cr (Working Capital)',
        'Interest Rate: MCLR + 2.75% (Risk Premium)',
        'Tenor: 60 months with annual review',
        'Drawing power linked to stock & receivables (90-day norm)',
        'Promoter to maintain minimum 60% equity stake',
        'Monthly submission of GST compliance certificate',
        'No additional BG exposure without bank NOC',
        'Resolution of pending Zenith Logistics litigation within 12 months',
    ],
};

// ─── Client Relationship Dashboard ───────────────────────────────
export const activeLoans = [
    { type: 'Term Loan 1', amount: 38.25, status: 'Active', nextDue: '05 Jul 2026' },
    { type: 'Working Capital', amount: 45, status: 'Active', nextDue: '15 Jul 2026' },
    { type: 'Equipment Finance', amount: 25.5, status: 'Active', nextDue: '01 Aug 2026' },
];

export const creditHealthTrend = [
    { month: 'Jan', score: 710 },
    { month: 'Feb', score: 710 },
    { month: 'Mar', score: 720 },
    { month: 'Apr', score: 728 },
    { month: 'May', score: 736 },
    { month: 'Jun', score: 730 },
    { month: 'Jul', score: 742 },
];

export const recentDocuments = [
    { name: 'GST Filing Q1 2026', date: '05 Jul 2026' },
    { name: 'Bank Statement May 2026', date: '02 Jun 2026' },
    { name: 'Audited Financials FY24', date: '15 May 2026' },
];

export const pendingTasks = [
    { title: 'Review Q1 2026 GST Filing', dueDate: '05 Jul 2026', priority: 'Negative' as const },
    { title: 'Schedule Annual Review Meeting', dueDate: '15 Jul 2026', priority: 'Negative' as const },
    { title: 'Approve Zenith Logistics Resolution Plan', dueDate: '01 Aug 2026', priority: 'Negative' as const },
];

// ─── Credit Application Pipeline (Kanban) ───────────────────────
export const pipelineColumns = [
    {
        id: 'data-gathering', title: 'DATA GATHERING',
        cards: [
            { company: 'Acme Corp.', amount: 50, status: '60% Complete', statusType: 'progress' as const, badge: 'Missing Documents' },
            { company: 'Delta Enterprises', amount: 25, status: null, statusType: null, badge: 'Missing Documents' },
        ],
    },
    {
        id: 'ai-analysis', title: 'AI ANALYSIS',
        cards: [
            { company: 'Bharat Steel Industries Ltd.', amount: 45, status: 'Medium Risk (AI Score: 68)', statusType: 'warning' as const, badge: null },
            { company: 'Global Traders', amount: 10, status: 'Low Risk (AI Score: 85)', statusType: 'approve' as const, badge: null },
            { company: 'TechSolutions', amount: 50, status: '60% Complete', statusType: 'progress' as const, badge: null },
        ],
    },
    {
        id: 'risk-review', title: 'RISK REVIEW',
        cards: [
            { company: 'TechSolutions', amount: 100, status: 'High Risk (Collateral Gap)', statusType: 'critical' as const, badge: null },
            { company: 'Sunrise Infra', amount: 75, status: 'Pending Risk Officer Review', statusType: 'info' as const, badge: null },
        ],
    },
    {
        id: 'management-approval', title: 'MANAGEMENT APPROVAL',
        cards: [
            { company: 'Apex Manufacturing', amount: 30, status: 'Awaiting Committee Approval', statusType: 'info' as const, badge: null },
            { company: 'City Constructions', amount: 55, status: 'Recommended by Risk Team', statusType: 'approve' as const, badge: null },
            { company: 'Apex Application', amount: 30, status: 'Awaiting Committee Approval', statusType: 'info' as const, badge: null },
        ],
    },
    {
        id: 'final-sanction', title: 'FINAL SANCTION',
        cards: [
            { company: 'GreenEnergy Ltd.', amount: 20, status: 'Sanctioned', statusType: 'approve' as const, badge: null },
            { company: 'Ocean Exports', amount: 8, status: 'Rejected', statusType: 'critical' as const, badge: null },
        ],
    },
];
