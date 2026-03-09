import sys
import json
import os

from finacial_analysis.analysis.ratio_engine import calculate_ratios
from finacial_analysis.analysis.gst_bank_validator import validate_gst_vs_bank
from finacial_analysis.analysis.circular_trading_detector import detect_circular_trades
from finacial_analysis.analysis.risk_scorer import calculate_risk_score

def process_financial_data(data):
    """
    Main pipeline for running the financial analysis model.
    """
    financials = data.get("financials", {})
    transactions = data.get("transactions", [])
    
    # Run analysis steps
    ratios = calculate_ratios(financials)
    gst_check = validate_gst_vs_bank(financials)
    circular_check = detect_circular_trades(transactions)
    
    # Calculate Risk Score
    risk_assessment = calculate_risk_score(ratios, gst_check, circular_check)
    
    # Construct final output JSON
    output = {
        "financial_ratios": ratios,
        "gst_bank_check": gst_check,
        "circular_trading": circular_check,
        "risk_score": risk_assessment["score"],
        "risk_level": risk_assessment["level"]
    }
    return output

if __name__ == "__main__":
    # If a file path is provided as the first argument, use it. Otherwise use sample data.
    input_file = "data/extracted_financials.json"
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    # Add project root to path for standalone testing
    root_dir = os.path.abspath(os.path.join(base_dir, ".."))
    if root_dir not in sys.path:
        sys.path.append(root_dir)
        
    input_path = os.path.join(base_dir, input_file)
    
    try:
        with open(input_path, 'r') as f:
            data = json.load(f)
            
        result = process_financial_data(data)
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
