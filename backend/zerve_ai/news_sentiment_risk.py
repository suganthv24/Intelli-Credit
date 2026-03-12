
import re
from collections import defaultdict

# ─── Configuration ───────────────────────────────────────────────────────────
SAMPLE_COMPANY = "Tesla"  # Change to analyze a different company

# ─── Lightweight Sentiment Lexicon ───────────────────────────────────────────
# Curated word lists covering financial/business news language
POSITIVE_WORDS = {
    "surge", "record", "beat", "praised", "innovative", "expand", "growth",
    "strong", "landmark", "profit", "gain", "rise", "boost", "success",
    "opportunity", "partnership", "leading", "outstanding", "recovery",
    "upgrade", "breakthrough", "promising", "confident", "solid", "soar",
    "winning", "advances", "improved", "lift", "positive", "higher", "best",
    "revenue", "earnings", "outperform", "rally", "reward", "flourish"
}

NEGATIVE_WORDS = {
    "lawsuit", "investigation", "fraud", "scandal", "decline", "drop", "crash",
    "fine", "penalty", "probe", "downturn", "slump", "weak", "loss", "sue",
    "sued", "court", "violation", "regulatory", "allegations", "whistleblower",
    "irregularities", "insider", "manipulation", "recession", "correction",
    "concerns", "issues", "plague", "antitrust", "subpoena", "indicted",
    "risk", "danger", "threat", "fails", "poor", "downgrade", "hard",
    "charges", "ban", "sanction", "misrepresentation", "deceptive", "falsified"
}

# ─── Keyword dictionaries for risk classification ─────────────────────────────
RISK_KEYWORDS = {
    "legal_risk": [
        "lawsuit", "litigation", "court", "sue", "sued", "legal action",
        "settlement", "class action", "injunction", "verdict", "subpoena",
        "indicted", "charges", "attorney general", "damages"
    ],
    "regulatory_risk": [
        "sec", "ftc", "fda", "regulatory", "investigation", "fine",
        "penalty", "compliance", "violation", "probe", "scrutiny",
        "audit", "sanction", "antitrust", "ban", "regulation"
    ],
    "sector_downturn": [
        "downturn", "decline", "slowdown", "recession", "contraction",
        "bearish", "sell-off", "slump", "drop", "crash", "correction",
        "weak demand", "headwinds", "market downturn", "industry decline"
    ],
    "fraud_risk": [
        "fraud", "scam", "embezzlement", "misrepresentation", "deceptive",
        "fake", "fictitious", "ponzi", "manipulation", "insider trading",
        "accounting irregularity", "whistleblower", "falsified", "misleading"
    ]
}

# ─── Realistic Sample Headlines ──────────────────────────────────────────────
def fetch_news_headlines(company: str) -> list[dict]:
    """
    Fetches news headlines for a company.
    Uses curated sample data for demonstration; in production, wire up
    a real news API (e.g. NewsAPI.org) by replacing this function body.
    """
    headlines = [
        {"title": f"{company} faces SEC investigation over financial disclosures",         "publishedAt": "2024-01-15"},
        {"title": f"{company} stock drops 8% amid weak demand and industry slowdown",       "publishedAt": "2024-01-14"},
        {"title": f"{company} CEO praised for innovative strategy, shares surge",           "publishedAt": "2024-01-13"},
        {"title": f"Class action lawsuit filed against {company} over alleged fraud",       "publishedAt": "2024-01-12"},
        {"title": f"{company} reports record revenue, beating analyst expectations",         "publishedAt": "2024-01-11"},
        {"title": f"FTC probe into {company}'s market practices raises antitrust concerns", "publishedAt": "2024-01-10"},
        {"title": f"{company} whistleblower claims accounting irregularities in Q3 report", "publishedAt": "2024-01-09"},
        {"title": f"Sector downturn hits {company} hard; analysts downgrade stock",         "publishedAt": "2024-01-08"},
        {"title": f"{company} expands globally with new product line launch",               "publishedAt": "2024-01-07"},
        {"title": f"Regulatory compliance issues plague {company} operations in Europe",    "publishedAt": "2024-01-06"},
        {"title": f"{company} insider trading allegations under investigation",             "publishedAt": "2024-01-05"},
        {"title": f"Strong earnings lift {company} as recession fears ease",               "publishedAt": "2024-01-04"},
        {"title": f"{company} settles court case for $50M, admits no wrongdoing",          "publishedAt": "2024-01-03"},
        {"title": f"Market correction weighs on {company} despite solid fundamentals",      "publishedAt": "2024-01-02"},
        {"title": f"{company} partners with tech giant in landmark deal",                   "publishedAt": "2024-01-01"},
    ]
    return headlines


