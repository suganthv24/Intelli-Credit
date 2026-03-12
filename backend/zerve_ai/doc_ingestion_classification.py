"""
Document Ingestion & Classification Pipeline
============================================
Extracts text from PDFs (PyMuPDF / pdfplumber) with OCR fallback (pytesseract)
and classifies each document into one of five financial report types:
  - annual_report
  - shareholding
  - alm
  - borrowing_profile
  - portfolio_performance

Uses mock/sample documents when no PDFs are available.
Outputs:  raw_text (list[str]), doc_type (list[str]), doc_id (list[str])
"""

import os
import glob
import re
import json
from pathlib import Path
from collections import Counter

# ── Zerve design tokens ─────────────────────────────────────────────────────
BG_COL      = "#1D1D20"
FG_COL      = "#fbfbff"
FG2_COL     = "#909094"
PALETTE_CLS = ["#A1C9F4", "#FFB482", "#8DE5A1", "#FF9F9B", "#D0BBFF"]

# ── Target document classes ──────────────────────────────────────────────────
CLASSES = ["annual_report", "shareholding", "alm", "borrowing_profile", "portfolio_performance"]

# ── Keyword signatures per class (rule-based classifier) ────────────────────
CLASS_KEYWORDS = {
    "annual_report": [
        "annual report", "chairman", "board of directors", "profit after tax",
        "earnings per share", "dividend", "revenue", "net profit", "fiscal year",
        "auditor", "balance sheet", "income statement", "cash flow", "ebitda",
        "consolidated", "subsidiaries", "corporate governance", "agm"
    ],
    "shareholding": [
        "shareholding pattern", "promoter", "public shareholding", "institutional",
        "fii", "dii", "retail investors", "shares outstanding", "equity capital",
        "percentage holding", "dematerialised", "demat", "nse", "bse",
        "beneficial owner", "pledge", "encumbered shares", "face value"
    ],
    "alm": [
        "asset liability management", "alm", "liquidity gap", "maturity profile",
        "interest rate risk", "duration", "repricing", "bucket", "net interest margin",
        "sensitivity analysis", "gap analysis", "rate sensitive", "liability",
        "deposit maturity", "structural liquidity", "stress testing", "nii impact"
    ],
    "borrowing_profile": [
        "borrowing profile", "debt maturity", "loan portfolio", "credit facilities",
        "term loan", "working capital", "debenture", "bond", "commercial paper",
        "ecb", "external commercial borrowing", "rated", "credit rating", "moody",
        "s&p", "fitch", "debt service coverage", "repayment schedule", "leverage"
    ],
    "portfolio_performance": [
        "portfolio performance", "nav", "net asset value", "aum", "assets under management",
        "fund performance", "benchmark", "alpha", "beta", "sharpe ratio", "returns",
        "cagr", "irr", "xirr", "portfolio composition", "sector allocation",
        "drawdown", "volatility", "standard deviation", "risk-adjusted"
    ],
}

