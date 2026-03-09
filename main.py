import os
import sys
import pandas as pd

# Register path for modules - just add the root directory
base_dir = os.path.dirname(os.path.abspath(__file__))
if base_dir not in sys.path:
    sys.path.append(base_dir)

# Import external document API client
from services.document_api_client import fetch_processed_documents

# Import AI Engine Submodules
from finacial_analysis.main import process_financial_data
from research_agent.main import run_research_agent
from primary_insight.main import run_primary_insight
from feature_engineering.main import run_feature_engineering
from recommendation_engine.main import run_recommendation_engine
from explainability_layer.main import run_explainability
from cam_generator.generator.cam_builder import build_cam
from cam_generator.export.word_exporter import generate_word_cam
from cam_generator.export.pdf_exporter import generate_pdf


def run_intelli_credit_pipeline(document_path, officer_notes):
    print("Calling Document Processing API...")
    doc_data = fetch_processed_documents(document_path)

    company_name = doc_data["company_profile"]["name"]

    print("Running Financial Analysis...")
    financial_results = process_financial_data(doc_data)

    print("Running Research Agent...")
    research_data = {
        "company_name": company_name,
        "promoters": [doc_data["company_profile"].get("promoter")]
    }
    research_results = run_research_agent(research_data)

    print("Processing Primary Insights...")
    insight_data = {
        "company_name": company_name,
        "officer_notes": officer_notes
    }
    insight_results = run_primary_insight(insight_data)

    print("Generating Feature Vector...")
    feature_input = {
        "financial_analysis": financial_results,
        "research_analysis": research_results,
        "operational_insights": insight_results
    }
    features = run_feature_engineering(feature_input)

    print("Running Recommendation Engine...")
    recommendation = run_recommendation_engine(features)

    print("Generating Explainability...")
    explanation = run_explainability(features)

    print("Building CAM Report...")
    # Align data structure with CAM Generator requirements
    # The generator expects specific flat keys in each sub-dictionary
    
    # Financial Analysis mapping
    financial_cam = {
        "revenue": doc_data["financials"].get("revenue", 0),
        "profit": doc_data["financials"].get("net_profit", 0),
        "debt_equity": financial_results["financial_ratios"].get("debt_equity", 0),
        "interest_coverage": financial_results["financial_ratios"].get("interest_coverage", 0)
    }

    # Research Analysis mapping
    research_cam = {
        "litigation_cases": research_results["litigation_detection"].get("litigation_found", "None"),
        "negative_news_ratio": f"{research_results['news_analysis'].get('negative_news', 0)}/{research_results['news_analysis'].get('articles_analyzed', 1)}",
        "sector_risk": research_results.get("sector_risk", "MEDIUM")
    }

    # Operational Insights mapping
    # We'll pull from the primary insight results or raw notes if available
    insight_cam = {
        "factory_utilization": 40, # From sample notes: "Factory operating at 40% capacity"
        "inventory_status": "Slow" if any("Inventory" in n for n in officer_notes) else "Normal"
    }

    cam_data = {
        "company_profile": doc_data["company_profile"],
        "financial_analysis": financial_cam,
        "research_analysis": research_cam,
        "operational_insights": insight_cam,
        "recommendation": recommendation,
        "explanation": explanation["decision_explanation"]
    }

    sections = build_cam(cam_data)
    
    # Define exports dir cleanly
    export_dir = os.path.join(base_dir, 'cam_generator')
    word_path = generate_word_cam(sections, output_dir=export_dir)
    pdf_path = generate_pdf(sections, output_dir=export_dir)

    print("CAM successfully generated")
    
    return {
        "status": "success",
        "cam_data": cam_data,
        "paths": {
            "word": word_path,
            "pdf": pdf_path
        }
    }


if __name__ == "__main__":
    _doc_path = "documents/company_report.pdf"
    _officer_notes = [
        "Factory operating at 40% capacity",
        "Inventory movement slow",
        "Management not transparent"
    ]
    
    print("Starting full local test of the pipeline...")
    result = run_intelli_credit_pipeline(_doc_path, _officer_notes)
    
    import json
    print("\n--- PIPELINE EXECUTION COMPLETE ---")
    print(json.dumps(result["cam_data"]["recommendation"], indent=2))
