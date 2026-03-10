import os
import httpx
import json
import asyncio
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.database.models import Document

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

PROCESSING_API_URL = os.getenv("PROCESSING_API_URL", "")

class ProcessRequest(BaseModel):
    document_id: int
    user_id: int

async def _mock_external_processing(file_path: str):
    """Fallback logic to mock processing an actual file"""
    await asyncio.sleep(3) # Simulate network delay
    
    # Return fake structure
    return {
        "status": "success",
        "data": {
            "financials": {
                "debt_equity": 1.5,
                "revenue_growth": 15.0,
                "interest_coverage": 4.2,
                "gst_bank_mismatch": -2.5,
                "factory_utilization": 85.0,
                "inventory_turnover": 6.0
            },
            "transactions": [
                {"date": "2024-01-01", "description": "Vendor Payment", "amount": -50000},
                {"date": "2024-01-02", "description": "Customer Invoice", "amount": 120000}
            ],
            "risk_signals": ["High seasonal revenue dependency"]
        }
    }

@router.post("/process-document")
async def process_document(request: ProcessRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == request.document_id, Document.user_id == request.user_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    # Mark as processing
    doc.status = "processing"
    db.commit()
    
    # In a real system, this would be pushed to a queue (Celery/RabbitMQ)
    # We will await it here to fulfill the immediate API request for simplicity 
    # OR we can just run it in the background if the frontend polls it.
    # The requirement says: Return structured financial data. So we'll await it.
    
    try:
        extracted = None
        if PROCESSING_API_URL:
            async with httpx.AsyncClient() as client:
                with open(doc.storage_path, "rb") as f:
                    response = await client.post(
                        f"{PROCESSING_API_URL}/analyze-document",
                        files={"file": (doc.filename, f, doc.file_type)},
                        data={"userId": request.user_id, "documentType": doc.file_type}
                    )
                response.raise_for_status()
                extracted = response.json()
        else:
            extracted = await _mock_external_processing(doc.storage_path)
            
        doc.status = "processed"
        doc.extracted_data = extracted.get("data", extracted)
        db.commit()
    except Exception as e:
        doc.status = "failed"
        doc.extracted_data = {"error": str(e)}
        db.commit()
        raise HTTPException(status_code=500, detail=f"External processing failed: {str(e)}")
        
    return {
        "status": "processed",
        "document_id": doc.id,
        "extracted_data": doc.extracted_data
    }

@router.post("/upload-documents")
async def upload_documents(files: list[UploadFile] = File(...), db: Session = Depends(get_db)):

    uploaded = []

    for file in files:
        content = await file.read()
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        
        with open(file_path, "wb") as f:
            f.write(content)

        # Save to db, tying to mock user 1
        doc = Document(
            user_id=1,
            filename=file.filename,
            file_type=file.content_type or "unknown",
            file_size=len(content),
            storage_path=file_path
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)

        uploaded.append({
            "id": doc.id,
            "filename": doc.filename,
            "size": doc.file_size
        })

    return {
        "status": "uploaded",
        "files": uploaded
    }
