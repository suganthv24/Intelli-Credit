import pandas as pd

def calculate_ratios(financials):
    """
    Calculate core financial ratios using Pandas for data processing.
    Metrics: Debt to Equity, Profit Margin, Interest Coverage,
    Cash Flow Stability, and Working Capital Turnover.
    """
    # Convert incoming dict into a pandas DataFrame (1 row)
    df = pd.DataFrame([financials])

    # Ensure required columns exist
    required_cols = [
        "total_debt", "equity", "net_profit", "revenue",
        "ebit", "interest_expense", "operating_cash_flow", "working_capital"
    ]
    for col in required_cols:
        if col not in df.columns:
            df[col] = 0

    # Initialize ratios to none
    df["debt_equity"] = None
    df["profit_margin"] = None
    df["interest_coverage"] = None
    df["cash_flow_stability"] = None
    df["working_capital_turnover"] = None

    # Calculate ratios using pandas operations, avoiding division by zero
    mask_equity = df["equity"] != 0
    df.loc[mask_equity, "debt_equity"] = round(df["total_debt"] / df["equity"], 2)

    mask_revenue = df["revenue"] != 0
    df.loc[mask_revenue, "profit_margin"] = round(df["net_profit"] / df["revenue"], 2)

    mask_interest = df["interest_expense"] != 0
    df.loc[mask_interest, "interest_coverage"] = round(df["ebit"] / df["interest_expense"], 2)

    df.loc[mask_revenue, "cash_flow_stability"] = round(df["operating_cash_flow"] / df["revenue"], 2)

    mask_wc = df["working_capital"] != 0
    df.loc[mask_wc, "working_capital_turnover"] = round(df["revenue"] / df["working_capital"], 2)

    # Extract the first row as a dictionary
    result_cols = ["debt_equity", "profit_margin", "interest_coverage", "cash_flow_stability", "working_capital_turnover"]
    result_dict = df[result_cols].iloc[0].to_dict()

    # Convert pandas NaN to Python None for JSON encoding
    for k, v in result_dict.items():
        if pd.isna(v):
            result_dict[k] = None

    return result_dict
