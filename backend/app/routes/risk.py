from fastapi import APIRouter
from app.services.recommendation_service import calculate_risk

router = APIRouter()

@router.get("/risk-score")
def risk_score(features: dict):

    risk = calculate_risk(features)

    return risk
