"""
Credit Appraisal Memo (CAM) — PDF Generator
============================================
Composes a full CAM using the Five Cs of Credit, incorporating:
  - financial_metrics  (from financial_extraction_fraud_detection)
  - risk_flags         (from news_sentiment_risk)
  - risk_score         (from risk_scoring_model)
  - loan_approval      (from risk_scoring_model)

Generates the memo as a 3-page PDF using matplotlib's PdfPages
and also returns cam_summary string.
"""

import datetime
import matplotlib
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
import numpy as np

matplotlib.rcParams["font.family"] = "DejaVu Sans"

# ── Design Tokens ─────────────────────────────────────────────────────────────
_BG     = "#1D1D20"
_FG     = "#fbfbff"
_FG2    = "#909094"
_BLUE   = "#A1C9F4"
_ORANGE = "#FFB482"
_GREEN  = "#8DE5A1"
_RED    = "#f04438"
_YELLOW = "#ffd400"

# ── Meta ──────────────────────────────────────────────────────────────────────
_TODAY        = datetime.date.today().strftime("%d %B %Y")
_COMPANY_NAME = SAMPLE_COMPANY
_REF_NO       = f"CAM-{datetime.date.today().strftime('%Y%m%d')}-001"
_PDF_PATH     = f"CAM_{_COMPANY_NAME}_{datetime.date.today().strftime('%Y%m%d')}.pdf"

# ── Derived financials ────────────────────────────────────────────────────────
def _first_non_null(key):
    for _d in financial_metrics.values():
        _v = _d.get(key)
        if _v is not None:
            return _v
    return None

_revenue       = _first_non_null("Revenue")
_net_profit    = _first_non_null("Net_Profit")
_ebitda_margin = _first_non_null("EBITDA_Margin")
_total_debt    = _first_non_null("Total_Debt")
_equity        = _first_non_null("Equity")
_cash_flow     = _first_non_null("Cash_Flow")
_leverage      = _first_non_null("Leverage")
_dscr          = _first_non_null("DSCR")

def _fmt(val, prefix="Rs.", suffix=" Cr"):
    return f"{prefix}{val:,.1f}{suffix}" if val is not None else "N/A"
def _pct(val):
    return f"{val:.1f}%" if val is not None else "N/A"
def _ratio(val):
    return f"{val:.2f}x" if val is not None else "N/A"

_risk_score_val        = float(risk_score)
_approval_decision     = str(loan_approval)
_recommended_limit_val = int(recommended_limit)

def _score_band(s):
    if s < 30:  return "LOW RISK",      _GREEN
    if s < 55:  return "MODERATE RISK", _ORANGE
    if s < 75:  return "HIGH RISK",     _YELLOW
    return "CRITICAL RISK", _RED

_risk_band, _risk_colour = _score_band(_risk_score_val)
_decision_colour = {
    "APPROVED": _GREEN, "CONDITIONAL": _ORANGE,
    "REVIEW": _YELLOW,  "DECLINED": _RED,
}.get(_approval_decision, _FG2)

# ─────────────────────────────────────────────────────────────────────────────
# 1. cam_summary TEXT
# ─────────────────────────────────────────────────────────────────────────────
_rf_lines = "\n".join(
    f"  [{'FLAGGED' if v['flagged'] else 'CLEAR':7s}] {k.upper().replace('_',' ')}  ({v['count']} triggers)"
    for k, v in risk_flags.items()
)
_shap_lines = "\n".join(
    f"  {'Up' if v > 0 else 'Dn'}  {k:<25} {v:+.4f}"
    for k, v in sorted(shap_explanation.items(), key=lambda x: abs(x[1]), reverse=True)
)
_fraud_text = (
    "\n".join(f"  [{f['severity']:6s}] {f['flag_name']} -- {f['doc_id']}" for f in fraud_flags)
    if fraud_flags else "  None detected."
)

