"""
Financial Data Extraction & Fraud Detection Pipeline
=====================================================
Uses an LLM (OpenAI GPT-4o via openai SDK) to extract structured financial
metrics from document text, then runs cross-validation logic to flag
potential fraud signals such as circular trading or revenue inflation.

Inputs  : raw_text (list[str]), doc_type (list[str]), doc_id (list[str])
Outputs : financial_metrics (dict), fraud_flags (list)
"""

import json
import re
import os
from typing import Optional

# ── AI design tokens ──────────────────────────────────────────────────────
_BG  = "#1D1D20"
_FG  = "#fbfbff"
_FG2 = "#909094"
_PALETTE = ["#A1C9F4", "#FFB482", "#8DE5A1", "#FF9F9B", "#D0BBFF", "#ffd400", "#f04438"]

# ═══════════════════════════════════════════════════════════════════════════
# 1.  LLM EXTRACTION — structured JSON from document text
# ═══════════════════════════════════════════════════════════════════════════

SYSTEM_PROMPT = """You are a senior financial analyst specialising in credit underwriting and forensic
accounting. Given raw text from a financial document, extract the following metrics and return
ONLY a valid JSON object with exactly these keys (use null if data is unavailable):

{
  "Revenue":       <number in INR crores, or null>,
  "Net_Profit":    <number in INR crores, or null>,
  "EBITDA":        <number in INR crores, or null>,
  "Total_Debt":    <number in INR crores, or null>,
  "Equity":        <number in INR crores, or null>,
  "Cash_Flow":     <number in INR crores, or null>,
  "GST_Revenue":   <number in INR crores declared for GST, or null>,
  "Bank_Deposits": <total bank deposit / inflows in INR crores, or null>,
  "EBITDA_Margin": <percentage as a decimal, e.g. 0.243, or null>,
  "Leverage":      <Net Debt / EBITDA ratio, or null>,
  "DSCR":          <Debt Service Coverage Ratio, or null>
}

Return only the raw JSON — no markdown fences, no explanations."""

EXTRACTION_PROMPT = """Extract structured financial metrics from the following document text.

DOCUMENT TYPE : {doc_type}
DOCUMENT ID   : {doc_id}

--- BEGIN TEXT ---
{text}
--- END TEXT ---"""


def _extract_with_openai(text: str, doc_type_val: str, doc_id_val: str) -> dict:
    """Call OpenAI GPT-4o to extract metrics; returns parsed dict."""
    from openai import OpenAI

    # User must set OPENAI_API_KEY in environment or canvas secrets
    api_key = os.environ.get("OPENAI_API_KEY", "your-openai-api-key-here")
    client  = OpenAI(api_key=api_key)

    user_msg = EXTRACTION_PROMPT.format(
        doc_type=doc_type_val,
        doc_id=doc_id_val,
        text=text[:6000],          # stay well within context window
    )

    response = client.chat.completions.create(
        model="gpt-4o",
        temperature=0,
        max_tokens=512,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": user_msg},
        ],
    )
    raw_json = response.choices[0].message.content.strip()
    # Strip markdown fences if model adds them despite instructions
    raw_json = re.sub(r"^```[a-z]*\n?", "", raw_json).rstrip("```").strip()
    return json.loads(raw_json)


def _extract_with_regex(text: str) -> dict:
    """
    Rule-based fallback extractor — scans for Indian rupee figures (₹X crores).
    Returns a best-effort dict with the same keys as the LLM schema.
    """
    def _find(patterns):
        for p in patterns:
            m = re.search(p, text, re.IGNORECASE)
            if m:
                val_str = m.group(1).replace(",", "")
                return float(val_str)
        return None

    return {
        "Revenue":       _find([r"revenue[^\d]*?(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)\s*crore"]),
        "Net_Profit":    _find([r"net profit[^\d]*?(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)\s*crore",
                                r"profit after tax[^\d]*?(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)\s*crore"]),
        "EBITDA":        _find([r"ebitda[^\d]*?(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)\s*crore"]),
        "Total_Debt":    _find([r"total borrowings?[^\d]*?(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)\s*crore",
                                r"total debt[^\d]*?(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)\s*crore"]),
        "Equity":        _find([r"shareholders?['\s]*equity[^\d]*?(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)\s*crore"]),
        "Cash_Flow":     _find([r"cash flow from operations?[^\d]*?(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)\s*crore"]),
        "GST_Revenue":   None,          # not directly present in sample docs
        "Bank_Deposits": None,
        "EBITDA_Margin": _find([r"ebitda margin[^\d]*?([\d.]+)%"]),
        "Leverage":      _find([r"net debt\s*/\s*ebitda[^\d]*?([\d.]+)x?"]),
        "DSCR":          _find([r"dscr[^\d]*?([\d.]+)x?"]),
    }


