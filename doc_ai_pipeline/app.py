"""
Document AI Pipeline – FastAPI Server
--------------------------------------
Exposes the ingestion and query pipelines as HTTP endpoints.

Usage:
    python app.py
    # → Swagger UI available at http://localhost:8000/docs
"""

import os
import shutil
import tempfile
import asyncio
import hashlib

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ── App Setup ────────────────────────────────────────────────────────

app = FastAPI(
    title="Document AI Pipeline",
    description="Ingest documents via OCR and query them with semantic search.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response Models ────────────────────────────────────────

class QueryRequest(BaseModel):
    question: str = Field(..., min_length=1, description="Natural-language search query")
    limit: int = Field(default=5, ge=1, le=50, description="Max results to return")
    document_name: str | None = Field(default=None, description="Optional filename to strictly filter the search")


class QueryResult(BaseModel):
    text: str
    document_name: str
    score: float


class QueryResponse(BaseModel):
    query: str
    answer: str
    results: list[QueryResult]


class IngestResponse(BaseModel):
    message: str
    filename: str
    chunks_stored: int


class HealthResponse(BaseModel):
    status: str


class CAMResponse(BaseModel):
    corporate_applicant_id: str
    status: str
    cam_data: dict


# ── Endpoints ────────────────────────────────────────────────────────

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Simple health check."""
    return HealthResponse(status="ok")


@app.post("/ingest", response_model=IngestResponse)
async def ingest_document(file: UploadFile = File(...)):
    """
    Upload a document (PDF or image) and run the full ingestion pipeline.

    Supported formats: .pdf, .png, .jpg, .jpeg, .tiff, .bmp
    """
    # Validate file extension
    allowed_extensions = {".pdf", ".png", ".jpg", ".jpeg", ".tiff", ".bmp"}
    _, ext = os.path.splitext(file.filename or "")
    ext = ext.lower()

    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(sorted(allowed_extensions))}",
        )

    # Save uploaded file to a temp directory, preserving its original name and extension
    tmp_dir = tempfile.mkdtemp(prefix="doc_ai_")
    # file.filename contains the original name like "resume.pdf"
    safe_filename = file.filename if file.filename else f"upload{ext}"
    tmp_path = os.path.join(tmp_dir, os.path.basename(safe_filename))

    try:
        # Lazy imports to avoid startup overhead
        from ocr_engine import run_ocr
        from parser import extract_text
        from embedder import embed_chunks
        from vector_store import store_embeddings, check_duplicate, delete_document
        from pdf_slicer import slice_document

        content = await file.read()
        
        # Step 0 - Calculate SHA-256 for Semantic Caching
        file_hash = hashlib.sha256(content).hexdigest()
        
        duplicate_status = check_duplicate(file_hash, safe_filename)
        if duplicate_status == "EXACT_MATCH":
            return IngestResponse(
                message="Document already exists in the knowledge base (Exact Hash Match).",
                filename=safe_filename,
                chunks_stored=0,
            )
        elif duplicate_status == "UPDATE_NEEDED":
            print(f"[{safe_filename}] New version detected. Executing clean update...")
            delete_document(safe_filename)

        with open(tmp_path, "wb") as f:
            f.write(content)

        # Slice massive PDFs into 5-page safe micro-batches
        batch_paths = slice_document(tmp_path, tmp_dir)
        print(f"[{safe_filename}] Sliced into {len(batch_paths)} micro-batches for OCR.")

        # Semaphore limits concurrent API requests to Chandra to exactly 3
        semaphore = asyncio.Semaphore(3)

        async def process_batch(batch_path: str) -> int:
            """Process a single 5-page PDF chunk asynchronously."""
            async with semaphore:
                # Step 1 – OCR (run blocking I/O in thread pool)
                ocr_output = await asyncio.to_thread(run_ocr, batch_path)

                # Step 2 – Parse (Extract strict Markdown)
                text = extract_text(ocr_output)
                if not text.strip():
                    return 0

                # Step 3 – Direct 1-to-1 Embedding (NO ARBITRARY CHUNKING)
                # We embed the entire ~5-page Markdown block directly.
                embeddings = await asyncio.to_thread(embed_chunks, [text])

                # Step 4 – Store in Qdrant using the ORIGINAL filename and file hash
                await asyncio.to_thread(store_embeddings, [text], embeddings, safe_filename, file_hash)
                
                return 1 # We stored 1 massive chunk for this batch

        # Fire all batches simultaneously; the Semaphore automatically throttles them queue-style
        tasks = [process_batch(path) for path in batch_paths]
        results = await asyncio.gather(*tasks)
        
        total_chunks = sum(results)

        if total_chunks == 0:
            raise HTTPException(status_code=422, detail="No readable text extracted from the document.")

        return IngestResponse(
            message="Document pipeline completed. All batches processed.",
            filename=file.filename,
            chunks_stored=total_chunks,
        )

    except HTTPException:
        raise
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {e}")
    finally:
        # Clean up temp files
        shutil.rmtree(tmp_dir, ignore_errors=True)


@app.post("/query", response_model=QueryResponse)
async def query_documents(request: QueryRequest):
    """
    Search the knowledge base with a natural-language query.
    Returns the top matching document chunks with similarity scores.
    """
    try:
        from retriever import search_documents_with_scores
        from context_builder import build_context
        from llm_answer import generate_answer

        results = search_documents_with_scores(
            request.question, limit=request.limit, document_name=request.document_name
        )

        # Assemble context and ask LLM
        context = build_context(results)
        
        # If the DB is completely empty (no results), don't bother the LLM
        if not results:
            answer = "I don't have enough context in the uploaded documents to answer this."
        else:
            answer = "".join(generate_answer(context, request.question))

        return QueryResponse(
            query=request.question,
            answer=answer,
            results=[
                QueryResult(
                    text=res["text"],
                    document_name=res["document_name"],
                    score=round(res["score"], 4)
                )
                for res in results
            ],
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query failed: {e}")



# ── CAM Endpoint ─────────────────────────────────────────────────────

@app.post("/generate_cam/{corporate_applicant_id}", response_model=CAMResponse)
async def generate_cam(corporate_applicant_id: str):
    """
    Trigger the LangGraph Agentic CAM Workflow for a specific corporate applicant.

    The agent will:
    1. Plan which financial data points to extract (GST, Bank Credits, Litigation, etc.)
    2. Retrieve relevant Qdrant chunks tagged with the applicant ID.
    3. Grade whether the chunks are relevant.
    4. Extract structured financial data into a master Credit Appraisal JSON.
    5. Self-correct on failure (up to 3 retries per field) before marking as 'Not Found'.

    Returns the fully assembled Credit Appraisal Memo JSON.
    """
    try:
        from graph import cam_graph

        print(f"\n[CAM] Initiating Credit Appraisal Memo for applicant: {corporate_applicant_id}")

        # Build initial state (clean slate)
        initial_state = {
            "corporate_applicant_id": corporate_applicant_id,
            "current_extraction_goal": "",
            "retrieved_docs": [],
            "retry_count": 0,
            "grade": "",
            "final_master_json": {},
        }

        # Run the LangGraph — this blocks until the graph reaches END
        final_state = await asyncio.to_thread(cam_graph.invoke, initial_state)

        cam_data = final_state.get("final_master_json", {})
        print(f"[CAM] ✅ CAM generation completed. Fields: {list(cam_data.keys())}")

        return CAMResponse(
            corporate_applicant_id=corporate_applicant_id,
            status="success" if cam_data else "no_data",
            cam_data=cam_data,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CAM generation failed: {e}")


# ── Run ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    print("\n  Starting Document AI Pipeline API …")
    print("  Swagger UI → http://localhost:8000/docs\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)