cam_summary = f"""CREDIT APPRAISAL MEMO (CAM)
Ref: {_REF_NO}  |  Date: {_TODAY}  |  Borrower: {_COMPANY_NAME}

--- SECTION 1: CHARACTER ---
{_rf_lines}
Assessment: {"ADVERSE - Multiple red flags detected." if any(v["flagged"] for v in risk_flags.values()) else "SATISFACTORY - No adverse media."}

--- SECTION 2: CAPACITY ---
  Revenue         : {_fmt(_revenue)}
  Net Profit      : {_fmt(_net_profit)}
  EBITDA Margin   : {_pct(_ebitda_margin)}
  Cash Flow (Ops) : {_fmt(_cash_flow)}
  DSCR            : {_ratio(_dscr)}
  Revenue Growth  : {sample_applicant.get('revenue_growth', 0)*100:+.1f}%
Assessment: {"ADEQUATE - DSCR >= 1.25." if _dscr and _dscr >= 1.25 else "STRESSED - DSCR < 1.25." if _dscr else "INSUFFICIENT DATA."}

--- SECTION 3: CAPITAL ---
  Total Debt  : {_fmt(_total_debt)}
  Equity      : {_fmt(_equity)}
  Leverage    : {_ratio(_leverage)}
  D/E (model) : {sample_applicant.get('debt_equity_ratio', 0):.2f}x
Assessment: {"OVERLEVERAGED." if _leverage and _leverage > 4.0 else "ACCEPTABLE." if _leverage else "PARTIAL DATA."}

--- SECTION 4: COLLATERAL ---
  Book Equity    : {_fmt(_equity)}
  Physical Assets: Pending valuation
Assessment: {"POSITIVE NET WORTH." if _equity and _equity > 0 else "NEGATIVE EQUITY."}

--- SECTION 5: CONDITIONS ---
  Sector Risk     : {sample_applicant.get('sector_risk', 0):.2f} / 1.0
  News Sentiment  : {sample_applicant.get('news_sentiment', 0):+.2f}
  Sector Downturn : {"YES" if risk_flags.get("sector_downturn", {}).get("flagged") else "NO"}
  Revenue Growth  : {sample_applicant.get('revenue_growth', 0)*100:+.1f}%
Assessment: {"UNFAVOURABLE - High sector risk." if sample_applicant.get('sector_risk', 0) > 0.5 else "NEUTRAL."}

--- MODEL RISK SCORE ---
  Risk Score : {_risk_score_val:.1f} / 100  ({_risk_band})
  AUC-ROC    : {float(auc):.4f}
{_shap_lines}

--- FRAUD DETECTION ---
{_fraud_text}

--- FINAL CREDIT DECISION ---
  Decision    : {_approval_decision}
  Limit       : {"Rs." + f"{_recommended_limit_val:,}" if _recommended_limit_val else "NIL"}
  Risk Band   : {_risk_band}
  Risk Score  : {_risk_score_val:.1f} / 100

Generated by Zerve Credit Intelligence Platform | {_TODAY}""".strip()

# ─────────────────────────────────────────────────────────────────────────────
# 2. PDF helpers
# ─────────────────────────────────────────────────────────────────────────────

def _new_page():
    _fig = plt.figure(figsize=(8.27, 11.69), facecolor=_BG)
    return _fig

def _hline(ax, y, color=_FG2, lw=0.4):
    """Draw a horizontal line using ax.plot in axes-fraction coords."""
    ax.plot([0.0, 1.0], [y, y], color=color, linewidth=lw,
            transform=ax.transAxes, clip_on=False)

def _header(fig):
    _hax = fig.add_axes([0, 0.89, 1, 0.11])
    _hax.set_facecolor(_BG); _hax.axis("off")
    _hax.set_xlim(0, 1); _hax.set_ylim(0, 1)
    _hline(_hax, 0.08, _BLUE, 1.5)
    _hax.text(0.5, 0.93, "CREDIT APPRAISAL MEMO",
              ha="center", va="top", color=_FG, fontsize=18, fontweight="bold")
    _hax.text(0.5, 0.62, "Zerve Credit Intelligence Platform",
              ha="center", va="top", color=_FG2, fontsize=10)
    _hax.text(0.5, 0.38, f"Ref: {_REF_NO}   |   Borrower: {_COMPANY_NAME}   |   {_TODAY}",
              ha="center", va="top", color=_FG2, fontsize=8.5)

def _footer(fig, page, total):
    fig.text(0.5, 0.004,
             f"Page {page} of {total}   |   Zerve Credit Intelligence Platform   |   {_TODAY}",
             ha="center", color=_FG2, fontsize=7)

