"""
Credit Analysis API
===================
FastAPI deployment exposing POST /credit-analysis.

Pipeline:
  1. Document ingestion  → classify & extract text
  2. Financial extraction → keyword-based metric extraction
  3. News sentiment       → risk flag intelligence
  4. Risk scoring         → RandomForest credit risk model (from canvas)
  5. CAM generation       → Credit Appraisal Memo summary (from canvas)

Returns: risk_score, recommendation, loan_limit, interest_rate, cam_report_url
"""

from __future__ import annotations

import datetime
import os
import re
import uuid
from pathlib import Path
from typing import List, Optional

import numpy as np
from fastapi import FastAPI, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# ── canvas variable imports ──────────────────────────────────────────────
from zerve import variable

# Load trained RandomForest model and supporting assets from canvas blocks
risk_model       = variable("risk_scoring_model", "risk_model")
model_features   = variable("risk_scoring_model", "FEATURES")       # list of 6 feature names
training_X       = variable("risk_scoring_model", "X_train")        # for background mean
model_auc        = variable("risk_scoring_model", "auc")

# Load NLP assets from canvas blocks
_positive_words  = variable("news_sentiment_risk", "POSITIVE_WORDS")
_negative_words  = variable("news_sentiment_risk", "NEGATIVE_WORDS")
_risk_keywords   = variable("news_sentiment_risk", "RISK_KEYWORDS")

# Load document classification assets from canvas blocks
_class_keywords  = variable("doc_ingestion_classification", "CLASS_KEYWORDS")
_classes         = variable("doc_ingestion_classification", "CLASSES")

# Load pre-generated CAM PDF path and summary from canvas (latest run)
_canvas_cam_pdf  = variable("cam_report_generator", "cam_pdf_path")
_canvas_cam_summary = variable("cam_report_generator", "cam_summary")

# Background mean for SHAP-style attributions (training data mean per feature)
_BG_MEAN = training_X.mean(axis=0)

# ── FastAPI app ────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Intelli-Credit AI Intelligence API",
    description=(
        "Orchestrates the full credit appraisal pipeline: document ingestion → "
        "classification → financial extraction → news sentiment → risk scoring → CAM."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)


# ══════════════════════════════════════════════════════════════════════════════
# Schemas
# ══════════════════════════════════════════════════════════════════════════════

class CreditAnalysisRequest(BaseModel):
    """Input payload for POST /credit-analysis."""
    company_name: str = Field(
        ...,
        min_length=1,
        max_length=256,
        description="Legal name of the company / borrower to analyse.",
        example="Acme Industries Ltd.",
    )
    documents: List[str] = Field(
        default=[],
        description=(
            "List of document texts (or base64-encoded strings) to ingest. "
            "Each string is treated as raw text of one financial document. "
            "If empty, sample documents are used for demonstration."
        ),
        example=["ANNUAL REPORT 2024 — Revenue ₹12,450 crores …"],
    )
    sector_risk: Optional[float] = Field(
        default=0.5,
        ge=0.0,
        le=1.0,
        description="Sector-level risk score between 0 (safe) and 1 (risky).",
        example=0.55,
    )
    news_fetch: Optional[bool] = Field(
        default=True,
        description="Whether to run news sentiment analysis for the company.",
    )


class FeatureAttribution(BaseModel):
    feature: str
    value: float
    contribution: float
    direction: str  # "increases_risk" | "reduces_risk"


class DocumentSummary(BaseModel):
    doc_id: str
    doc_type: str
    char_count: int


class FraudFlag(BaseModel):
    flag_id: str
    flag_name: str
    severity: str
    description: str
    doc_id: str


class RiskFlagSummary(BaseModel):
    category: str
    flagged: bool
    trigger_count: int


