import pandas as pd
from xgboost import XGBClassifier

# Dummy model for initialization since we don't have a trained one
model = XGBClassifier()
# Fast mock fit to not error out on predict_proba
model.fit(pd.DataFrame([{"debt_equity":0, "revenue_growth":0, "interest_coverage":0}, {"debt_equity":1, "revenue_growth":1, "interest_coverage":1}]), [0, 1])

def run_recommendation(features):

    df = pd.DataFrame([features])

    prob = model.predict_proba(df)[0][1]

    decision = "APPROVED" if prob < 0.3 else "REVIEW" if prob < 0.6 else "REJECTED"
    
    # Mock limits and rates based on probability
    limit = 50000000 if prob < 0.1 else 25000000 if prob < 0.3 else 5000000 if prob < 0.6 else 0
    rate = 8.5 if prob < 0.1 else 10.5 if prob < 0.3 else 14.0 if prob < 0.6 else 0

    return {
        "risk_probability": float(prob),
        "loan_decision": decision,
        "recommended_limit": limit,
        "interest_rate": rate
    }

def generate_financial_analysis(features, data):
    # Mock data generation based on inputs
    current_rev = data.get("financial", {}).get("revenue_current", 50000000)
    prev_rev = data.get("financial", {}).get("revenue_previous", 42000000)
    
    return {
        "revenue": [prev_rev * 0.8, prev_rev * 0.9, prev_rev, current_rev],
        "labels": ["Q1", "Q2", "Q3", "Q4"],
        "gst_sales": current_rev * 3.5,
        "bank_deposits": current_rev * 3.4
    }

def generate_explanation(features, prob):
    factors = []
    signals = []
    
    if features.get("debt_equity", 0) > 2.0:
        factors.append("High leverage ratio compared to industry peers")
    else:
        signals.append("Healthy debt-to-equity ratio")
        
    if features.get("revenue_growth", 0) > 0.1:
        signals.append("Strong positive revenue growth")
    elif features.get("revenue_growth", 0) < 0:
        factors.append("Declining revenue trend")
        
    if features.get("interest_coverage", 0) < 2.0:
        factors.append("Low interest coverage ratio, potential liquidity risk")
    else:
        signals.append("Strong interest coverage, ample liquidity")

    if not factors and prob > 0.5:
        factors.append("General sector risk elevated")
    if not signals and prob < 0.5:
        signals.append("Consistent operational performance")

    return {
        "risk_factors": factors,
        "positive_signals": signals
    }

def calculate_risk(features):
    # Returns just the risk calculation
    return run_recommendation(features)

