"""
LLM Answer Generator Module
---------------------------
Sends the assembled context and the user's question to a local Ollama LLM
to generate a grounded, natural-language answer.

Includes:
- Ollama health check before sending prompts
- Retry logic for transient connection failures
- Configurable timeout for large model inference
"""

import time
import requests

import sys
import json
from typing import Iterator

OLLAMA_BASE = "http://localhost:11434"
OLLAMA_URL = f"{OLLAMA_BASE}/api/generate"
MODEL_NAME = "qwen2.5:0.5b"

# deepseek-r1:8b is a large local model — inference can take 2-3 minutes
TIMEOUT = 180  # seconds
MAX_RETRIES = 2
RETRY_DELAY = 3  # seconds between retries


def _check_ollama() -> bool:
    """Return True if the Ollama server is reachable."""
    try:
        r = requests.get(f"{OLLAMA_BASE}/api/tags", timeout=5)
        return r.status_code == 200
    except requests.exceptions.RequestException:
        return False


def _model_available() -> bool:
    """Return True if the configured model is pulled in Ollama."""
    try:
        r = requests.get(f"{OLLAMA_BASE}/api/tags", timeout=5)
        if r.status_code != 200:
            return False
        models = [m["name"] for m in r.json().get("models", [])]
        return MODEL_NAME in models
    except requests.exceptions.RequestException:
        return False


def generate_answer(context: str, question: str) -> Iterator[str]:
    """
    Generate an answer using a local Ollama model (streaming).

    Parameters
    ----------
    context : str
        The formatted document context.
    question : str
        The user's natural language question.

    Yields
    -------
    str
        The LLM's generated response tokens in real-time.
    """
    # ── Pre-flight checks ────────────────────────────────────────────
    if not _check_ollama():
        msg = (
            "Ollama is not running. Please start it with: ollama serve\n"
            "Then try your query again."
        )
        print(f"[LLM] {msg}")
        yield msg
        return

    if not _model_available():
        msg = (
            f"Model '{MODEL_NAME}' is not available in Ollama.\n"
            f"Pull it with: ollama pull {MODEL_NAME}"
        )
        print(f"[LLM] {msg}")
        yield msg
        return

    # ── Build prompt ─────────────────────────────────────────────────
    print(f"[LLM] Generating answer using {MODEL_NAME} via Ollama …")

    prompt = f"""You are a document assistant.

Answer the user's question using ONLY the provided context.
If the answer is not in the context, say "The document does not contain that information."
Be concise and direct.

Context:
{context}

Question:
{question}

Answer:"""

    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": True,
    }

    # ── Send with retries (Streaming) ────────────────────────────────
    last_error = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            print(f"[LLM] Attempt {attempt}/{MAX_RETRIES} (timeout={TIMEOUT}s) …")
            
            with requests.post(OLLAMA_URL, json=payload, timeout=TIMEOUT, stream=True) as response:
                response.raise_for_status()
                
                for line in response.iter_lines():
                    if line:
                        data = json.loads(line)
                        token = data.get("response", "")
                        if token:
                            yield token
                            
            print("\n[LLM] Streaming complete.")
            return

        except requests.exceptions.Timeout:
            last_error = f"Request timed out after {TIMEOUT}s (attempt {attempt})"
            print(f"\n[LLM] {last_error}")

        except requests.exceptions.HTTPError:
            error_body = response.text if response else "no response body"
            last_error = f"HTTP {response.status_code}: {error_body}"
            print(f"\n[LLM] {last_error}")
            if response.status_code < 500:
                yield f"\nLLM error: {last_error}"
                return

        except requests.exceptions.ConnectionError as e:
            last_error = f"Connection error: {e}"
            print(f"\n[LLM] {last_error}")

        except requests.exceptions.RequestException as e:
            last_error = f"Request error: {e}"
            print(f"\n[LLM] {last_error}")

        if attempt < MAX_RETRIES:
            print(f"[LLM] Retrying in {RETRY_DELAY}s …")
            time.sleep(RETRY_DELAY)

    yield f"\nFailed to get LLM response after {MAX_RETRIES} attempts. Last error: {last_error}"
