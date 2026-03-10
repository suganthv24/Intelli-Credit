import os
import sys

# Ensure the 'backend' and 'features' directories are in the Python path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
features_dir = os.path.join(backend_dir, "app", "features")

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if features_dir not in sys.path:
    sys.path.insert(0, features_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import upload, analysis, risk, diligence, cam, user
from app.database.db import engine
from app.database.models import Base

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Intelli-Credit API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(analysis.router)
app.include_router(risk.router)
app.include_router(diligence.router)
app.include_router(cam.router)
app.include_router(user.router)

@app.get("/")
def root():
    return {"message": "Intelli-Credit API running"}

if __name__ == "__main__":
    import uvicorn
    # When run directly, start the uvicorn server
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
