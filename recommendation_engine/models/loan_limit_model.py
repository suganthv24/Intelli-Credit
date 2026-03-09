from sklearn.ensemble import RandomForestRegressor

def train_limit_model(X, y):
    """
    Trains a Random Forest Regressor to predict loan exposure limits.
    """
    model = RandomForestRegressor(
        n_estimators=200,
        max_depth=10,
        random_state=42
    )
    model.fit(X, y)
    return model

def predict_limit(model, features_df):
    """
    Predicts the optimal loan limit bounds.
    """
    limit = model.predict(features_df)[0]
    return float(limit)