# ─── Sentiment Analysis (lexicon-based, zero-dependency) ─────────────────────
def analyze_sentiment(headlines: list[dict]) -> dict:
    """
    Computes polarity score for each headline using a curated financial lexicon.
    Polarity ∈ [-1, +1]; subjectivity = fraction of sentiment-loaded words.
    """
    results = {}
    for item in headlines:
        title = item["title"]
        tokens = re.findall(r"\b\w+\b", title.lower())
        if not tokens:
            results[title] = {"polarity": 0.0, "subjectivity": 0.0, "label": "neutral", "published_at": item.get("publishedAt", "N/A")}
            continue

        pos_hits = sum(1 for t in tokens if t in POSITIVE_WORDS)
        neg_hits = sum(1 for t in tokens if t in NEGATIVE_WORDS)
        total_hits = pos_hits + neg_hits

        polarity    = round((pos_hits - neg_hits) / max(len(tokens), 1), 4)
        subjectivity = round(total_hits / max(len(tokens), 1), 4)

        if polarity >= 0.05:
            label = "positive"
        elif polarity <= -0.05:
            label = "negative"
        else:
            label = "neutral"

        results[title] = {
            "polarity": polarity,
            "subjectivity": subjectivity,
            "label": label,
            "published_at": item.get("publishedAt", "N/A")
        }
    return results


# ─── Risk Flag Generation ─────────────────────────────────────────────────────
def generate_risk_flags(headlines: list[dict], sentiment_scores: dict,
                        neg_threshold: float = 0.0) -> dict:
    """
    Generates structured risk flags by combining:
      1. Keyword matching (risk-specific terms in headline)
      2. Sentiment gating (polarity ≤ neg_threshold to avoid false positives)
    """
    risk_flags = {
        k: {"flagged": False, "triggered_by": [], "count": 0}
        for k in RISK_KEYWORDS
    }

    for item in headlines:
        title      = item["title"]
        title_lower = title.lower()
        polarity   = sentiment_scores.get(title, {}).get("polarity", 0)

        for risk_type, keywords in RISK_KEYWORDS.items():
            matched = [kw for kw in keywords if kw.lower() in title_lower]
            if matched and polarity <= neg_threshold:
                risk_flags[risk_type]["flagged"] = True
                risk_flags[risk_type]["triggered_by"].append({
                    "headline": title,
                    "keywords": matched,
                    "polarity": polarity
                })
                risk_flags[risk_type]["count"] += 1

    return risk_flags


# ─── Run Pipeline ─────────────────────────────────────────────────────────────
print(f"🔍 Analyzing news for: {SAMPLE_COMPANY}")

raw_articles    = fetch_news_headlines(SAMPLE_COMPANY)
news_headlines  = [a["title"] for a in raw_articles]   # ← output variable
sentiment_scores = analyze_sentiment(raw_articles)      # ← output variable
risk_flags       = generate_risk_flags(raw_articles, sentiment_scores)  # ← output variable

print(f"✅ Processed {len(news_headlines)} headlines\n")

# ─── Formatted Report ────────────────────────────────────────────────────────
print("=" * 62)
print(f"  📰  NEWS SENTIMENT & RISK INTELLIGENCE — {SAMPLE_COMPANY}")
print("=" * 62)

# Sentiment distribution
_labels = [v["label"] for v in sentiment_scores.values()]
_pos = _labels.count("positive")
_neg = _labels.count("negative")
_neu = _labels.count("neutral")
_avg = round(sum(v["polarity"] for v in sentiment_scores.values()) / len(sentiment_scores), 4)

print(f"\n📊 Sentiment Distribution  ({len(news_headlines)} headlines)")
print(f"   🟢 Positive : {_pos:>3}   🔴 Negative : {_neg:>3}   🟡 Neutral : {_neu:>3}")
print(f"   Average Polarity Score : {_avg:+.4f}")

print(f"\n🚨 Risk Flags")
print(f"   {'Risk Type':<22}  {'Status':<20}  Triggers")
print(f"   {'-'*22}  {'-'*20}  --------")
for rt, d in risk_flags.items():
    status = "⚠️  FLAGGED" if d["flagged"] else "✅  Clear  "
    print(f"   {rt:<22}  {status:<20}  {d['count']}")

print(f"\n📋 All Headlines")
for title, data in sentiment_scores.items():
    _icon = {"positive": "🟢", "negative": "🔴", "neutral": "🟡"}[data["label"]]
    print(f"   {_icon} [{data['polarity']:+.4f}]  {title}")

print(f"\n🔎 Risk Trigger Details")
_any_flag = False
for rt, d in risk_flags.items():
    if d["triggered_by"]:
        _any_flag = True
        print(f"\n  ⚠️  {rt.upper()}")
        for t in d["triggered_by"]:
            print(f"     • [{t['polarity']:+.4f}] {t['headline']}")
            print(f"       Keywords matched: {', '.join(t['keywords'])}")
if not _any_flag:
    print("   No risk triggers found.")
