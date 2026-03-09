from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from main import run_intelli_credit_pipeline

app = FastAPI(
    title="Intelli-Credit AI Pipeline API",
    description="Backend microservice handling the Credit Decision ML orchestration.",
    version="1.0.0"
)

class PipelineRequest(BaseModel):
    document_path: str = "documents/company_report.pdf"
    officer_notes: List[str] = [
        "Factory operating at 40% capacity",
        "Inventory movement slow",
        "Management not transparent"
    ]

@app.post("/run-pipeline")
def run_pipeline(request: PipelineRequest):
    try:
        result = run_intelli_credit_pipeline(
            document_path=request.document_path,
            officer_notes=request.officer_notes
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline Error: {str(e)}")

@app.get("/health")
def check_health():
    return {"status": "ok", "service": "Intelli-Credit ML Pipeline"}
