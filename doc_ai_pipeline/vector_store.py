"""
Vector Store Module
-------------------
Manages a Qdrant collection for storing and querying document embeddings.
"""

from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    PointStruct,
    VectorParams,
    Filter,
    FieldCondition,
    MatchValue,
)
import uuid

COLLECTION_NAME = "documents"
VECTOR_DIM = 384  # must match embedder output

# In-memory Qdrant instance (no external server needed for prototyping)
_client: QdrantClient | None = None


def get_client() -> QdrantClient:
    """Return a lazily-initialised Qdrant client."""
    global _client
    if _client is None:
        print("[VectorDB] Initializing Qdrant (persistent storage) …")
        # Store vector DB files in a local folder
        _client = QdrantClient(path="qdrant_storage")
    return _client


def _ensure_collection(client: QdrantClient) -> None:
    """Create the collection if it doesn't already exist."""
    collections = [c.name for c in client.get_collections().collections]
    if COLLECTION_NAME not in collections:
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(
                size=VECTOR_DIM,
                distance=Distance.COSINE,
            ),
        )
        print(f"[VectorDB] Created collection '{COLLECTION_NAME}'")

def check_duplicate(file_hash: str, document_name: str) -> str:
    """
    Check if a document already exists or needs updating based on its hash.
    
    Returns:
        "EXACT_MATCH": The exact file (same hash) already exists. Safe to skip.
        "UPDATE_NEEDED": The document name exists, but the hash is different (version update).
        "NEW_DOCUMENT": The document name does not exist.
    """
    client = get_client()
    try:
        _ensure_collection(client)
        
        # Check if the exact hash exists
        hash_filter = Filter(must=[FieldCondition(key="file_hash", match=MatchValue(value=file_hash))])
        hash_results = client.scroll(collection_name=COLLECTION_NAME, scroll_filter=hash_filter, limit=1)[0]
        if hash_results:
            return "EXACT_MATCH"
            
        # If hash doesn't exist, check if the document name exists (meaning it's an outdated version)
        name_filter = Filter(must=[FieldCondition(key="document_name", match=MatchValue(value=document_name))])
        name_results = client.scroll(collection_name=COLLECTION_NAME, scroll_filter=name_filter, limit=1)[0]
        if name_results:
            return "UPDATE_NEEDED"
            
        return "NEW_DOCUMENT"
    except Exception as e:
        print(f"[VectorDB] Warning during duplicate check: {e}")
        return "NEW_DOCUMENT"

def delete_document(document_name: str) -> None:
    """Delete all chunks associated with a specific document name."""
    print(f"[VectorDB] Deleting outdated chunks for '{document_name}' …")
    client = get_client()
    try:
        client.delete(
            collection_name=COLLECTION_NAME,
            points_selector=Filter(
                must=[FieldCondition(key="document_name", match=MatchValue(value=document_name))]
            ),
        )
        print(f"[VectorDB] Successfully swept old chunks for '{document_name}'")
    except Exception as e:
        print(f"[VectorDB] Error deleting document: {e}")


def store_embeddings(chunks: list[str], embeddings: list, document_name: str, file_hash: str) -> None:
    """
    Store text chunks and their embeddings in the Qdrant collection.

    Parameters
    ----------
    chunks : list[str]
        The original text chunks.
    embeddings : list
        Corresponding embedding vectors.
    document_name : str
        The filename or identifier of the source document.
    """
    print(f"[VectorDB] Storing {len(chunks)} vector(s) for '{document_name}' …")

    if len(chunks) != len(embeddings):
        raise ValueError("chunks and embeddings must have the same length")

    client = get_client()
    _ensure_collection(client)

    points = [
        PointStruct(
            id=str(uuid.uuid4()),
            vector=emb,
            payload={
                "text": chunk, 
                "document_name": document_name,
                "file_hash": file_hash
            },
        )
        for idx, (chunk, emb) in enumerate(zip(chunks, embeddings))
    ]

    client.upsert(collection_name=COLLECTION_NAME, points=points)
    print("[VectorDB] Vectors stored successfully")
