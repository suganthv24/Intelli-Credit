import shap
import pandas as pd

def shap_explain(model, X_train, X_instance):
    """
    Given a fitted XGBoost model, the background training data, and a single instance (DataFrame),
    computes the SHAP values explaining the model's output in the marginal feature space.
    """
    # Initialize the TreeExplainer suitable for XGBoost/RandomForest
    explainer = shap.TreeExplainer(model)
    
    # Calculate SHAP values for the single instance
    shap_values = explainer.shap_values(X_instance)
    
    # shap_values could be a list (if multi-class) or an array
    # Since we are predicting Default Probability (Class 1), we want the SHAP values influencing class 1
    if isinstance(shap_values, list):
        # binary classification usually provides list of length 2 [class 0, class 1]
        instance_shap = shap_values[1][0]
    else:
        # direct array
        instance_shap = shap_values[0]

    # Map features to their SHAP values
    explanation = dict(zip(X_instance.columns, instance_shap))
    
    return explanation

def extract_key_drivers(shap_values_dict, top_n=5):
    """
    Sorts the SHAP values dynamically and extracts the most mathematically impactful ones 
    to convert into qualitative string indicators.
    """
    sorted_features = sorted(
        shap_values_dict.items(),
        key=lambda x: abs(x[1]),
        reverse=True
    )
    
    return sorted_features[:top_n]