# ── Sample financial documents (mock) ───────────────────────────────────────
SAMPLE_DOCS = {
    "annual_report_FY2024.pdf": """
ANNUAL REPORT 2023-24

Chairman's Message
Dear Shareholders,
It gives me immense pleasure to present the Annual Report for the fiscal year 2023-24.
The company recorded a revenue of ₹12,450 crores, a growth of 18% year-on-year.
Net profit after tax stood at ₹1,820 crores, with Earnings Per Share (EPS) of ₹42.6.
EBITDA margin improved to 24.3% from 22.1% in the previous year.

Board of Directors approved a dividend of ₹8 per share for FY2024.

Balance Sheet Summary:
  Total Assets:       ₹48,000 crores
  Total Liabilities:  ₹32,500 crores
  Shareholders Equity: ₹15,500 crores

The consolidated income statement reflects contribution from all subsidiaries.
The auditor's report is appended to this report.
Corporate Governance norms are strictly adhered to, with an AGM scheduled on July 28, 2024.
Cash flow from operations: ₹2,100 crores.
""",
    "shareholding_Q1FY25.pdf": """
SHAREHOLDING PATTERN – Q1 FY2025 (as on June 30, 2024)
Stock Exchange: NSE / BSE   |   Face Value: ₹10

Category                        Shares Held     % Holding
--------------------------------------------------------------
A. Promoter & Promoter Group    542,000,000     54.2%
   - Indian Promoters           480,000,000     48.0%
   - Foreign Promoters           62,000,000      6.2%

B. Public Shareholding          458,000,000     45.8%
   - Institutional Investors    280,000,000     28.0%
     FII / FPI                  130,000,000     13.0%
     DII                        150,000,000     15.0%
   - Retail Investors            98,000,000      9.8%
   - Others                      80,000,000      8.0%

Total Shares Outstanding:     1,000,000,000    100.0%

Notes:
  • Promoter shares: Nil pledge / encumbered shares
  • All shares held in dematerialised (Demat) form
  • Beneficial owner details updated per SEBI circular
""",
    "alm_report_Q2FY25.pdf": """
ASSET LIABILITY MANAGEMENT (ALM) REPORT – Q2 FY2025

1. Structural Liquidity & Maturity Profile
The ALM committee reviews the liquidity gap across time buckets:

Maturity Bucket       Assets (₹ Cr)   Liabilities (₹ Cr)   Liquidity Gap
0-30 days               8,200            9,500               -1,300
31-90 days              6,100            5,800                  300
91-180 days             4,500            4,200                  300
181 days–1 year         7,800            6,900                  900
1–3 years              12,400           11,500                  900
3–5 years               9,100            8,700                  400
>5 years               14,200           13,100                1,100

2. Interest Rate Risk & Net Interest Margin
Net Interest Margin (NIM): 3.42%
Rate-sensitive assets represent 68% of total assets.
Duration gap between assets and liabilities: +0.8 years.

NII Impact (100 bps parallel shift):
  Upward shock:  +₹180 crores
  Downward shock: -₹165 crores

3. Stress Testing
Under liquidity stress scenario (deposit run-off 20% in 30 days),
the bank maintains a Liquidity Coverage Ratio (LCR) of 128%, above regulatory minimum.
""",
    "borrowing_profile_H1FY25.pdf": """
BORROWING PROFILE – H1 FY2025

Summary of Debt Portfolio:
Total Borrowings: ₹28,400 crores

Instrument-wise Breakup:
  Term Loans (Banks)          ₹9,200 Cr   (32.4%)
  Non-Convertible Debentures  ₹7,500 Cr   (26.4%)
  Commercial Paper            ₹3,100 Cr   (10.9%)
  External Commercial Borrowings (ECB)  ₹2,800 Cr  (9.9%)
  Working Capital Facilities  ₹4,200 Cr   (14.8%)
  Bonds                       ₹1,600 Cr    (5.6%)

Debt Maturity Profile:
  < 1 year     ₹8,500 Cr   29.9%
  1–3 years   ₹10,200 Cr   35.9%
  3–5 years    ₹6,700 Cr   23.6%
  > 5 years    ₹3,000 Cr   10.6%

Credit Ratings:
  CRISIL: AAA/Stable
  ICRA:   AAA/Positive
  Moody's: Baa2 / S&P: BBB- / Fitch: BBB

Debt Service Coverage Ratio (DSCR): 2.4x
Leverage (Net Debt / EBITDA): 3.1x
Repayment schedule is well-distributed, minimizing refinancing risk.
""",
    "portfolio_performance_Sep2024.pdf": """
PORTFOLIO PERFORMANCE REPORT – September 2024

Fund: XYZ Balanced Growth Fund
AUM: ₹14,280 crores   |   NAV (as on 30-Sep-2024): ₹182.46
Benchmark: NIFTY 500 TRI

Performance Summary (CAGR):
  1 Month:   +2.1%     (Benchmark: +1.8%)
  3 Months:  +7.4%     (Benchmark: +6.2%)
  6 Months: +13.8%     (Benchmark: +11.9%)
  1 Year:   +24.3%     (Benchmark: +21.1%)
  3 Year:   +16.7%     (Benchmark: +14.2%)
  Since Inception (XIRR): +18.9%

Risk Metrics (trailing 3-year):
  Annualised Volatility:  14.2%
  Sharpe Ratio:            1.18
  Alpha (vs benchmark):   +2.5%
  Beta:                    0.91
  Maximum Drawdown:       -21.3%

Portfolio Composition (by Sector):
  Financial Services:   28.4%
  Technology:           18.6%
  Healthcare:           12.3%
  Consumer Goods:       10.1%
  Energy:                9.7%
  Others:               20.9%
""",
}