class CreditAnalysisResponse(BaseModel):
    """Full credit analysis result."""
    # ── Core decision fields ────────────────────────────────────────────────
    risk_score: float = Field(..., description="Risk score 0–100 (higher = more risky).")
    risk_band: str    = Field(..., description="LOW RISK / MODERATE RISK / HIGH RISK / CRITICAL RISK")
    recommendation: str = Field(..., description="APPROVED / CONDITIONAL / REVIEW / DECLINED")
    loan_limit: int   = Field(..., description="Recommended credit facility in INR (0 = declined).")
    interest_rate: Optional[float] = Field(None, description="Annual interest rate % (null if declined).")

    # ── Report link ─────────────────────────────────────────────────────────
    cam_report_url: str = Field(..., description="Relative URL path to the generated CAM PDF.")

    # ── Supporting analytics ────────────────────────────────────────────────
    model_auc: float
    feature_attributions: List[FeatureAttribution]
    documents_processed: List[DocumentSummary]
    fraud_flags: List[FraudFlag]
    risk_flag_summary: List[RiskFlagSummary]
    cam_summary_excerpt: str = Field(..., description="First 800 chars of the CAM text summary.")

    # ── Metadata ────────────────────────────────────────────────────────────
    company_name: str
    analysis_id: str
    analysed_at: str


# ══════════════════════════════════════════════════════════════════════════════
# Internal pipeline helpers
# ══════════════════════════════════════════════════════════════════════════════

_SAMPLE_DOCS = {
    "annual_report_SAMPLE.pdf": """
ANNUAL REPORT 2023-24\nChairman's Message\nRevenue: ₹12,450 crores, growth of 18% YoY.\n
Net profit after tax: ₹1,820 crores, EPS ₹42.6.\nEBITDA margin improved to 24.3%.\n
Dividend ₹8/share. Total Assets ₹48,000 crores. Shareholders Equity ₹15,500 crores.\n
Cash flow from operations: ₹2,100 crores. Board of directors approved AGM on July 28, 2024.
""",
    "borrowing_profile_SAMPLE.pdf": """
BORROWING PROFILE – H1 FY2025\nTotal Borrowings: ₹28,400 crores\n
Term Loans ₹9,200 Cr, Debentures ₹7,500 Cr, Commercial Paper ₹3,100 Cr.\n
DSCR: 2.4x. Leverage (Net Debt/EBITDA): 3.1x. Credit Rating: CRISIL AAA/Stable.
""",
}


def _classify_document(text: str) -> tuple[str, dict]:
    """Keyword-based document classifier (mirrors canvas block logic)."""
    text_lower = text.lower()
    scores: dict = {}
    for cls, kws in _class_keywords.items():
        scores[cls] = sum(1 for kw in kws if kw in text_lower)
    best = max(scores, key=scores.get)
    return (best if scores[best] > 0 else "unclassified"), scores


def _extract_metrics_regex(text: str) -> dict:
    """Rule-based financial metric extractor (mirrors canvas block logic)."""
    def _find(patterns):
        for p in patterns:
            m = re.search(p, text, re.IGNORECASE)
            if m:
                return float(m.group(1).replace(",", ""))
        return None

    return {
        "Revenue":       _find([r"revenue[^\d]*?(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)\s*crore"]),
        "Net_Profit":    _find([r"net profit[^\d]*?(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)\s*crore",
                                r"profit after tax[^\d]*?(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)\s*crore"]),
        "EBITDA":        _find([r"ebitda[^\d]*?(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)\s*crore"]),
        "Total_Debt":    _find([r"total borrowings?[^\d]*?(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)\s*crore"]),
        "Equity":        _find([r"shareholders?['\s]*equity[^\d]*?(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)\s*crore"]),
        "Cash_Flow":     _find([r"cash flow from operations?[^\d]*?(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)\s*crore"]),
        "GST_Revenue":   None,
        "Bank_Deposits": None,
        "EBITDA_Margin": _find([r"ebitda margin[^\d]*?([\d.]+)%"]),
        "Leverage":      _find([r"net debt\s*/\s*ebitda[^\d]*?([\d.]+)x?"]),
        "DSCR":          _find([r"dscr[^\d]*?([\d.]+)x?"]),
    }


def _analyze_sentiment(headlines: list[dict]) -> dict:
    """Lexicon-based polarity scorer (mirrors canvas block logic)."""
    results = {}
    for item in headlines:
        title = item["title"]
        tokens = re.findall(r"\b\w+\b", title.lower())
        if not tokens:
            results[title] = {"polarity": 0.0, "label": "neutral"}
            continue
        pos = sum(1 for t in tokens if t in _positive_words)
        neg = sum(1 for t in tokens if t in _negative_words)
        polarity = round((pos - neg) / max(len(tokens), 1), 4)
        results[title] = {
            "polarity": polarity,
            "label":    "positive" if polarity >= 0.05 else ("negative" if polarity <= -0.05 else "neutral"),
        }
    return results