def _section(ax, y, title, fontsize=11):
    ax.text(0.0, y, title, color=_BLUE, fontsize=fontsize,
            fontweight="bold", va="top", transform=ax.transAxes)
    _hline(ax, y - 0.003, _FG2, 0.35)

def _tbl_hdr(ax, y, cols, xs):
    for _xi, _h in zip(xs, cols):
        ax.text(_xi, y, _h, color=_BLUE, fontsize=8.5, fontweight="bold",
                va="top", transform=ax.transAxes)
    _hline(ax, y - 0.025, _FG2, 0.3)

def _row(ax, y, cells, xs, cols=None, dy=0.038):
    if cols is None:
        cols = [_FG] * len(cells)
    for _xi, _cell, _c in zip(xs, cells, cols):
        ax.text(_xi, y, str(_cell), color=_c, fontsize=8.5,
                va="top", transform=ax.transAxes)
    return y - dy

def _assessment_col(val):
    _v = str(val).upper()
    if any(w in _v for w in ("ADVERSE","DECLIN","STRESS","OVER","NEGAT","HIGH","ANOM","UNSTAB")):
        return _RED
    if any(w in _v for w in ("ADEQU","POSIT","ACCEPT","STABLE","MODER","NORM","GROW","NEUTR")):
        return _GREEN
    return _FG2

# ─────────────────────────────────────────────────────────────────────────────
# PAGE 1: Banner + Character + Capacity
# ─────────────────────────────────────────────────────────────────────────────
fig1 = _new_page()
_header(fig1)

# Decision Banner
_dec_bg = {"APPROVED":"#1a3a2a","CONDITIONAL":"#3a2a10",
           "REVIEW":"#2a2a10","DECLINED":"#3a1010"}.get(_approval_decision,"#2a2a2e")
_bax = fig1.add_axes([0.03, 0.79, 0.94, 0.065])
_bax.set_facecolor(_dec_bg); _bax.axis("off")
_bax.set_xlim(0,1); _bax.set_ylim(0,1)
for _sp in _bax.spines.values():
    _sp.set_visible(True); _sp.set_edgecolor(_decision_colour); _sp.set_linewidth(1.2)
_bax.text(0.02, 0.5, f"DECISION: {_approval_decision}",
          color=_decision_colour, fontsize=14, fontweight="bold", va="center")
_bax.text(0.42, 0.5, f"Risk Score: {_risk_score_val:.1f}/100  |  {_risk_band}",
          color=_decision_colour, fontsize=11, fontweight="bold", va="center")
_bax.text(0.80, 0.5,
          f"Limit: {'Rs.'+f'{_recommended_limit_val:,}' if _recommended_limit_val else 'NIL'}",
          color=_decision_colour, fontsize=11, fontweight="bold", va="center")

ax1 = fig1.add_axes([0.05, 0.02, 0.90, 0.755])
ax1.set_facecolor(_BG); ax1.axis("off"); ax1.set_xlim(0,1); ax1.set_ylim(0,1)

_y = 0.97
_section(ax1, _y, "1 · CHARACTER")
_y -= 0.04
ax1.text(0.02, _y, "Borrower reputation & integrity assessed via news sentiment and risk-flag intelligence.",
         color=_FG2, fontsize=8.5, va="top", transform=ax1.transAxes)
_y -= 0.045

_tbl_hdr(ax1, _y, ["Risk Category","Status","Triggers","Assessment"], [0.02,0.35,0.57,0.72])
_y -= 0.042

_risk_labels = [("legal_risk","Legal Risk"),("regulatory_risk","Regulatory Risk"),
                ("sector_downturn","Sector Downturn"),("fraud_risk","Fraud Risk")]
for _rk, _rlbl in _risk_labels:
    _rf = risk_flags.get(_rk, {"flagged":False,"count":0})
    _sc = _RED if _rf["flagged"] else _GREEN
    _y = _row(ax1, _y,
              [_rlbl, "FLAGGED" if _rf["flagged"] else "Clear",
               str(_rf["count"]), "Adverse" if _rf["flagged"] else "Satisfactory"],
              [0.02, 0.35, 0.57, 0.72],
              [_FG, _sc, _FG, _sc])

_overall_char = "ADVERSE — Multiple red flags detected." \
    if any(v["flagged"] for v in risk_flags.values()) else "SATISFACTORY — No adverse media."
