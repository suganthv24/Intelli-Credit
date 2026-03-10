from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.services.cam_service import generate_pdf, generate_docx
from app.database.db import get_db
from app.database.models import CAMReport
from io import BytesIO

router = APIRouter()

@router.post("/generate-cam")
def generate(data: dict, format: str = "pdf", db: Session = Depends(get_db)):
    
    try:
        report_path = ""
        if format == "pdf":
            buffer = generate_pdf(data)
            media_type = "application/pdf"
            filename = "report.pdf"
            report_path = "reports/report.pdf"
        elif format == "word":
            buffer = generate_docx(data)
            media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            filename = "report.docx"
            report_path = "reports/report.docx"
        else:
            raise HTTPException(status_code=400, detail="Invalid format requested")
            
        buffer.seek(0)
        
        # Link to most recent session for Mock User 1
        from app.database.models import AnalysisSession
        last_session = db.query(AnalysisSession).filter(AnalysisSession.user_id == 1).order_by(AnalysisSession.id.desc()).first()
        
        # Save reference to DB
        report = CAMReport(company_id=1, session_id=last_session.id if last_session else None, file_path=report_path)
        db.add(report)
        db.commit()
        
        return StreamingResponse(
            buffer, 
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Failed to generate report")
