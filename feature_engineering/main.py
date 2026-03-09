import os
import sys
import json
from feature_engineering.features.feature_assembler import assemble_features

def run_feature_engineering(input_data):
    """
    Main orchestration function for the Feature Engineering module.
    Expects input_data to have 'financials', 'research', and 'operations' keys.
    """
    financials = input_data.get("financials", {})
    research = input_data.get("research", {})
    operations = input_data.get("operations", {})

    vector = assemble_features(financials, research, operations)
    return vector

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    input_file = "data/input.json"
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
        
    input_path = os.path.join(base_dir, input_file)
    
    try:
        with open(input_path, 'r') as f:
            data = json.load(f)
            
        result = run_feature_engineering(data)
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        print(json.dumps({"error": f"Failed to engineer features: {str(e)}"}))