# ═══════════════════════════════════════════════════════════════════════════
# Helper: try to import PDF / OCR libraries; fall back gracefully
# ═══════════════════════════════════════════════════════════════════════════

def _try_extract_fitz(pdf_path: str) -> str:
    """Extract text using PyMuPDF (fitz)."""
    import fitz  # PyMuPDF
    text_parts = []
    with fitz.open(pdf_path) as doc:
        for page in doc:
            text_parts.append(page.get_text())
    return "\n".join(text_parts).strip()


def _try_extract_pdfplumber(pdf_path: str) -> str:
    """Extract text using pdfplumber."""
    import pdfplumber
    text_parts = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n".join(text_parts).strip()


def _try_ocr(pdf_path: str) -> str:
    """Render PDF pages as images and run pytesseract OCR (scanned docs)."""
    import fitz
    import pytesseract
    from PIL import Image
    import io
    text_parts = []
    with fitz.open(pdf_path) as doc:
        for page in doc:
            pix = page.get_pixmap(dpi=200)
            img = Image.open(io.BytesIO(pix.tobytes("png")))
            text_parts.append(pytesseract.image_to_string(img))
    return "\n".join(text_parts).strip()


def extract_text_from_pdf(pdf_path: str) -> tuple[str, str]:
    """
    Attempt text extraction in order:
      1. PyMuPDF (fast, digital PDFs)
      2. pdfplumber  (better table handling)
      3. pytesseract OCR  (scanned / image PDFs)

    Returns (extracted_text, method_used).
    """
    # ── 1. PyMuPDF ─────────────────────────────────────────────────────────
    try:
        text = _try_extract_fitz(pdf_path)
        if len(text) > 100:          # meaningful text extracted
            return text, "fitz"
    except Exception:
        pass

    # ── 2. pdfplumber ───────────────────────────────────────────────────────
    try:
        text = _try_extract_pdfplumber(pdf_path)
        if len(text) > 100:
            return text, "pdfplumber"
    except Exception:
        pass

    # ── 3. OCR fallback ─────────────────────────────────────────────────────
    try:
        text = _try_ocr(pdf_path)
        if text:
            return text, "ocr"
    except Exception:
        pass

    return "", "failed"


# ═══════════════════════════════════════════════════════════════════════════
# Classifier: keyword-based scoring
# ═══════════════════════════════════════════════════════════════════════════

def classify_document(text: str) -> tuple[str, dict]:
    """
    Score text against each class's keyword list (case-insensitive).
    Returns (predicted_class, score_dict).
    """
    text_lower = text.lower()
    scores = {}
    for cls, kws in CLASS_KEYWORDS.items():
        hits = sum(1 for kw in kws if kw in text_lower)
        scores[cls] = hits

    best_class = max(scores, key=scores.get)
    # If all scores are 0 → unclassified
    if scores[best_class] == 0:
        best_class = "unclassified"

    return best_class, scores


# ═══════════════════════════════════════════════════════════════════════════
# Pipeline: discover PDFs → extract → classify
# ═══════════════════════════════════════════════════════════════════════════

pdf_files = glob.glob("*.pdf")

# ── Use real PDFs if present, otherwise fall back to sample documents ───────
using_mock = False
if pdf_files:
    print(f"📂  Found {len(pdf_files)} PDF file(s): {pdf_files}")
    source_docs = {p: None for p in pdf_files}    # text to be extracted
else:
    print("📂  No PDF files found — using 5 mock financial documents.")
    source_docs = SAMPLE_DOCS                      # dict {filename: text}
    using_mock = True

# Output lists
raw_text: list[str] = []
doc_type: list[str] = []
doc_id:   list[str] = []

print("\n" + "=" * 68)
print("  DOCUMENT INGESTION & CLASSIFICATION PIPELINE")
print("=" * 68)

