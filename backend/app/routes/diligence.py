from fastapi import APIRouter

router = APIRouter()

@router.post("/due-diligence")
def submit_diligence(data: dict):

    notes = data.get("notes", "")

    return {
        "status": "saved",
        "notes": notes
    }