_cc = _RED if "ADVERSE" in _overall_char else _GREEN
_y -= 0.01
ax1.text(0.02, _y, f"Overall: {_overall_char}",
         color=_cc, fontsize=8.5, va="top", fontweight="bold", transform=ax1.transAxes)
_y -= 0.06

_section(ax1, _y, "2 · CAPACITY")
_y -= 0.04
ax1.text(0.02, _y, "Ability to service debt from operating cash flows.",
         color=_FG2, fontsize=8.5, va="top", transform=ax1.transAxes)
_y -= 0.045

_tbl_hdr(ax1, _y, ["Metric","Value","Assessment"], [0.02,0.45,0.70])
_y -= 0.042

_cap_rows = [
    ("Revenue (FY2024)",   _fmt(_revenue),   "—"),
    ("Net Profit",         _fmt(_net_profit), "—"),
    ("EBITDA Margin",      _pct(_ebitda_margin),
     "ANOMALY" if _ebitda_margin and (_ebitda_margin > 60 or _ebitda_margin < 0) else "Normal"),
    ("Cash Flow (Ops)",    _fmt(_cash_flow),  "—"),
    ("DSCR",               _ratio(_dscr),
     "ADEQUATE" if _dscr and _dscr >= 1.25 else ("STRESSED" if _dscr else "N/A")),
    ("Revenue Growth",     f"{sample_applicant.get('revenue_growth',0)*100:+.1f}%",
     "DECLINING" if sample_applicant.get("revenue_growth",0) < 0 else "POSITIVE"),
    ("Cashflow Stability", f"{sample_applicant.get('cashflow_stability',0):.2f}",
     "STABLE" if sample_applicant.get("cashflow_stability",0) >= 0.5 else "UNSTABLE"),
]
for _lbl, _val, _asmnt in _cap_rows:
    _y = _row(ax1, _y, [_lbl, _val, _asmnt], [0.02,0.45,0.70],
              [_FG, _FG, _assessment_col(_asmnt)])

_footer(fig1, 1, 3)

# ─────────────────────────────────────────────────────────────────────────────
# PAGE 2: Capital + Collateral + Conditions
# ─────────────────────────────────────────────────────────────────────────────
fig2 = _new_page()
_header(fig2)

ax2 = fig2.add_axes([0.05, 0.02, 0.90, 0.845])
ax2.set_facecolor(_BG); ax2.axis("off"); ax2.set_xlim(0,1); ax2.set_ylim(0,1)

_y2 = 0.97
_section(ax2, _y2, "3 · CAPITAL")
_y2 -= 0.04
ax2.text(0.02, _y2, "Financial strength and solvency position of the borrower.",
         color=_FG2, fontsize=8.5, va="top", transform=ax2.transAxes)
_y2 -= 0.045
_tbl_hdr(ax2, _y2, ["Metric","Value","Assessment"], [0.02,0.45,0.70])
_y2 -= 0.042

_cap2_rows = [
    ("Total Debt",          _fmt(_total_debt),  "—"),
    ("Shareholders Equity", _fmt(_equity),
     "POSITIVE" if _equity and _equity > 0 else "NEGATIVE"),
    ("Leverage (D/EBITDA)", _ratio(_leverage),
     "OVERLEVERAGED" if _leverage and _leverage > 4 else ("MODERATE" if _leverage else "N/A")),
    ("D/E Ratio (model)",   f"{sample_applicant.get('debt_equity_ratio',0):.2f}x",
     "HIGH" if sample_applicant.get("debt_equity_ratio",0) > 2.0 else "MODERATE"),
]
for _lbl, _val, _asmnt in _cap2_rows:
    _y2 = _row(ax2, _y2, [_lbl, _val, _asmnt], [0.02,0.45,0.70],
               [_FG, _FG, _assessment_col(_asmnt)])

_y2 -= 0.025
_section(ax2, _y2, "4 · COLLATERAL")
_y2 -= 0.04
ax2.text(0.02, _y2, "Security and asset backing available against the credit facility.",
         color=_FG2, fontsize=8.5, va="top", transform=ax2.transAxes)
