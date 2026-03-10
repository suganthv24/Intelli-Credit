"""
Embedding Module
----------------
Generates dense vector embeddings for text chunks using sentence-transformers.
"""

from sentence_transformers import SentenceTransformer

MODEL_NAME = "all-MiniLM-L6-v2"
VECTOR_DIM = 384  # output dimension for this model

# Module-level model instance (lazy-loaded)
_model: SentenceTransformer | None = None


def _get_model() -> SentenceTransformer:
    """Return a lazily-initialised SentenceTransformer model."""
    global _model
    if _model is None:
        print(f"[Embedder] Loading model: {MODEL_NAME} …")
        _model = SentenceTransformer(MODEL_NAME)
    return _model


def embed_chunks(chunks: list[str]) -> list:
    """
    Generate embeddings for each text chunk.

    Parameters
    ----------
    chunks : list[str]
        Text chunks to embed.

    Returns
    -------
    list
        A list of embedding vectors (each a list of floats).
    """
    print(f"[Embedder] Generating embeddings for {len(chunks)} chunk(s) …")

    if not chunks:
        return []

    model = _get_model()
    embeddings = model.encode(chunks, show_progress_bar=False)

    # Convert numpy arrays to plain lists for Qdrant compatibility
    result = [emb.tolist() for emb in embeddings]

    print("[Embedder] Embeddings generated successfully")
    return result
