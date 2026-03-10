from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.services.feature_service import generate_features
from app.services.recommendation_service import run_recommendation, generate_financial_analysis, generate_explanation
from app.database.db import get_db
from app.database.models import AnalysisSession, LoanApplication, FinancialFeatures

router = APIRouter()

@router.post("/run-analysis")
def run_analysis(data: dict, db: Session = Depends(get_db)):

    features = generate_features(data)

    recommendation = run_recommendation(features)
    financial_analysis = generate_financial_analysis(features, data)
    explanation = generate_explanation(features, recommendation["risk_probability"])
    
    fraud_status = "WARNING" if recommendation["risk_probability"] > 0.8 else "CLEAN"

    # Create session
    session_record = AnalysisSession(user_id=1, status="completed")
    db.add(session_record)
    db.commit()
    db.refresh(session_record)

    # Save features
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
    
    # Save loan recommendation
    loan = LoanApplication(
        company_id=1,
        session_id=session_record.id,
        risk_probability=recommendation["risk_probability"],
        loan_decision=recommendation["loan_decision"],
        recommended_limit=recommendation["recommended_limit"],
        interest_rate=recommendation["interest_rate"],
    )
    db.add(loan)
    db.commit()
    
    # Align payload
    recommendation["fraud_flag"] = bool(recommendation["risk_probability"] > 0.8)

    fraud_status = "WARNING" if recommendation["fraud_flag"] else "CLEAN"

    research_agent = {
        "news_summary": "Recent positive momentum in domestic tech infrastructure investments suggests a stable growth forecast for the sector.",
        "sector_risk": "Moderate",
        "litigation_cases": features.get("litigation_count", 0)
    }

    return {
        "session_id": session_record.id,
        "features": features,
        "recommendation": recommendation,
        "financial_analysis": financial_analysis,
        "explanation": explanation,
        "fraud_status": fraud_status,
        "research_agent": research_agent
    }