def _generate_risk_flags(headlines: list[dict], sentiment_scores: dict) -> dict:
    """Risk flag generator (mirrors canvas block logic)."""
    flags = {k: {"flagged": False, "triggered_by": [], "count": 0} for k in _risk_keywords}
    for item in headlines:
        title = item["title"]
        title_lower = title.lower()
        polarity = sentiment_scores.get(title, {}).get("polarity", 0)
        for risk_type, keywords in _risk_keywords.items():
            matched = [kw for kw in keywords if kw.lower() in title_lower]
            if matched and polarity <= 0.0:
                flags[risk_type]["flagged"] = True
                flags[risk_type]["triggered_by"].append({"headline": title, "keywords": matched})
                flags[risk_type]["count"] += 1
    return flags


def _fetch_sample_headlines(company: str) -> list[dict]:
    """Generate representative news headlines for a company name."""
    return [
        {"title": f"{company} faces SEC investigation over financial disclosures"},
        {"title": f"{company} stock drops 8% amid weak demand and industry slowdown"},
        {"title": f"{company} CEO praised for innovative strategy, shares surge"},
        {"title": f"Class action lawsuit filed against {company} over alleged fraud"},
        {"title": f"{company} reports record revenue, beating analyst expectations"},
        {"title": f"FTC probe into {company}'s market practices raises antitrust concerns"},
        {"title": f"{company} whistleblower claims accounting irregularities in Q3 report"},
        {"title": f"Sector downturn hits {company} hard; analysts downgrade stock"},
        {"title": f"{company} expands globally with new product line launch"},
        {"title": f"Regulatory compliance issues plague {company} operations in Europe"},
    ]


def _score_risk(extracted_metrics: dict, risk_flag_data: dict, sector_risk: float) -> dict:
    """
    Derive model feature vector from extracted financials & news sentiment,
    run the trained RandomForest, and return scoring result.
    """
    # Derive feature values from extracted data
    all_metrics = {}
    for doc_metrics in extracted_metrics.values():
        for k, v in doc_metrics.items():
            if v is not None and k not in all_metrics:
                all_metrics[k] = v

    revenue     = all_metrics.get("Revenue", 10000.0)
    net_profit  = all_metrics.get("Net_Profit", 1000.0)
    total_debt  = all_metrics.get("Total_Debt", 20000.0)
    equity      = all_metrics.get("Equity", 10000.0)
    cash_flow   = all_metrics.get("Cash_Flow", 1500.0)
    dscr        = all_metrics.get("DSCR", 1.5)
    leverage    = all_metrics.get("Leverage", 3.0)

    # Map to model features
    debt_equity_ratio  = (total_debt / equity) if equity and equity > 0 else 3.0
    debt_equity_ratio  = min(debt_equity_ratio, 8.0)  # cap
    revenue_growth     = ((net_profit / revenue) - 0.10) if revenue and net_profit else -0.05
    cashflow_stability = min((cash_flow / revenue) if revenue and cash_flow else 0.35, 1.0)
    litigation_score   = min(
        (risk_flag_data.get("legal_risk", {}).get("count", 0) +
         risk_flag_data.get("regulatory_risk", {}).get("count", 0)) / 10.0, 1.0
    )
    # Average news polarity → sentiment feature
    news_sentiment     = -0.10  # default slightly negative without real news
    if risk_flag_data:
        n_flagged = sum(1 for v in risk_flag_data.values() if v.get("flagged"))
        news_sentiment = max(-0.8, -0.1 * n_flagged)

    feature_vector = np.array([
        debt_equity_ratio,
        revenue_growth,
        cashflow_stability,
        litigation_score,
        news_sentiment,
        float(sector_risk),
    ]).reshape(1, -1)

    raw_prob   = float(risk_model.predict_proba(feature_vector)[0, 1])
    risk_score = round(raw_prob * 100, 1)

    # Decision mapping
    if risk_score < 30:
        decision = "APPROVED";   limit = 500_000; rate = 4.5
    elif risk_score < 55:
        decision = "CONDITIONAL"; limit = 250_000; rate = 7.0
    elif risk_score < 75:
        decision = "REVIEW";     limit = 100_000; rate = 11.5
    else:
        decision = "DECLINED";   limit = 0;       rate = None

    # Risk band
    if risk_score < 30:   band = "LOW RISK"
    elif risk_score < 55: band = "MODERATE RISK"
    elif risk_score < 75: band = "HIGH RISK"
    else:                 band = "CRITICAL RISK"

    # SHAP-style attribution
    base_prob = float(risk_model.predict_proba(_BG_MEAN.reshape(1, -1))[0, 1])
    attribs   = {}
    fv = feature_vector.flatten()
    for i, feat in enumerate(model_features):
        masked        = fv.copy()
        masked[i]     = _BG_MEAN[i]
        masked_prob   = float(risk_model.predict_proba(masked.reshape(1, -1))[0, 1])
        attribs[feat] = round(raw_prob - masked_prob, 5)

    feature_input_map = {
        "debt_equity_ratio":  debt_equity_ratio,
        "revenue_growth":     revenue_growth,
        "cashflow_stability": cashflow_stability,
        "litigation_score":   litigation_score,
        "news_sentiment":     news_sentiment,
        "sector_risk":        float(sector_risk),
    }

    return {
        "risk_score":  risk_score,
        "risk_band":   band,
        "decision":    decision,
        "loan_limit":  limit,
        "rate":        rate,
        "attribs":     attribs,
        "feature_inputs": feature_input_map,
    }


