import pandas as pd
from recommendation_engine.models.risk_model import train_risk_model, predict_risk, get_loan_decision
from recommendation_engine.models.loan_limit_model import train_limit_model, predict_limit
from recommendation_engine.models.interest_rate_model import train_interest_model, predict_interest
from recommendation_engine.models.fraud_detector import train_fraud_model, detect_fraud
from recommendation_engine.utils.synthetic_data import generate_synthetic_credit_data

def initialize_models():
    """
    Since we are not storing large .pkl files for the hackathon, we synthetically generate data
    and train the models in-memory extremely fast on start.
    """
    print("Initializing Models with 2000 synthetic records...")
    X, y_default, y_limit, y_rate = generate_synthetic_credit_data(n_samples=2000)
    
    risk_model = train_risk_model(X, y_default)
    limit_model = train_limit_model(X, y_limit)
    rate_model = train_interest_model(X, y_rate)
    fraud_model = train_fraud_model(X)
    
    return risk_model, limit_model, rate_model, fraud_model

def generate_recommendation(features_dict, models):
    """
    Takes a dict of features, evaluates them across 4 ML models, builds final JSON structure.
    """
    risk_model, limit_model, rate_model, fraud_model = models
    
    # Needs to match column structure expected by SKLearn/XGBoost during fit
    df = pd.DataFrame([features_dict], columns=[
        "debt_equity", "revenue_growth", "interest_coverage", "gst_bank_mismatch",
        "litigation_count", "negative_news_ratio", "promoter_risk_index",
        "factory_utilization", "inventory_turnover"
    ])
    
    # 1. Default Probability
    default_prob = predict_risk(risk_model, df)
    
    # 2. Decision Logic
    decision = get_loan_decision(default_prob)
    
    # 3. Predict limit (only makes business sense if not rigidly rejected, though we predict anyway)
    limit = predict_limit(limit_model, df)
    
    # 4. Predict interest
    rate = predict_interest(rate_model, df)
    
    # 5. Anomaly detection
    fraud_flag = detect_fraud(fraud_model, df)
    
    return {
        "loan_decision": decision,
        "risk_probability": round(default_prob, 3),
        "recommended_limit": round(limit, 2),
        "interest_rate": round(rate, 2),
        "fraud_flag": fraud_flag
    }
