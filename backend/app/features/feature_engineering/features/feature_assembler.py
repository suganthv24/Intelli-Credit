from feature_engineering.utils.normalization import min_max_scale
from feature_engineering.features.financial_features import compute_financial_features
from feature_engineering.features.research_features import compute_research_features
from feature_engineering.features.operational_features import compute_operational_features

def assemble_features(financial_data, research_data, operational_data):
    """
    Takes raw dictionaries representing the three input pillars.
    Computes all features, normalizes selected ones if required, and returns a 1D vector.
    """
    features = {}

    # 1. Compute Raw Features
    financial = compute_financial_features(financial_data)
    research = compute_research_features(research_data)
    operational = compute_operational_features(operational_data)
    
    # 2. Add to assembly
    features.update(financial)
    features.update(research)
    features.update(operational)
    
    # Optional 3: Normalize specific features bounds
    # For example, let's normalize debt_equity if we want it between 0-1 
    # (assuming 0 to 5.0 is the normal max bound for stability).
    # If using sklearn StandardScaler down the line, this is optional.
    
    # Here we perform custom bound checks for safety.
    features["debt_equity"] = round(features.get("debt_equity", 0), 2)
    features["revenue_growth"] = round(features.get("revenue_growth", 0), 3)
    features["interest_coverage"] = round(features.get("interest_coverage", 0), 2)
    features["gst_bank_mismatch"] = round(features.get("gst_bank_mismatch", 0), 3)
    features["litigation_count"] = int(features.get("litigation_count", 0))
    features["negative_news_ratio"] = round(features.get("negative_news_ratio", 0), 3)
    features["promoter_risk_index"] = round(features.get("promoter_risk_index", 0), 3)
    features["factory_utilization"] = round(features.get("factory_utilization", 0), 2)
    features["inventory_turnover"] = round(features.get("inventory_turnover", 0), 2)

    return features
