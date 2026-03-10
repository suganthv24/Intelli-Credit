import os
import sys
import json
import warnings
import pandas as pd

from explainability_layer.shap_explainer import shap_explain, extract_key_drivers
from explainability_layer.lime_explainer import lime_explain
from explainability_layer.explanation_formatter import format_explanation, generate_narrative

# Imports from parallel recommendation engine
from recommendation_engine.utils.synthetic_data import generate_synthetic_credit_data
from recommendation_engine.models.risk_model import train_risk_model

warnings.filterwarnings("ignore")

def run_explainability(input_data):
    """
    Orchestrator for Explainability. 
    Requires booting the Risk Model to assess the mathematical weights.
    """
    # 1. Boot identical XGBoost reference architecture
    X_train, y_train, _, _ = generate_synthetic_credit_data(n_samples=1000)
    risk_model = train_risk_model(X_train, y_train)

    # Convert the dictionary exactly into DataFrame space matching the schema
    feature_cols = [
        "debt_equity", "revenue_growth", "interest_coverage", "gst_bank_mismatch",
        "litigation_count", "negative_news_ratio", "promoter_risk_index",
        "factory_utilization", "inventory_turnover"
    ]
    
    X_instance = pd.DataFrame([input_data], columns=feature_cols)

    # 2. Extract Logic Explanations
    
    # SHAP Generation
    shap_val_dict = shap_explain(risk_model, X_train, X_instance)
    top_shap_drivers = extract_key_drivers(shap_val_dict, top_n=6)
    
    # LIME Generation
    lime_val_list = lime_explain(risk_model, X_train, X_instance)
    # LIME translates bounds like `debt_equity > 1.33` mapped to float weights. 
    # For a unified output we'll map SHAP values to our human string generator.
    
    # 3. Format qualitative narrative
    risk_factors, positive_signals = format_explanation(top_shap_drivers)
    narrative_text = generate_narrative(risk_factors, positive_signals)

    return {
        "decision_explanation": {
            "risk_factors": risk_factors,
            "positive_signals": positive_signals,
            "lime_local_bounds": [f"{v[0]} (weight: {v[1]:.3f})" for v in lime_val_list],
            "narrative_text": narrative_text
        }
    }


if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    input_file = "data/input.json"
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
        
    input_path = os.path.join(base_dir, input_file)
    
    try:
        with open(input_path, 'r') as f:
            data = json.load(f)
            
        print("Starting Explainability Analysis...", file=sys.stderr)
        
        result = run_explainability(data)
        
        print("\n--- ML DECISION EXPLANATION ---", file=sys.stderr)
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        print(json.dumps({"error": f"Failed to run explainability engine: {str(e)}"}))
