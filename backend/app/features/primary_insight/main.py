import sys
import os
import json

from primary_insight.nlp.insight_analyzer import analyze_all_notes
from primary_insight.risk.insight_risk_scorer import score_insights

def run_primary_insight(data):
    """
    Main orchestration function for the Primary Insight module.
    """
    company_name = data.get("company_name", "Unknown Company")
    officer_notes = data.get("officer_notes", [])
    
    # 1. Analyze the qualitative notes
    analyzed_notes = analyze_all_notes(officer_notes)
    
    # 2. Score the insights and get the risk adjustment
    insight_results = score_insights(analyzed_notes)
    
    # 3. Format Output
    output = {
        "company": company_name,
        "primary_insight_analysis": {
            "insight_score_adjustment": insight_results.get("insight_score_adjustment", 0),
            "category": insight_results.get("category", "NEUTRAL"),
            "summary": insight_results.get("summary", ""),
            "detailed_notes": insight_results.get("detailed_notes", [])
        }
    }
    
    return output

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    # Add project root to path for standalone testing
    root_dir = os.path.abspath(os.path.join(base_dir, ".."))
    if root_dir not in sys.path:
        sys.path.append(root_dir)
        
    input_file = "data/input.json"
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
        
    input_path = os.path.join(base_dir, input_file)
    
    try:
        with open(input_path, 'r') as f:
            data = json.load(f)
            
        result = run_primary_insight(data)
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
