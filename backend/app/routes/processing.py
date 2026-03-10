from fastapi import APIRouter
import time
import asyncio

router = APIRouter()

@router.post("/classify-documents")
async def classify_documents(data: dict):
    """
    Mock endpoint simulating ML Document Classification.
    Accepts a list of filenames and returns predicted document types and confidences.
    """
    await asyncio.sleep(1.5) # Simulate processing
    filenames = data.get("filenames", [])
    
    classifications = []
    
    for fname in filenames:
        name_lower = fname.lower()
        doc_type = "Unknown"
        confidence = 0.50
        
        if "alm" in name_lower or "asset" in name_lower:
            doc_type = "ALM (Asset Liability Management)"
            confidence = 0.94
        elif "shareholding" in name_lower or "pattern" in name_lower:
            doc_type = "Shareholding Pattern"
            confidence = 0.98
        elif "borrowing" in name_lower or "profile" in name_lower:
            doc_type = "Borrowing Profile"
            confidence = 0.91
        elif "annual" in name_lower or "report" in name_lower:
            doc_type = "Annual Report"
            confidence = 0.96
        elif "portfolio" in name_lower or "cut" in name_lower:
            doc_type = "Portfolio Cuts"
            confidence = 0.92
        else:
            doc_type = "General Financial Statement"
            confidence = 0.85
            
        classifications.append({
            "filename": fname,
            "detected_type": doc_type,
            "confidence": confidence
        })
        
    return {"classifications": classifications}

@router.post("/extract-schema")
async def extract_schema(data: dict):
    """
    Simulates the Schema Mapping extraction phase. 
    Returns raw tables identified inside the PDF for the user to map.
    """
    await asyncio.sleep(1.0)
    
    return {
        "extracted_tables": [
            { "id": "t1", "raw_field": "Total Sales", "suggested_schema": "Revenue", "value": "50,000,000" },
            { "id": "t2", "raw_field": "Profit Before Tax", "suggested_schema": "EBIT", "value": "8,500,000" },
            { "id": "t3", "raw_field": "Short_Term_Debt", "suggested_schema": "Total Debt", "value": "12,000,000" },
            { "id": "t4", "raw_field": "Shareholders_Funds", "suggested_schema": "Equity", "value": "8,000,000" },
        ]
    }
