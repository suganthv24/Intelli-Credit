"""
Retrieval Module
----------------
Performs semantic search over the stored document embeddings.
"""

from embedder import embed_chunks
from vector_store import get_client, COLLECTION_NAME
from qdrant_client import models


def search_documents(query: str, limit: int = 3, document_name: str | None = None) -> list[dict]:
    """
    Embed the *query* and retrieve the most relevant stored chunks.

    Parameters
    ----------
    query : str
        Natural-language search query.
    document_name : str | None
        Optional filename to strictly filter the semantic search to one document.

    Returns
    -------
    list[dict]
        A list of dictionaries with 'text' and 'document_name' keys.
    """
    print(f'[Retriever] Searching knowledge base for: "{query}"')

    # Embed the query (reuse the same model as ingestion)
    query_embedding = embed_chunks([query])[0]

    client = get_client()

    query_filter = None
    if document_name:
        query_filter = models.Filter(
            must=[models.FieldCondition(key="document_name", match=models.MatchValue(value=document_name))]
        )

    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_embedding,
        query_filter=query_filter,
        limit=limit,
    ).points

    retrieved: list[dict] = []
    for scored_point in results:
        text = scored_point.payload.get("text", "")
        doc_name = scored_point.payload.get("document_name", "Unknown")
        retrieved.append({"text": text, "document_name": doc_name})

    print(f"[Retriever] Found {len(retrieved)} result(s)")
    return retrieved


def search_documents_with_scores(query: str, limit: int = 3, document_name: str | None = None) -> list[dict]:
    """
    Embed the *query* and retrieve the most relevant stored chunks
    along with their similarity scores.

    Parameters
    ----------
    query : str
        Natural-language search query.
    document_name : str | None
        Optional filename to strictly filter the semantic search.

    Returns
    -------
    list[dict]
        A list of dictionaries containing 'text', 'score', and 'document_name'.
    """
    print(f'[Retriever] Searching (with scores) for: "{query}"')

    query_embedding = embed_chunks([query])[0]

    client = get_client()

    query_filter = None
    if document_name:
        query_filter = models.Filter(
            must=[models.FieldCondition(key="document_name", match=models.MatchValue(value=document_name))]
        )

    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_embedding,
        query_filter=query_filter,
        limit=limit,
    ).points

    retrieved: list[dict] = []
    for scored_point in results:
        text = scored_point.payload.get("text", "")
        doc_name = scored_point.payload.get("document_name", "Unknown")
        score = scored_point.score
        retrieved.append({"text": text, "score": score, "document_name": doc_name})

    print(f"[Retriever] Found {len(retrieved)} result(s)")
    return retrieved