_y2 -= 0.045
_tbl_hdr(ax2, _y2, ["Security Type","Value","Coverage / Note"], [0.02,0.38,0.62])
_y2 -= 0.042
for _lbl, _val, _note in [
    ("Book Equity",    _fmt(_equity),        "Primary (Book Value)"),
    ("Physical Assets","Not assessed",       "Pending physical valuation"),
    ("Charge Type",    "To be confirmed",    "TBD at sanction stage"),
]:
    _y2 = _row(ax2, _y2, [_lbl, _val, _note], [0.02,0.38,0.62])

_y2 -= 0.025
_section(ax2, _y2, "5 · CONDITIONS")
_y2 -= 0.04
ax2.text(0.02, _y2, "External factors, sector environment, and macro conditions.",
         color=_FG2, fontsize=8.5, va="top", transform=ax2.transAxes)
_y2 -= 0.045
_tbl_hdr(ax2, _y2, ["Condition Factor","Value","Assessment"], [0.02,0.45,0.70])
_y2 -= 0.042
for _lbl, _val, _asmnt in [
    ("Sector Risk Score",  f"{sample_applicant.get('sector_risk',0):.2f} / 1.0",
     "HIGH" if sample_applicant.get("sector_risk",0) > 0.5 else "MODERATE"),
    ("News Sentiment",     f"{sample_applicant.get('news_sentiment',0):+.2f}",
     "NEGATIVE" if sample_applicant.get("news_sentiment",0) < 0 else "POSITIVE"),
    ("Sector Downturn",    "YES" if risk_flags.get("sector_downturn",{}).get("flagged") else "NO",
     "ADVERSE" if risk_flags.get("sector_downturn",{}).get("flagged") else "NEUTRAL"),
    ("Revenue Growth",     f"{sample_applicant.get('revenue_growth',0)*100:+.1f}%",
     "DECLINING" if sample_applicant.get("revenue_growth",0) < 0 else "GROWING"),
]:
    _y2 = _row(ax2, _y2, [_lbl, _val, _asmnt], [0.02,0.45,0.70],
               [_FG, _FG, _assessment_col(_asmnt)])

_footer(fig2, 2, 3)

# ─────────────────────────────────────────────────────────────────────────────
# PAGE 3: Risk Score + SHAP + Fraud + Final Decision
# ─────────────────────────────────────────────────────────────────────────────
fig3 = _new_page()
_header(fig3)

ax3 = fig3.add_axes([0.05, 0.02, 0.90, 0.845])
ax3.set_facecolor(_BG); ax3.axis("off"); ax3.set_xlim(0,1); ax3.set_ylim(0,1)

_y3 = 0.97
_section(ax3, _y3, "6 · MODEL RISK SCORE & FEATURE ATTRIBUTION")
_y3 -= 0.04
ax3.text(0.02, _y3,
         f"RandomForest credit risk model (AUC-ROC: {float(auc):.4f}) — "
         "SHAP-style per-feature contributions.",
         color=_FG2, fontsize=8.5, va="top", transform=ax3.transAxes)
_y3 -= 0.04
ax3.text(0.02, _y3, "Risk Score:", color=_FG2, fontsize=9, va="top", transform=ax3.transAxes)
ax3.text(0.18, _y3, f"{_risk_score_val:.1f} / 100", color=_risk_colour,
         fontsize=11, fontweight="bold", va="top", transform=ax3.transAxes)
ax3.text(0.42, _y3, f"Band: {_risk_band}", color=_risk_colour,
         fontsize=10, fontweight="bold", va="top", transform=ax3.transAxes)
_y3 -= 0.055

_tbl_hdr(ax3, _y3, ["Feature","Input Value","Risk Attribution","Direction"],
         [0.02, 0.38, 0.58, 0.80])
_y3 -= 0.042

for _feat_name, _shap_val in sorted(shap_explanation.items(),
                                     key=lambda x: abs(x[1]), reverse=True):
    _inp = sample_applicant.get(_feat_name, "—")
    _inp_str = f"{_inp:.4f}" if isinstance(_inp, float) else str(_inp)
    _dir = "Increases risk" if _shap_val > 0 else "Reduces risk"
    _dc  = _ORANGE if _shap_val > 0 else _BLUE
    _y3 = _row(ax3, _y3,
               [_feat_name.replace("_"," ").title(), _inp_str, f"{_shap_val:+.5f}", _dir],
               [0.02, 0.38, 0.58, 0.80],
               [_FG, _FG, _dc, _dc])

