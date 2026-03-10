from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.database.models import AnalysisSession, Document, FinancialFeatures, LoanApplication

router = APIRouter()

@router.get("/documents")
def get_documents(user_id: int = 1, db: Session = Depends(get_db)):
    docs = db.query(Document).filter(Document.user_id == user_id).order_by(Document.upload_date.desc()).all()
    return [{
        "id": d.id, 
        "filename": d.filename, 
        "size": d.file_size,
        "status": d.status,
    } for d in docs]

@router.get("/dashboard-data")
def get_dashboard_data(user_id: int = 1, db: Session = Depends(get_db)):
    # Get latest session
    session = db.query(AnalysisSession).filter(AnalysisSession.user_id == user_id).order_by(AnalysisSession.created_at.desc()).first()
    
    # Get user documents and find the latest processed one for extraction data
    docs = db.query(Document).filter(Document.user_id == user_id).order_by(Document.upload_date.desc()).all()
    documents_list = [{
        "id": d.id, 
        "filename": d.filename, 
        "size": d.file_size,
        "status": d.status
    } for d in docs]
    
    latest_processed = next((d for d in docs if d.status == "processed" and d.extracted_data), None)
    external_data = latest_processed.extracted_data if latest_processed else None
    
    if not session and not external_data:
        return {"status": "no_data", "documents": documents_list, "analysisData": None}
        
    features = db.query(FinancialFeatures).filter(FinancialFeatures.session_id == session.id).first() if session else None
    loan = db.query(LoanApplication).filter(LoanApplication.session_id == session.id).first() if session else None
    
    # Merge existing DB features with new External API extracted data
    
    # Fallback to zeros if features haven't been run through /run-analysis yet
    f_debt = features.debt_equity if features else 0
    f_rev = features.revenue_growth if features else 0
    
    # Override with external data if available
    if external_data and "financials" in external_data:
        f_debt = external_data["financials"].get("debt_equity", f_debt)
        f_rev = external_data["financials"].get("revenue_growth", f_rev)
    
    # Create merged response
    analysis_data = {
        "session_id": session.id if session else None,
        "features": {
            "debt_equity": f_debt,
            "revenue_growth": f_rev,
            "interest_coverage": external_data["financials"].get("interest_coverage", features.interest_coverage if features else 0) if external_data else (features.interest_coverage if features else 0),
            "gst_bank_mismatch": external_data["financials"].get("gst_bank_mismatch", features.gst_bank_mismatch if features else 0) if external_data else (features.gst_bank_mismatch if features else 0),
            "litigation_count": features.litigation_count if features else 0,
            "negative_news_ratio": features.negative_news_ratio if features else 0,
            "factory_utilization": external_data["financials"].get("factory_utilization", features.factory_utilization if features else 0) if external_data else (features.factory_utilization if features else 0),
            "inventory_turnover": external_data["financials"].get("inventory_turnover", features.inventory_turnover if features else 0) if external_data else (features.inventory_turnover if features else 0),
        },
        "recommendation": {
            "risk_probability": loan.risk_probability if loan else 0.5,
            "loan_decision": loan.loan_decision if loan else "PENDING",
            "recommended_limit": loan.recommended_limit if loan else 0,
            "interest_rate": loan.interest_rate if loan else 0,
        },
        "financial_analysis": {
            "revenue_trend": [
                {"period": "Q1", "revenue": 100},
                {"period": "Q2", "revenue": 100 * (1 + f_rev/100)}
            ],
            "gst_variance": "Positive" if (external_data["financials"].get("gst_bank_mismatch", 0) if external_data else 0) <= 0 else "Negative",
            "transactions": external_data.get("transactions", []) if external_data else []
        },
        "explanation": {
            "risk_factors": external_data.get("risk_signals", []) if external_data else (["High debt utilization"] if f_debt > 2 else []),
            "positive_signals": ["Strong revenue growth"] if f_rev > 10 else []
        },
        "fraud_status": "WARNING" if (loan and loan.risk_probability > 0.8) else "CLEAN"
    }

    return {
        "status": "success",
        "documents": documents_list,
        "analysisData": analysis_data
    }
