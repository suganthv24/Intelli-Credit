"""
Text Parser Module
------------------
Extracts and normalises raw text from the structured OCR output.
"""

import re


def _extract_text_from_result(ocr_result) -> str:
    """
    Safely pull plain text from a single page's OCR result.

    Handles several possible output shapes from ChandraOCR:
      - str  → use directly
      - dict → look for common keys like "text", "full_text", "content"
      - list → join element strings
    """
    if ocr_result is None:
        return ""

    # Already a plain string
    if isinstance(ocr_result, str):
        return ocr_result

    # Dict with a text key
    if isinstance(ocr_result, dict):
        for key in ("text", "full_text", "content", "raw_text"):
            if key in ocr_result:
                return str(ocr_result[key])
        # If dict has a 'lines' or 'words' list, join them
        for key in ("lines", "words"):
            if key in ocr_result and isinstance(ocr_result[key], list):
                return " ".join(str(item) for item in ocr_result[key])
        # Last resort: stringify everything
        return str(ocr_result)

    # List of text segments
    if isinstance(ocr_result, list):
        parts: list[str] = []
        for item in ocr_result:
            if isinstance(item, dict):
                parts.append(
                    item.get("text", item.get("content", str(item)))
                )
            else:
                parts.append(str(item))
        return " ".join(parts)

    return str(ocr_result)


def _normalise(text: str) -> str:
    """Collapse whitespace and strip leading/trailing blanks."""
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def extract_text(ocr_output: dict) -> str:
    """
    Extract and normalise plain text from the full OCR output dictionary.

    Parameters
    ----------
    ocr_output : dict
        Output from ``ocr_engine.run_ocr()``.

    Returns
    -------
    str
        Normalised plain-text content of the document.
    """
    print("[Parser] Normalizing text …")

    if not isinstance(ocr_output, dict):
        return ""

    pages = ocr_output.get("pages", [])
    if not pages:
        return ""

    page_texts: list[str] = []
    for page in pages:
        # Chandra returns structured output with 'markdown' key
        raw = page.get("markdown", "")
        if not raw:
            # Fallback: try legacy 'ocr_result' key
            raw = page.get("ocr_result", "")
        page_text = _extract_text_from_result(raw)
        if page_text:
            page_texts.append(page_text)

    full_text = "\n".join(page_texts)
    return _normalise(full_text)
