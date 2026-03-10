from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.database.models import CAMReport
from io import BytesIO
import os

from cam_generator.generator.cam_builder import build_cam
from cam_generator.export.word_exporter import generate_word_cam
from cam_generator.export.pdf_exporter import generate_pdf

router = APIRouter()

@router.post("/generate-cam")
def generate(data: dict, format: str = "pdf", db: Session = Depends(get_db)):
    
    try:
        # Build document sections dynamically based on the input payload
        sections = build_cam(data)
        
        output_dir = "reports"
        os.makedirs(output_dir, exist_ok=True)
        
        if format == "pdf":
            file_path = generate_pdf(sections, output_dir=output_dir)
            media_type = "application/pdf"
            filename = "CAM_Report.pdf"
        elif format == "word":
            file_path = generate_word_cam(sections, output_dir=output_dir)
            media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            filename = "Credit_Appraisal_Memo.docx"
        else:
            raise HTTPException(status_code=400, detail="Invalid format requested")
            
        # Link to most recent session for Mock User 1
        from app.database.models import AnalysisSession
        last_session = db.query(AnalysisSession).filter(AnalysisSession.user_id == 1).order_by(AnalysisSession.id.desc()).first()
        
        # Save reference to DB
        report = CAMReport(company_id=1, session_id=last_session.id if last_session else None, file_path=file_path)
        db.add(report)
        db.commit()
        
        return FileResponse(
            path=file_path,
            media_type=media_type,
            filename=filename
        )
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Failed to generate report")
