import pandas as pd

def generate_features(data):

    financial = data.get("financial", {})

    debt = financial.get("debt", 0)
    equity = financial.get("equity", 1)
    debt_equity = debt / equity if equity else 0

    rev_curr = financial.get("revenue_current", 0)
    rev_prev = financial.get("revenue_previous", 1)
    revenue_growth = (rev_curr - rev_prev) / rev_prev if rev_prev else 0
    
    ebit = financial.get("ebit", 0)
    interest = financial.get("interest_expense", 1)
    interest_coverage = ebit / interest if interest else 0

    features = {
        "debt_equity": debt_equity,
        "revenue_growth": revenue_growth,
        "interest_coverage": interest_coverage
    }

    return features
