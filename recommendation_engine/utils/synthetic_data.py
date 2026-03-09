import numpy as np
import pandas as pd
from sklearn.datasets import make_classification, make_regression

def generate_synthetic_credit_data(n_samples=1000, random_state=42):
    """
    Generates synthetic training dataset mimicking the 9 features provided by the feature engineering layer.
    Features: 
    0: debt_equity (0 to 5)
    1: revenue_growth (-0.5 to 1.5)
    2: interest_coverage (0 to 10)
    3: gst_bank_mismatch (0 to 0.5)
    4: litigation_count (0 to 10)
    5: negative_news_ratio (0 to 1)
    6: promoter_risk_index (0 to 1)
    7: factory_utilization (0 to 1)
    8: inventory_turnover (0 to 10)
    """
    np.random.seed(random_state)
    
    # We use make_classification to generate realistic clusters of data
    X, y_default = make_classification(
        n_samples=n_samples,
        n_features=9,
        n_informative=7,
        n_redundant=1,
        n_classes=2,
        flip_y=0.05,
        random_state=random_state
    )

    # Scale the synthetic features roughly into our expected bounds
    X[:, 0] = np.abs(X[:, 0]) * 1.5           # debt_equity
    X[:, 1] = X[:, 1] * 0.2                   # revenue_growth
    X[:, 2] = np.abs(X[:, 2]) * 2 + 1         # interest_coverage
    X[:, 3] = np.abs(X[:, 3]) * 0.1           # gst_bank_mismatch
    X[:, 4] = np.abs(np.round(X[:, 4] * 2))   # litigation_count
    X[:, 5] = np.clip(np.abs(X[:, 5]) * 0.3, 0, 1) # negative_news_ratio
    X[:, 6] = np.clip(np.abs(X[:, 6]) * 0.3, 0, 1) # promoter_risk_index
    X[:, 7] = np.clip(np.abs(X[:, 7]) * 0.2 + 0.4, 0, 1) # factory_utilization
    X[:, 8] = np.abs(X[:, 8]) * 2 + 1         # inventory_turnover
    
    # 1. Feature vectors
    X_df = pd.DataFrame(X, columns=[
        "debt_equity", "revenue_growth", "interest_coverage", "gst_bank_mismatch",
        "litigation_count", "negative_news_ratio", "promoter_risk_index",
        "factory_utilization", "inventory_turnover"
    ])
    
    # 2. Risk Targets (0 or 1 for Default)
    # 3. Loan Limit targets (Inverse to Risk: healthy companies get bigger loan limits, bounded 0 to 100M)
    base_limit = 50000000
    y_limit = base_limit - (y_default * 40000000) + (np.random.normal(0, 5000000, n_samples))
    y_limit = np.clip(y_limit, 1000000, 100000000)
    
    # 4. Interest Rate targets (Proportional to risk: risky companies get higher rates, 8% to 18%)
    y_rate = 8.5 + (y_default * 6) + (np.random.normal(0, 1, n_samples))
    y_rate = np.clip(y_rate, 7.0, 24.0)
    
    return X_df, pd.Series(y_default), pd.Series(y_limit), pd.Series(y_rate)
