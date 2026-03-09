from sklearn.ensemble import GradientBoostingRegressor

def train_interest_model(X, y):
    """
    Trains a Gradient Boosting Regressor to accurately recommend interest rates.
    """
    model = GradientBoostingRegressor(
        n_estimators=150,
        learning_rate=0.05,
        random_state=42
    )
    model.fit(X, y)
    return model

def predict_interest(model, features_df):
    """
    Predicts appropriate lending interest margin.
    """
    rate = model.predict(features_df)[0]
    return float(rate)