# ═══════════════════════════════════════════════════════════════════════════
# 2.  FRAUD SIGNAL DETECTION — cross-validation rules
# ═══════════════════════════════════════════════════════════════════════════

FRAUD_RULES = [
    # ── GST vs Bank Deposit consistency ────────────────────────────────────
    {
        "id":   "CIRCULAR_TRADING_GST_BANK",
        "name": "Circular Trading / Revenue Inflation (GST vs Bank Deposits)",
        "desc": "Bank deposits significantly exceed GST-declared revenue — "
                "possible circular trading or unreported income.",
        "check": lambda m: (
            m.get("GST_Revenue") is not None
            and m.get("Bank_Deposits") is not None
            and m["Bank_Deposits"] > m["GST_Revenue"] * 1.30    # >30% excess
        ),
    },
    # ── Revenue vs Net Profit margin (implausible margins) ─────────────────
    {
        "id":   "IMPLAUSIBLE_PROFIT_MARGIN",
        "name": "Implausible Net Profit Margin",
        "desc": "Net profit margin exceeds 50% — unusual for most industries; "
                "may indicate inflated revenue or understated costs.",
        "check": lambda m: (
            m.get("Revenue") and m.get("Net_Profit")
            and m["Net_Profit"] / m["Revenue"] > 0.50
        ),
    },
    # ── EBITDA Margin sanity check ──────────────────────────────────────────
    {
        "id":   "EBITDA_MARGIN_ANOMALY",
        "name": "EBITDA Margin Anomaly",
        "desc": "EBITDA margin is unusually high (>60%) or negative — "
                "potential accounting manipulation.",
        "check": lambda m: (
            m.get("EBITDA_Margin") is not None
            and (m["EBITDA_Margin"] > 0.60 or m["EBITDA_Margin"] < 0)
        ),
    },
    # ── Leverage risk ───────────────────────────────────────────────────────
    {
        "id":   "HIGH_LEVERAGE",
        "name": "High Leverage Risk",
        "desc": "Net Debt/EBITDA > 5x — company may be over-leveraged, "
                "raising solvency concerns.",
        "check": lambda m: (
            m.get("Leverage") is not None and m["Leverage"] > 5.0
        ),
    },
    # ── DSCR stress ─────────────────────────────────────────────────────────
    {
        "id":   "LOW_DSCR",
        "name": "Debt Service Coverage Ratio Below Threshold",
        "desc": "DSCR < 1.25 — insufficient operating cash to service debt; "
                "elevated default risk.",
        "check": lambda m: (
            m.get("DSCR") is not None and m["DSCR"] < 1.25
        ),
    },
    # ── Revenue vs Cash Flow divergence ────────────────────────────────────
    {
        "id":   "REVENUE_CASHFLOW_DIVERGENCE",
        "name": "Revenue–Cash Flow Divergence",
        "desc": "Operating cash flow is less than 10% of revenue — "
                "possible accrual manipulation or fictitious revenues.",
        "check": lambda m: (
            m.get("Revenue") and m.get("Cash_Flow")
            and m["Cash_Flow"] > 0
            and m["Cash_Flow"] / m["Revenue"] < 0.10
        ),
    },
    # ── Negative equity ─────────────────────────────────────────────────────
    {
        "id":   "NEGATIVE_EQUITY",
        "name": "Negative / Zero Equity",
        "desc": "Shareholders' equity is zero or negative — technically insolvent.",
        "check": lambda m: (
            m.get("Equity") is not None and m["Equity"] <= 0
        ),
    },
]


def run_fraud_detection(metrics: dict) -> list[dict]:
    """Apply all fraud rules to a metrics dict; return list of triggered flags."""
    flags = []
    for rule in FRAUD_RULES:
        triggered = False
        try:
            triggered = rule["check"](metrics)
        except Exception:
            pass          # division by zero etc. → skip rule silently
        if triggered:
            flags.append({
                "flag_id":     rule["id"],
                "flag_name":   rule["name"],
                "description": rule["desc"],
                "severity":    "HIGH" if "CIRCULAR" in rule["id"] or "NEGATIVE" in rule["id"]
                               else "MEDIUM",
            })
    return flags


