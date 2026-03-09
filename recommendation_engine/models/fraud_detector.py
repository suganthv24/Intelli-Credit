from sklearn.ensemble import IsolationForest

def train_fraud_model(X):
    """
    Trains an Isolation Forest model to detect statistical outliers without needing target labels.
    """
    model = IsolationForest(
        contamination=0.05,
        n_estimators=200,
        random_state=42
    )

    # Note: Fits on the distribution.
    model.fit(X)

    return model

def detect_fraud(model, features_df):
    """
    Returns True if an anomaly is detected, False otherwise.
    (Isolation Forest returns -1 for anomaly, 1 for normal)
    """
    prediction = model.predict(features_df)
    return bool(prediction[0] == -1)
