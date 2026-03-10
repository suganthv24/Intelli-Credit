from xgboost import XGBClassifier

def train_risk_model(X, y):
    """
    Trains an XGBoost Classifier on historical (or synthetic) data.
    """
    model = XGBClassifier(
        n_estimators=200,
        max_depth=4,
        learning_rate=0.05,
        verbosity=0,
        random_state=42
    )

    model.fit(X, y)
    return model

def predict_risk(model, features_df):
    """
    Predicts the probability of default.
    Returns the predicted probability of class 1.
    """
    prob = model.predict_proba(features_df)[0][1]
    return float(prob)

def get_loan_decision(default_prob):
    """
    Dynamic rule-based engine determining initial lending stance based on probability.
    """
    if default_prob < 0.35:
        return "APPROVED"
    elif default_prob < 0.65:
        return "REVIEW"
    else:
        return "REJECTED"