# ═══════════════════════════════════════════════════════════════════════════
# 3.  MAIN PIPELINE — iterate over classified documents
# ═══════════════════════════════════════════════════════════════════════════

# Determine extraction strategy: try OpenAI, fall back to regex
_use_llm = bool(os.environ.get("OPENAI_API_KEY"))

print("=" * 68)
print("  FINANCIAL EXTRACTION & FRAUD DETECTION PIPELINE")
print("=" * 68)
print(f"  Extraction mode : {'LLM (OpenAI GPT-4o)' if _use_llm else 'Rule-based regex fallback'}")
print(f"  Documents       : {len(raw_text)}\n")

# Output accumulators
financial_metrics: dict = {}   # { doc_id: {metric_key: value, ...} }
fraud_flags:       list = []   # [ {doc_id, flag_id, flag_name, severity, ...} ]

for _idx, (_text_content, _dtype, _did) in enumerate(zip(raw_text, doc_type, doc_id)):

    print(f"{'─'*68}")
    print(f"  [{_idx+1}/{len(raw_text)}]  {_did}  ({_dtype})")

    # ── Extract metrics ──────────────────────────────────────────────────
    if _use_llm:
        _metrics = _extract_with_openai(_text_content, _dtype, _did)
        _method  = "LLM"
    else:
        _metrics = _extract_with_regex(_text_content)
        _method  = "regex"

    financial_metrics[_did] = _metrics

    # ── Print extracted metrics ──────────────────────────────────────────
    _present = {k: v for k, v in _metrics.items() if v is not None}
    if _present:
        for _k, _v in _present.items():
            _vstr = f"{_v:.2f}" if isinstance(_v, float) else str(_v)
            print(f"    ✅  {_k:<20s}: {_vstr}")
    else:
        print("    ⚠️   No numeric metrics extracted from this document.")

    # ── Fraud detection ──────────────────────────────────────────────────
    _doc_flags = run_fraud_detection(_metrics)
    for _fl in _doc_flags:
        fraud_flags.append({
            "doc_id":      _did,
            "doc_type":    _dtype,
            **_fl,
        })
        _sev_icon = "🔴" if _fl["severity"] == "HIGH" else "🟡"
        print(f"    {_sev_icon}  FLAG [{_fl['severity']}] {_fl['flag_name']}")

    if not _doc_flags:
        print("    🟢  No fraud signals detected for this document.")

# ═══════════════════════════════════════════════════════════════════════════
# 4.  SUMMARY REPORT
# ═══════════════════════════════════════════════════════════════════════════

print(f"\n{'='*68}")
print("  EXTRACTION SUMMARY")
print(f"{'='*68}")
_total_metrics = sum(
    sum(1 for v in m.values() if v is not None)
    for m in financial_metrics.values()
)
print(f"  Documents processed   : {len(financial_metrics)}")
print(f"  Total metrics found   : {_total_metrics}")
print(f"  Fraud flags raised    : {len(fraud_flags)}")

if fraud_flags:
    print(f"\n{'─'*68}")
    print("  ⚠️   FRAUD FLAGS SUMMARY")
    print(f"{'─'*68}")
    for _fl in fraud_flags:
        _icon = "🔴" if _fl["severity"] == "HIGH" else "🟡"
        print(f"  {_icon} [{_fl['severity']:6s}] {_fl['doc_id']} → {_fl['flag_name']}")
        print(f"         {_fl['description']}")
else:
    print("\n  🟢  No fraud signals detected across all documents.")

print(f"\n✅  Output variables ready:")
print(f"    financial_metrics — dict ({len(financial_metrics)} documents)")
print(f"    fraud_flags       — list ({len(fraud_flags)} flags)")

# ═══════════════════════════════════════════════════════════════════════════
# 5.  VISUALISATION — Extracted metrics dashboard
# ═══════════════════════════════════════════════════════════════════════════

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

plt.rcParams.update({"font.family": "DejaVu Sans"})

