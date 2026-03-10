"""
Document AI Pipeline – CLI Entrypoint
--------------------------------------
Usage:
    python main.py ingest <document_path>
    python main.py query  "<search query>"
"""

import sys
import os
import tempfile
import shutil
import hashlib

from ocr_engine import run_ocr
from parser import extract_text
from pdf_slicer import slice_document
from embedder import embed_chunks
from vector_store import store_embeddings, check_duplicate, delete_document
from retriever import search_documents
from context_builder import build_context
from llm_answer import generate_answer


# ── Ingestion Pipeline ──────────────────────────────────────────────

def ingest(file_path: str) -> None:
    """Run the full ingestion pipeline on a single document."""
    print(f"\n{'='*60}")
    print(f"  Ingesting: {file_path}")
    print(f"{'='*60}\n")

    doc_name = os.path.basename(file_path)

    # Step 0 - Calculate SHA-256 for Semantic Caching
    try:
        with open(file_path, "rb") as f:
            content = f.read()
        file_hash = hashlib.sha256(content).hexdigest()
    except Exception as e:
        print(f"[Pipeline] Failed to read file for hashing: {e}")
        return

    duplicate_status = check_duplicate(file_hash, doc_name)
    if duplicate_status == "EXACT_MATCH":
        print(f"[Pipeline] Document '{doc_name}' already exists in the knowledge base (Exact Hash Match). Skipping ingestion.")
        return
    elif duplicate_status == "UPDATE_NEEDED":
        print(f"[{doc_name}] New version detected. Executing clean update...")
        delete_document(doc_name)

    tmp_dir = tempfile.mkdtemp(prefix="doc_ai_cli_")
    try:
        batch_paths = slice_document(file_path, tmp_dir)
        
        total_chunks = 0
        for i, batch_path in enumerate(batch_paths, start=1):
            print(f"[Pipeline] Processing batch {i}/{len(batch_paths)} ...")
            
            # Step 1 – OCR
            ocr_output = run_ocr(batch_path)

            # Step 2 – Parse / normalise extracting strict Markdown
            text = extract_text(ocr_output)
            if not text.strip():
                print(f"[Pipeline] No text extracted for batch {i} – skipping.")
                continue

            # Step 3 & 4 – Direct 1-to-1 Embedding & Qdrant Storage (NO ARBITRARY CHUNKING)
            embeddings = embed_chunks([text])
            store_embeddings([text], embeddings, doc_name, file_hash)
            total_chunks += 1
            
        print(f"\n[Pipeline] Successfully processed and stored {total_chunks} micro-batch chunks.")
    except Exception as e:
        print(f"[Pipeline] Ingestion failed: {e}")
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)

    print(f"\n{'='*60}")
    print("  Ingestion complete ✓")
    print(f"{'='*60}\n")


# ── Query Interface ─────────────────────────────────────────────────

def query(question: str, document_name: str | None = None, limit: int = 3) -> None:
    """Search the knowledge base and display results."""
    print(f"\n{'='*60}")
    print(f"  Query: {question}")
    if document_name:
        print(f"  Filter: {document_name}")
    print(f"{'='*60}\n")

    chunks = search_documents(question, limit=limit, document_name=document_name)

    if not chunks:
        print("[Pipeline] No matching results found.")
        return

    # Assemble context and generate answer
    context = build_context(chunks)
    
    print("\nAnswer:\n")
    # Stream the answer as it generates
    for token in generate_answer(context, question):
        print(token, end="", flush=True)
    print() # newline after streaming finishes
    
    print("\nSources:")
    for idx, chunk in enumerate(chunks, start=1):
        text = chunk.get("text", "")
        doc = chunk.get("document_name", "Unknown")
        # Truncate source snippet for concise display
        snippet = text.replace("\n", " ").strip()
        snippet = snippet[:100] + "..." if len(snippet) > 100 else snippet
        print(f"{idx}. [{doc}] \"{snippet}\"")

    print(f"\n{'='*60}\n")


# ── CLI ──────────────────────────────────────────────────────────────

def main() -> None:
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)

    command = sys.argv[1].lower()

    if command == "ingest":
        file_path = sys.argv[2]
        ingest(file_path)
    elif command == "query":
        question = sys.argv[2]
        doc_name = sys.argv[3] if len(sys.argv) > 3 else None
        query(question, document_name=doc_name)
    else:
        print(f"Unknown command: {command}")
        print(__doc__)
        sys.exit(1)


if __name__ == "__main__":
    main()
