def format_explanation(shap_top_features):
    """
    Parse SHAP (or LIME) top weights into Positive and Negative real-world signals.
    """
    positive_signals = []
    risk_factors = []

    # Format human readable dictionary mappings
    feature_naming = {
        "debt_equity": "Debt-to-Equity Ratio",
        "revenue_growth": "Revenue Growth",
        "interest_coverage": "Interest Coverage Matrix",
        "gst_bank_mismatch": "GST vs. Bank Statement Consistency",
        "litigation_count": "Promoter Litigation History",
        "negative_news_ratio": "External Sector News Sentiment",
        "promoter_risk_index": "Promoter Risk Index",
        "factory_utilization": "Factory Capacity Utilization",
        "inventory_turnover": "Inventory Turnover Speeds"
    }

    for feature_name, value in shap_top_features:
        readable_name = feature_naming.get(feature_name, feature_name)
        
        # In our context: We are explaining Default Probability (Class 1)
        # So positive SHAP values (value > 0) INCREASE default probability (RISK FACTOR)
        # Negative SHAP values (value < 0) DECREASE default probability (POSITIVE SIGNAL)
        if value > 0:
            risk_factors.append(readable_name)
        else:
            positive_signals.append(readable_name)

    return risk_factors, positive_signals

def generate_narrative(risk_factors, positive_signals):
    """
    Generates a raw string block representing an LLM-like answer natively.
    """
    text = "Model Validation Narrative Context:\n\n"
    
    if risk_factors:
        text += "Primary Risk Drivers (pulling model towards Default):\n"
        for factor in risk_factors:
            text += f" - {factor}\n"
        text += "\n"
        
    if positive_signals:
        text += "Positive Indicators (pulling model towards Approval):\n"
        for signal in positive_signals:
            text += f" + {signal}\n"

    return text.strip()