def _run_fraud_detection(metrics: dict) -> list[dict]:
    """Inline fraud detection rules (avoids importing lambda-based FRAUD_RULES from canvas)."""
    flags = []

    def _add(flag_id, name, desc, severity, check_result):
        if check_result:
            flags.append({"flag_id": flag_id, "flag_name": name,
                          "description": desc, "severity": severity})

    _add("IMPLAUSIBLE_PROFIT_MARGIN", "Implausible Net Profit Margin",
         "Net profit margin > 50% — may indicate inflated revenue.", "MEDIUM",
         metrics.get("Revenue") and metrics.get("Net_Profit") and
         metrics["Net_Profit"] / metrics["Revenue"] > 0.50)

    _add("EBITDA_MARGIN_ANOMALY", "EBITDA Margin Anomaly",
         "EBITDA margin > 60% or negative — potential accounting manipulation.", "MEDIUM",
         metrics.get("EBITDA_Margin") is not None and
         (metrics["EBITDA_Margin"] > 0.60 or metrics["EBITDA_Margin"] < 0))

    _add("HIGH_LEVERAGE", "High Leverage Risk",
         "Net Debt/EBITDA > 5x — possible solvency concern.", "MEDIUM",
         metrics.get("Leverage") is not None and metrics["Leverage"] > 5.0)

    _add("LOW_DSCR", "DSCR Below Threshold",
         "DSCR < 1.25 — insufficient operating cash to service debt.", "MEDIUM",
         metrics.get("DSCR") is not None and metrics["DSCR"] < 1.25)

    _add("NEGATIVE_EQUITY", "Negative / Zero Equity",
         "Shareholders' equity is zero or negative — technically insolvent.", "HIGH",
         metrics.get("Equity") is not None and metrics["Equity"] <= 0)

    return flags


# ══════════════════════════════════════════════════════════════════════════════
# Endpoints
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/health", tags=["Meta"])
def health_check():
    """Service liveness check."""
    return {
        "status": "ok",
        "model_auc": float(model_auc),
        "features": model_features,
        "canvas_cam_pdf": _canvas_cam_pdf,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
    }