# ── Chart 1: Key financial metrics comparison across documents ───────────────
_metric_keys   = ["Revenue", "Net_Profit", "EBITDA", "Total_Debt", "Equity", "Cash_Flow"]
_metric_labels = ["Revenue", "Net Profit", "EBITDA", "Total Debt", "Equity", "Cash Flow"]
_doc_ids_short = [_d[:18] for _d in list(financial_metrics.keys())]

_metric_matrix = np.zeros((len(_metric_keys), len(financial_metrics)))
for _ci, _did in enumerate(financial_metrics):
    for _ri, _mk in enumerate(_metric_keys):
        _v = financial_metrics[_did].get(_mk)
        _metric_matrix[_ri, _ci] = _v if _v is not None else 0

fig_metrics, ax_m = plt.subplots(figsize=(14, 6))
fig_metrics.patch.set_facecolor(_BG)
ax_m.set_facecolor(_BG)

_n_docs   = len(financial_metrics)
_n_met    = len(_metric_keys)
_x        = np.arange(_n_docs)
_bar_w    = 0.12
_offsets  = np.linspace(-(_n_met - 1) / 2 * _bar_w, (_n_met - 1) / 2 * _bar_w, _n_met)

for _ri in range(_n_met):
    _vals = _metric_matrix[_ri]
    if _vals.max() == 0:
        continue
    ax_m.bar(
        _x + _offsets[_ri], _vals,
        width=_bar_w, color=_PALETTE[_ri % len(_PALETTE)],
        label=_metric_labels[_ri], edgecolor="none", alpha=0.88
    )

ax_m.set_xticks(_x)
ax_m.set_xticklabels(_doc_ids_short, color=_FG, fontsize=8.5, rotation=15, ha="right")
ax_m.tick_params(axis="y", colors=_FG2)
ax_m.set_ylabel("₹ Crores", color=_FG2, fontsize=11)
ax_m.set_title(
    "Extracted Financial Metrics — Document Comparison",
    color=_FG, fontsize=14, fontweight="bold", pad=14
)
ax_m.spines[["top", "right", "left"]].set_visible(False)
ax_m.spines["bottom"].set_color(_FG2)
ax_m.legend(
    loc="upper right", frameon=True, facecolor="#2a2a2e",
    edgecolor="#444", labelcolor=_FG, fontsize=8.5
)
plt.tight_layout(pad=1.5)
plt.show()

# ── Chart 2: Fraud flags severity breakdown ──────────────────────────────────
_flag_counts = {"HIGH": 0, "MEDIUM": 0, "LOW": 0}
for _fl in fraud_flags:
    _flag_counts[_fl.get("severity", "LOW")] += 1

fig_fraud, ax_f = plt.subplots(figsize=(8, 5))
fig_fraud.patch.set_facecolor(_BG)
ax_f.set_facecolor(_BG)

_sev_labels = [s for s, c in _flag_counts.items() if c > 0] or ["No Flags"]
_sev_vals   = [c for c in _flag_counts.values() if c > 0]   or [1]
_sev_colors = {"HIGH": "#f04438", "MEDIUM": "#ffd400", "LOW": "#8DE5A1", "No Flags": "#A1C9F4"}
_sev_bar_colors = [_sev_colors.get(s, "#A1C9F4") for s in _sev_labels]

_bx = np.arange(len(_sev_labels))
_bars_f = ax_f.bar(_bx, _sev_vals, color=_sev_bar_colors, edgecolor="none", width=0.45)

for _b, _c in zip(_bars_f, _sev_vals):
    ax_f.text(
        _b.get_x() + _b.get_width() / 2, _b.get_height() + 0.05,
        str(_c), ha="center", va="bottom", color=_FG, fontsize=13, fontweight="bold"
    )

ax_f.set_xticks(_bx)
ax_f.set_xticklabels(_sev_labels, color=_FG, fontsize=12)
ax_f.tick_params(axis="y", colors=_FG2)
ax_f.set_ylabel("Number of Flags", color=_FG2, fontsize=11)
ax_f.set_title(
    "Fraud Signal Detection — Flag Severity Summary",
    color=_FG, fontsize=14, fontweight="bold", pad=14
)
ax_f.spines[["top", "right", "left"]].set_visible(False)
ax_f.spines["bottom"].set_color(_FG2)
ax_f.set_ylim(0, max(_sev_vals) + 1.5)
plt.tight_layout(pad=1.5)
plt.show()
