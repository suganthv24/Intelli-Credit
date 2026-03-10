"""
Context Builder Module
----------------------
Combines retrieved document chunks into a single context block
that can be passed to the LLM.
"""

def build_context(chunks: list[dict]) -> str:
    """
    Combine document chunks into a single context string.
    
    Parameters
    ----------
    chunks : list[dict]
        List of chunk dictionaries containing 'text' and 'document_name'.
        
    Returns
    -------
    str
        A formatted context block string.
    """
    print("[ContextBuilder] Assembling context from retrieved chunks …")
    
    # Restrict to ~1200 characters to avoid exceeding context windows
    # if using smaller models, while preserving whole paragraphs.
    context_text = ""
    for chunk in chunks:
        text = chunk.get("text", "")
        doc_name = chunk.get("document_name", "Unknown")
        
        formatted_chunk = f"[Source: {doc_name}] {text}"
        
        if len(context_text) + len(formatted_chunk) > 1200:
            break
        context_text += f"{formatted_chunk}\n\n"
        
    return context_text.strip()
