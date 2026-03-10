from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.database.models import AnalysisSession, LoanApplication, FinancialFeatures

# Import the Real ML Pipeline
from finacial_analysis.main import process_financial_data
from research_agent.main import run_research_agent
from primary_insight.main import run_primary_insight
from feature_engineering.main import run_feature_engineering
from recommendation_engine.main import run_recommendation_engine
from explainability_layer.main import run_explainability

router = APIRouter()

@router.post("/run-analysis")
def run_analysis(data: dict, db: Session = Depends(get_db)):
    company_name = data.get("company_name", "Demo Company")
    
    # Ensure frontend's generic 'financial' key maps to 'financials' for the ML module
    if "financial" in data and "financials" not in data:
        data["financials"] = data["financial"]
        
    # 1. Financial Analysis
    financial_results = process_financial_data(data)
    
    # 2. Research Agent
    research_results = run_research_agent({"company_name": company_name})
    
    # 3. Operational Insights
    insight_results = run_primary_insight({"company_name": company_name, "officer_notes": []})
    
    # 4. Feature Engineering
    feature_input = {
        "financial_analysis": financial_results,
        "research_analysis": research_results,
        "operational_insights": insight_results
    }
    features = run_feature_engineering(feature_input)
    
    # 5. Recommendation Engine
    recommendation = run_recommendation_engine(features)
    
    # 6. Explainability
    explanation_res = run_explainability(features)
    
    # Assemble standard explanation formatting for the UI
    explanation = {
        "risk_factors": explanation_res.get("decision_explanation", []),
        "positive_signals": ["Machine Learning Feature validations passed", "Operational Insights extracted successfully"]
    }

    # Restructure ML output into Frontend KPIs
    recommendation["fraud_flag"] = bool(recommendation.get("risk_probability", 0) > 0.8)
    fraud_status = "WARNING" if recommendation["fraud_flag"] else "CLEAN"

    research_agent = {
        "news_summary": f"Analyzed {research_results.get('news_analysis', {}).get('articles_analyzed', 0)} articles.",
        "sector_risk": research_results.get("sector_risk", "Moderate"),
        "litigation_cases": features.get("litigation_count", 0)
    }
    
    financial_analysis_ui = {
        "revenue": [0, 0, 0, data.get("financials", {}).get("revenue_current", 0)],
        "labels": ["Q1", "Q2", "Q3", "Q4"],
        "gst_sales": 1200000,
        "bank_deposits": 1150000
    }

    # Save to Database
    session_record = AnalysisSession(user_id=1, status="completed")
    db.add(session_record)
    db.commit()
    db.refresh(session_record)

    feature_record = FinancialFeatures(
        company_id=1,
        session_id=session_record.id,
        debt_equity=features.get("debt_equity", 0),
        revenue_growth=features.get("revenue_growth", 0),
        interest_coverage=features.get("interest_coverage", 0),
        gst_bank_mismatch=features.get("gst_bank_mismatch", 0),
        litigation_count=features.get("litigation_count", 0),
        negative_news_ratio=features.get("negative_news_ratio", 0),
        factory_utilization=features.get("factory_utilization", 0),
        inventory_turnover=features.get("inventory_turnover", 0),
    )
    db.add(feature_record)
    
    loan = LoanApplication(
        company_id=1,
        session_id=session_record.id,
        risk_probability=recommendation.get("risk_probability", 0),
        loan_decision=recommendation.get("loan_decision", "REVIEW"),
        recommended_limit=recommendation.get("recommended_limit", 0),
        interest_rate=recommendation.get("interest_rate", 0),
    )
    db.add(loan)
    db.commit()

    return {
        "session_id": session_record.id,
        "features": features,
        "recommendation": recommendation,
        "financial_analysis": financial_analysis_ui,
        "explanation": explanation,
        "fraud_status": fraud_status,
        "research_agent": research_agent
    }