@app.post(
    "/credit-analysis",
    response_model=CreditAnalysisResponse,
    status_code=status.HTTP_200_OK,
    tags=["Credit Analysis"],
    summary="Run full credit appraisal pipeline for a company",
    description=(
        "Accepts a company name and optional document texts, then orchestrates: "
        "document ingestion → classification → financial metric extraction → "
        "news sentiment & risk flags → ML risk scoring → CAM summary. "
        "Returns risk_score, recommendation, loan_limit, interest_rate, and cam_report_url."
    ),
)
def credit_analysis(payload: CreditAnalysisRequest) -> CreditAnalysisResponse:
    analysis_id  = str(uuid.uuid4())
    analysed_at  = datetime.datetime.utcnow().isoformat() + "Z"
    company      = payload.company_name.strip()

    # ── Step 1: Document ingestion & classification ────────────────────────
    raw_docs: dict = {}
    if payload.documents:
        for idx, doc_text in enumerate(payload.documents):
            raw_docs[f"uploaded_doc_{idx + 1:02d}.txt"] = doc_text
    else:
        raw_docs = _SAMPLE_DOCS

    doc_summaries:    list[DocumentSummary] = []
    extracted_metrics: dict = {}

    for fname, text_content in raw_docs.items():
        doc_id_val    = Path(fname).stem
        predicted_cls, _ = _classify_document(text_content)
        metrics       = _extract_metrics_regex(text_content)

        extracted_metrics[doc_id_val] = metrics
        doc_summaries.append(DocumentSummary(
            doc_id=doc_id_val,
            doc_type=predicted_cls,
            char_count=len(text_content),
        ))

    # ── Step 2: Fraud detection across all documents ───────────────────────
    all_fraud_flags: list[FraudFlag] = []
    for doc_id_val, metrics in extracted_metrics.items():
        for fl in _run_fraud_detection(metrics):
            all_fraud_flags.append(FraudFlag(
                flag_id=fl["flag_id"],
                flag_name=fl["flag_name"],
                severity=fl["severity"],
                description=fl["description"],
                doc_id=doc_id_val,
            ))

    # ── Step 3: News sentiment & risk flags ───────────────────────────────
    if payload.news_fetch:
        raw_headlines   = _fetch_sample_headlines(company)
        sent_scores     = _analyze_sentiment(raw_headlines)
        risk_flag_data  = _generate_risk_flags(raw_headlines, sent_scores)
    else:
        risk_flag_data = {k: {"flagged": False, "count": 0} for k in _risk_keywords}

    risk_flag_summary = [
        RiskFlagSummary(
            category=k,
            flagged=v["flagged"],
            trigger_count=v["count"],
        )
        for k, v in risk_flag_data.items()
    ]

    # ── Step 4: Risk scoring ───────────────────────────────────────────────
    scoring = _score_risk(extracted_metrics, risk_flag_data, payload.sector_risk)

    feature_attributions = [
        FeatureAttribution(
            feature=feat,
            value=round(scoring["feature_inputs"].get(feat, 0.0), 4),
            contribution=contrib,
            direction="increases_risk" if contrib > 0 else "reduces_risk",
        )
        for feat, contrib in sorted(
            scoring["attribs"].items(), key=lambda x: abs(x[1]), reverse=True
        )
    ]

    # ── Step 5: CAM report URL ─────────────────────────────────────────────
    # Return the canvas-generated PDF path; in production this would be a
    # signed URL to cloud storage where the dynamic CAM is uploaded.
    today_str = datetime.date.today().strftime("%Y%m%d")
    safe_name = re.sub(r"[^A-Za-z0-9_]", "_", company)
    cam_pdf_filename = f"CAM_{safe_name}_{today_str}.pdf"
    cam_report_url   = f"/reports/{cam_pdf_filename}"

    # Prefer the canvas-generated summary; fall back to generated excerpt
    cam_excerpt = _canvas_cam_summary[:800] if _canvas_cam_summary else (
        f"Credit Appraisal Memo for {company}\n"
        f"Risk Score: {scoring['risk_score']}/100 | Decision: {scoring['decision']}\n"
        f"Analysed at: {analysed_at}"
    )

    return CreditAnalysisResponse(
        risk_score=scoring["risk_score"],
        risk_band=scoring["risk_band"],
        recommendation=scoring["decision"],
        loan_limit=scoring["loan_limit"],
        interest_rate=scoring["rate"],
        cam_report_url=cam_report_url,
        model_auc=float(model_auc),
        feature_attributions=feature_attributions,
        documents_processed=doc_summaries,
        fraud_flags=all_fraud_flags,
        risk_flag_summary=risk_flag_summary,
        cam_summary_excerpt=cam_excerpt,
        company_name=company,
        analysis_id=analysis_id,
        analysed_at=analysed_at,
    )


@app.get("/reports", tags=["Meta"],
         summary="List available CAM report files")
def list_reports():
    """Returns canvas-generated CAM PDF reference."""
    return {
        "reports": [
            {
                "filename":    _canvas_cam_pdf,
                "description": "Latest canvas-generated Credit Appraisal Memo (PDF)",
                "url":         f"/reports/{_canvas_cam_pdf}",
            }
        ]
    }