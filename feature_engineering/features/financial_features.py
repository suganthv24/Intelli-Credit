def debt_equity_ratio(debt, equity):
    """Calculates the ratio of total debt to total equity."""
    if equity == 0 or equity is None:
        return None
    return debt / equity


def revenue_growth(current, previous):
    """Calculates the proportional increase/decrease in revenue."""
    if previous == 0 or previous is None:
        return None
    return (current - previous) / previous


def interest_coverage(ebit, interest):
    """Calculates how easily a company can pay interest on its outstanding debt."""
    if interest == 0 or interest is None:
        return None
    return ebit / interest


def gst_bank_mismatch(gst, bank):
    """Calculates the discrepancy between GST reported sales and actual bank deposits."""
    if gst == 0 or gst is None:
        return None
    return abs(gst - bank) / gst


def compute_financial_features(financials_data):
    """Wrapper function to compute all financial features from the financial dictionary."""
    debt = financials_data.get("total_debt", 0)
    equity = financials_data.get("equity", 0)
    rev_curr = financials_data.get("revenue_current", 0)
    rev_prev = financials_data.get("revenue_previous", 0)
    ebit = financials_data.get("ebit", 0)
    interest = financials_data.get("interest_expense", 0)
    gst = financials_data.get("gst_sales", 0)
    bank = financials_data.get("bank_deposits", 0)

    computed = {
        "debt_equity": debt_equity_ratio(debt, equity),
        "revenue_growth": revenue_growth(rev_curr, rev_prev),
        "interest_coverage": interest_coverage(ebit, interest),
        "gst_bank_mismatch": gst_bank_mismatch(gst, bank)
    }

    # Handle Nones by setting them to 0.0 or a default for ML
    for k, v in computed.items():
        if v is None:
            computed[k] = 0.0
            
    return computed
