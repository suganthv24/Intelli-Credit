from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.database.models import Company, LoanApplication
import app.database.models
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

router = APIRouter()

class OnboardingRequest(BaseModel):
    # Company Info
    company_name: str
    cin: str
    pan: str
    sector: str
    sub_sector: str
    annual_turnover: float
    incorporation_date: str  # YYYY-MM-DD
    
    # Loan Details
    loan_type: str
    loan_amount: float
    tenure: int
    interest_rate: float
    purpose: str
    user_id: Optional[int] = 1

@router.post("/entity-onboarding")
def onboard_entity(data: OnboardingRequest, db: Session = Depends(get_db)):
    try:
        inc_date = datetime.strptime(data.incorporation_date, "%Y-%m-%d")
        
        # 1. Save or Update Company
        company = db.query(Company).filter(Company.pan == data.pan).first()
        if not company:
            company = Company(
                name=data.company_name,
                cin=data.cin,
                pan=data.pan,
                sector=data.sector,
                sub_sector=data.sub_sector,
                annual_turnover=data.annual_turnover,
                incorporation_date=inc_date
            )
            db.add(company)
            db.commit()
            db.refresh(company)
        else:
            # Update existing company record if needed
            company.sector = data.sector
            company.annual_turnover = data.annual_turnover
            db.commit()

        # Create new AnalysisSession
        session = app.database.models.AnalysisSession(user_id=data.user_id, status="pending")
        db.add(session)
        db.commit()
        db.refresh(session)

        # 2. Save Initial Loan Application
        loan = LoanApplication(
            company_id=company.id,
            session_id=session.id,
            loan_type=data.loan_type,
            loan_amount=data.loan_amount,
            tenure=data.tenure,
            interest_rate=data.interest_rate,
            purpose=data.purpose
        )
        db.add(loan)
        db.commit()
        db.refresh(loan)

        return {
            "status": "success",
            "message": "Entity onboarded successfully.",
            "company_id": company.id,
            "loan_application_id": loan.id
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Onboarding failed: {str(e)}")