_y3 -= 0.025
_section(ax3, _y3, "7 · FRAUD DETECTION FLAGS")
_y3 -= 0.04

if fraud_flags:
    _tbl_hdr(ax3, _y3, ["Severity","Flag ID","Document","Description"],
             [0.02,0.18,0.50,0.75])
    _y3 -= 0.042
    for _fl in fraud_flags:
        _fc = _RED if _fl.get("severity") == "HIGH" else _YELLOW
        _y3 = _row(ax3, _y3,
                   [_fl.get("severity","—"), _fl.get("flag_id","—")[:22],
                    _fl.get("doc_id","—")[:18],
                    (_fl.get("description","")[:30]+"…")],
                   [0.02,0.18,0.50,0.75],
                   [_fc, _FG, _FG, _FG2])
else:
    ax3.text(0.02, _y3, "No fraud signals detected across all documents.",
             color=_GREEN, fontsize=8.5, va="top", transform=ax3.transAxes)
    _y3 -= 0.04

# Final Decision
_y3 -= 0.03
_hline(ax3, _y3, _decision_colour, 1.5)
_y3 -= 0.015
_section(ax3, _y3, "FINAL CREDIT DECISION", fontsize=12)
_y3 -= 0.055

for _lbl, _val in [
    ("Decision",          _approval_decision),
    ("Risk Score",        f"{_risk_score_val:.1f} / 100"),
    ("Risk Band",         _risk_band),
    ("Recommended Limit", f"Rs.{_recommended_limit_val:,}" if _recommended_limit_val else "NIL"),
    ("Interest Rate",     "N/A (Declined)" if interest_rate is None else f"{interest_rate}%"),
    ("Reference No.",     _REF_NO),
    ("Date",              _TODAY),
]:
    _vc  = _decision_colour if _lbl == "Decision" else \
           _risk_colour      if _lbl == "Risk Band" else _FG
    _fss = 12 if _lbl == "Decision" else 9
    _fw  = "bold" if _lbl in ("Decision","Risk Band") else "normal"
    ax3.text(0.05, _y3, _lbl,  color=_FG2, fontsize=9, va="top", transform=ax3.transAxes)
    ax3.text(0.42, _y3, str(_val), color=_vc, fontsize=_fss,
             fontweight=_fw, va="top", transform=ax3.transAxes)
    _y3 -= 0.042

_hline(ax3, _y3 - 0.01, _FG2, 0.35)
ax3.text(0.5, _y3 - 0.04,
         f"Auto-generated by Zerve Credit Intelligence Platform on {_TODAY}. "
         "For internal use only.",
         color=_FG2, fontsize=7, ha="center", va="top", transform=ax3.transAxes)

_footer(fig3, 3, 3)

# ── Save PDF ──────────────────────────────────────────────────────────────────
with PdfPages(_PDF_PATH) as _pdf:
    _pdf.savefig(fig1, bbox_inches="tight", facecolor=_BG)
    _pdf.savefig(fig2, bbox_inches="tight", facecolor=_BG)
    _pdf.savefig(fig3, bbox_inches="tight", facecolor=_BG)

plt.close(fig1); plt.close(fig2); plt.close(fig3)

# ── Output variables ──────────────────────────────────────────────────────────
cam_pdf_path = _PDF_PATH

print("=" * 68)
print("  CREDIT APPRAISAL MEMO — GENERATION COMPLETE")
print("=" * 68)
print(f"  PDF saved   : {cam_pdf_path}")
print(f"  Borrower    : {_COMPANY_NAME}")
print(f"  Decision    : {_approval_decision}  |  Score: {_risk_score_val:.1f}/100  |  {_risk_band}")
print(f"  Limit       : {'Rs.'+f'{_recommended_limit_val:,}' if _recommended_limit_val else 'NIL'}")
print()
print(f"  cam_pdf_path -> '{cam_pdf_path}'")
print(f"  cam_summary  -> string ({len(cam_summary)} chars)")
print()
print("─" * 68)
print("  CAM SUMMARY EXCERPT (first 1000 chars)")
print("─" * 68)
print(cam_summary[:1000])
print("  ...")
