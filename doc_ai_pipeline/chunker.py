"""
Chunking Module
---------------
Splits text into overlapping fixed-size chunks for downstream embedding.
"""


def chunk_text(
    text: str,
    chunk_size: int = 500,
    overlap: int = 100,
) -> list[str]:
    """
    Split *text* into overlapping chunks.

    Parameters
    ----------
    text : str
        The full document text.
    chunk_size : int
        Maximum number of characters per chunk (default 500).
    overlap : int
        Number of characters shared between consecutive chunks (default 100).

    Returns
    -------
    list[str]
        A list of text chunks.
    """
    print("[Chunker] Creating chunks …")

    if not text:
        return []

    if chunk_size <= 0:
        raise ValueError("chunk_size must be positive")
    if overlap < 0:
        raise ValueError("overlap must be non-negative")
    if overlap >= chunk_size:
        raise ValueError("overlap must be smaller than chunk_size")

    chunks: list[str] = []
    start = 0
    text_len = len(text)

    while start < text_len:
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start += chunk_size - overlap

    print(f"[Chunker] Created {len(chunks)} chunk(s)")
    return chunks
