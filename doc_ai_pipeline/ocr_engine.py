"""
OCR Engine Module
-----------------
Calls the Datalab Chandra OCR API to extract structured text from images or PDFs.
Uses the hosted API instead of downloading the model locally.
"""

import os
import time
import requests
import threading

# ── Configuration ────────────────────────────────────────────────────
DATALAB_API_KEY = os.environ.get(
    "DATALAB_API_KEY",
    "vftdjASX9wmQNSOMruK0pYxqX0krgVXQc1ZBD4kganQ",
)
DATALAB_API_URL = "https://www.datalab.to/api/v1/convert"
POLL_INTERVAL = 7  # seconds between status checks (must be > 6.2s limit)
MAX_POLL_TIME = 300  # max seconds to wait for result

# Rate Limiting configuration (10 requests per 60 seconds = 1 every 6s)
_RATE_LIMIT_LOCK = threading.Lock()
_LAST_REQUEST_TIME = 0.0
_MIN_TIME_BETWEEN_REQUESTS = 6.2


def run_ocr(file_path: str) -> dict:
    """
    Run Chandra OCR on the given file via the Datalab hosted API.

    Parameters
    ----------
    file_path : str
        Path to an image (.png, .jpg, .jpeg, .tiff, .bmp)
        or a PDF document (.pdf).

    Returns
    -------
    dict
        A dictionary with key ``"pages"`` containing OCR results.
        Each page entry holds ``"page"`` (1-indexed) and ``"markdown"``.
    """
    print(f"[OCR] Extracting text from: {file_path}")

    if not os.path.isfile(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    ext = os.path.splitext(file_path)[1].lower()
    allowed = {".pdf", ".png", ".jpg", ".jpeg", ".tiff", ".bmp"}
    if ext not in allowed:
        raise ValueError(f"Unsupported file type: {ext}")

    # ── Step 1: Submit the document ──────────────────────────────────
    headers = {"X-API-Key": DATALAB_API_KEY}

    import mimetypes
    content_type, _ = mimetypes.guess_type(file_path)
    if not content_type:
        # Default to PDF if we can't guess, as that's the most common document type
        if file_path.lower().endswith(".pdf"):
            content_type = "application/pdf"
        else:
            content_type = "application/octet-stream"

    global _LAST_REQUEST_TIME
    
    max_retries = 3
    resp = None
    
    for attempt in range(max_retries):
        with _RATE_LIMIT_LOCK:
            now = time.time()
            elapsed_since_last = now - _LAST_REQUEST_TIME
            if elapsed_since_last < _MIN_TIME_BETWEEN_REQUESTS:
                delay = _MIN_TIME_BETWEEN_REQUESTS - elapsed_since_last
                print(f"[OCR] Rate limit pacing (POST): waiting {delay:.1f}s ...")
                time.sleep(delay)
            _LAST_REQUEST_TIME = time.time()

        with open(file_path, "rb") as f:
            # Use explicit 3-tuple format: (filename, fileobj, content_type)
            files = {
                "file": (os.path.basename(file_path), f, content_type)
            }
            data = {
                "output_format": "markdown",
                "force_ocr": "true",
            }

            print(f"[OCR] Uploading to Datalab API (type: {content_type}) (Attempt {attempt+1}/{max_retries})…")
            resp = requests.post(DATALAB_API_URL, headers=headers, files=files, data=data)

        if resp.status_code == 429:
            print("[OCR] Warning: API returned 429 Too Many Requests. Retrying after 15s delay...")
            time.sleep(15)
            continue
        elif resp.status_code != 200:
            raise RuntimeError(
                f"Datalab API upload failed (HTTP {resp.status_code}): {resp.text}"
            )
            
        break
    else:
        raise RuntimeError("Datalab API upload failed after max retries due to persistent rate limiting.")

    result = resp.json()

    # ── Step 2: Poll for completion if async ─────────────────────────
    if result.get("status") == "complete":
        # Synchronous result
        markdown = result.get("markdown", result.get("output", ""))
        print(f"[OCR] Got immediate result – {len(markdown)} chars")
        return {"pages": [{"page": 1, "markdown": markdown}]}

    # Async: poll the check URL
    check_url = result.get("request_check_url")
    if not check_url:
        # If no check_url, try to use the result directly
        markdown = result.get("markdown", result.get("output", str(result)))
        return {"pages": [{"page": 1, "markdown": markdown}]}

    print(f"[OCR] Waiting for processing (polling every {POLL_INTERVAL}s) …")
    elapsed = 0
    while elapsed < MAX_POLL_TIME:
        time.sleep(POLL_INTERVAL)
        elapsed += POLL_INTERVAL

        # Apply Global Rate Limit Pacing to the GET request
        with _RATE_LIMIT_LOCK:
            now = time.time()
            elapsed_since_last = now - _LAST_REQUEST_TIME
            if elapsed_since_last < _MIN_TIME_BETWEEN_REQUESTS:
                delay = _MIN_TIME_BETWEEN_REQUESTS - elapsed_since_last
                print(f"[OCR] Rate limit pacing (GET): waiting {delay:.1f}s ...")
                time.sleep(delay)
            _LAST_REQUEST_TIME = time.time()

        poll_resp = requests.get(check_url, headers=headers)
        
        if poll_resp.status_code == 429:
            print("[OCR] Warning: Polled status hit 429 Too Many Requests. Backing off 15s...")
            time.sleep(15)
            elapsed += 15
            continue

        if poll_resp.status_code != 200:
            print(f"[OCR] Poll returned HTTP {poll_resp.status_code}, retrying …")
            continue

        poll_data = poll_resp.json()
        status = poll_data.get("status", "")

        if status == "complete":
            markdown = poll_data.get("markdown", poll_data.get("output", ""))
            pages_data = poll_data.get("pages")

            if pages_data and isinstance(pages_data, list):
                # Multi-page result
                pages = []
                for idx, page in enumerate(pages_data, start=1):
                    page_md = page.get("markdown", page.get("text", ""))
                    pages.append({"page": idx, "markdown": page_md})
                print(f"[OCR] Completed – {len(pages)} page(s)")
                return {"pages": pages}
            else:
                # Single result
                print(f"[OCR] Completed – {len(markdown)} chars")
                return {"pages": [{"page": 1, "markdown": markdown}]}

        elif status == "failed":
            error = poll_data.get("error", "Unknown error")
            raise RuntimeError(f"Datalab OCR failed: {error}")

        print(f"[OCR] Status: {status} ({elapsed}s elapsed) …")

    raise TimeoutError(f"Datalab OCR timed out after {MAX_POLL_TIME}s")
