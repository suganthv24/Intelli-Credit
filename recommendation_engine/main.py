import sys
import os
import json
import warnings
from recommendation_engine.inference.recommendation_pipeline import initialize_models, generate_recommendation

# Suppress warnings that might muddy the JSON output
warnings.filterwarnings("ignore")

def run_recommendation_engine(input_data):
    """
    Orchestrates the model pipeline natively from the feature engineering array input.
    """
    # 1. Initialize ML Pipeline Architecture In-Memory
    models = initialize_models()
    
    # 2. Extract input features dict 
    # (Assuming input_data IS the feature dict based on typical pipeline architecture)
    
    # 3. Generate predictions
    result = generate_recommendation(input_data, models)
    
    return result

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    input_file = "data/input.json"
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
        
    input_path = os.path.join(base_dir, input_file)
    
    try:
        with open(input_path, 'r') as f:
            data = json.load(f)
            
        print("Starting Inference ML Engine...", file=sys.stderr)
        result = run_recommendation_engine(data)
        print("\n--- ML DECISION OUTPUT ---", file=sys.stderr)
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        print(json.dumps({"error": f"Failed to run recommendation engine: {str(e)}"}))