for filename, preloaded_text in source_docs.items():
    doc_id_val = Path(filename).stem           # filename without extension

    # ── Text extraction ──────────────────────────────────────────────────
    if using_mock or preloaded_text:
        text   = preloaded_text.strip()
        method = "mock_text"
    else:
        text, method = extract_text_from_pdf(filename)

    # ── Classification ───────────────────────────────────────────────────
    predicted_class, cls_scores = classify_document(text)

    # ── Append to output lists ───────────────────────────────────────────
    raw_text.append(text)
    doc_type.append(predicted_class)
    doc_id.append(doc_id_val)

    # ── Per-document summary ─────────────────────────────────────────────
    scores_str = " | ".join(
        f"{cls[:6]}={v}" for cls, v in sorted(cls_scores.items(), key=lambda x: -x[1])
    )
    print(f"\n{'─'*68}")
    print(f"  📄  {filename}")
    print(f"  🔑  Doc ID   : {doc_id_val}")
    print(f"  🔧  Extracted: {method}  ({len(text):,} chars)")
    print(f"  🏷️   Class    : {predicted_class.upper()}")
    print(f"  📊  Scores   : {scores_str}")
    _preview = text.replace("\n", " ")[:120].strip()
    print(f"  📝  Preview  : {_preview}…")

# ── Pipeline summary ─────────────────────────────────────────────────────────
print(f"\n{'='*68}")
print(f"  PIPELINE SUMMARY")
print(f"{'='*68}")
print(f"  Total documents processed : {len(doc_id)}")
_type_counts = Counter(doc_type)
for cls in CLASSES:
    cnt = _type_counts.get(cls, 0)
    bar = "█" * cnt
    print(f"  {cls:<25s}: {cnt:>2d}  {bar}")
if "unclassified" in _type_counts:
    print(f"  {'unclassified':<25s}: {_type_counts['unclassified']:>2d}")

print(f"\n✅  Output variables ready:")
print(f"    raw_text  — list[str], {len(raw_text)} documents")
print(f"    doc_type  — list[str], {len(doc_type)} classifications")
print(f"    doc_id    — list[str], {len(doc_id)} identifiers")

# ── Visualisation: classification distribution ───────────────────────────────
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

plt.rcParams.update({"font.family": "DejaVu Sans"})

class_counts = [_type_counts.get(c, 0) for c in CLASSES]
_class_labels_short = [
    "Annual\nReport", "Share-\nholding", "ALM", "Borrowing\nProfile", "Portfolio\nPerf."
]

fig_cls, ax_cls = plt.subplots(figsize=(11, 5))
fig_cls.patch.set_facecolor(BG_COL)
ax_cls.set_facecolor(BG_COL)

_x = np.arange(len(CLASSES))
_bars = ax_cls.bar(_x, class_counts, color=PALETTE_CLS, edgecolor="none", width=0.55)

for _bar, _cnt in zip(_bars, class_counts):
    ax_cls.text(
        _bar.get_x() + _bar.get_width() / 2,
        _bar.get_height() + 0.05,
        str(_cnt),
        ha="center", va="bottom", color=FG_COL, fontsize=13, fontweight="bold"
    )

ax_cls.set_xticks(_x)
ax_cls.set_xticklabels(_class_labels_short, color=FG_COL, fontsize=10.5)
ax_cls.set_yticks(range(max(class_counts) + 2))
ax_cls.tick_params(axis="y", colors=FG2_COL)
ax_cls.set_ylabel("Documents Classified", color=FG2_COL, fontsize=11)
ax_cls.set_title(
    "Document Classification Results — Financial Report Pipeline",
    color=FG_COL, fontsize=14, fontweight="bold", pad=16
)
ax_cls.spines[["top", "right", "left"]].set_visible(False)
ax_cls.spines["bottom"].set_color(FG2_COL)
ax_cls.set_ylim(0, max(class_counts) + 1.5)
ax_cls.yaxis.label.set_color(FG2_COL)

_legend_patches = [
    mpatches.Patch(color=PALETTE_CLS[i], label=CLASSES[i]) for i in range(len(CLASSES))
]
ax_cls.legend(
    handles=_legend_patches, loc="upper right", frameon=True,
    facecolor="#2a2a2e", edgecolor="#444", labelcolor=FG_COL, fontsize=9
)

plt.tight_layout(pad=1.5)
plt.show()
