"""
Nodes Module — LangGraph Agentic CAM Workflow
----------------------------------------------
Each function here is a single node in the LangGraph state machine.
Every node receives the full AgentState dict and returns a PARTIAL
dict of only the keys it wants to update.

Nodes:
  planner_node   – Decides what data point to extract next.
  retriever_node – Fetches relevant Qdrant chunks for the current goal.
  grader_node    – Validates if retrieved docs actually answer the goal.
  extractor_node – Extracts structured data and merges into master JSON.
"""

import json
import re
from typing import Optional

from langchain_ollama import ChatOllama
from pydantic import BaseModel, Field

from state import AgentState

# ── LLM Configuration ────────────────────────────────────────────────
LLM = ChatOllama(model="deepseek-r1:8b", temperature=0)

# ── CAM Field Definitions ─────────────────────────────────────────────
# The ordered list of financial markers the planner will try to extract.
CAM_FIELDS = [
    "gst_revenue",
    "bank_statement_credits",
    "litigation_risks",
    "net_worth",
    "debt_to_equity_ratio",
]

CAM_GOAL_MAP = {
    "gst_revenue": "Extract the annual GST Revenue / turnover from GST returns. Return a single numeric value in INR Crores.",
    "bank_statement_credits": "Extract the total bank statement credits (inflows) from the banking data. Return total credits in INR Crores.",
    "litigation_risks": "Identify any legal disputes, court cases, NPA notices, NCLT filings, or litigation risks for the company.",
    "net_worth": "Extract the company's Net Worth (Total Assets - Total Liabilities) from the balance sheet. Return in INR Crores.",
    "debt_to_equity_ratio": "Calculate or extract the Debt-to-Equity Ratio from financial statements. Return as a decimal number.",
}


# ── Pydantic Models for Validated Extraction ──────────────────────────

class FinancialExtraction(BaseModel):
    """Generic structured output for a single extracted financial data point."""
    field_key: str = Field(description="The CAM field key, e.g., 'gst_revenue'")
    value: str = Field(description="The extracted value. Use 'Not Found' if data is absent.")
    confidence: str = Field(description="Confidence level: 'high', 'medium', or 'low'")
    source_snippet: Optional[str] = Field(
        default=None, description="A brief quote from the source doc supporting the extraction."
    )


# ── Helper: Strip <think> tags from DeepSeek R1 responses ───────────
def _clean_response(text: str) -> str:
    """Remove chain-of-thought <think>...</think> blocks from DeepSeek R1 output."""
    return re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()


# ══════════════════════════════════════════════════════════════════════
# NODE 1: PLANNER
# ══════════════════════════════════════════════════════════════════════

def planner_node(state: AgentState) -> dict:
    """
    Inspects the final_master_json and decides what to extract next.
    Sets current_extraction_goal to the first missing CAM field.
    Resets retry_count for the new goal.
    Returns an empty dict signal if all fields are populated (triggers END).
    """
    print("\n[Planner] Inspecting CAM progress…")
    master = state.get("final_master_json", {})

    for field_key in CAM_FIELDS:
        if field_key not in master:
            goal = CAM_GOAL_MAP[field_key]
            print(f"[Planner] Missing field: '{field_key}'. Setting goal: {goal[:60]}…")
            return {
                "current_extraction_goal": goal,
                "retrieved_docs": [],        # Clear previous docs for new goal
                "retry_count": 0,
                "grade": "",
                "_next_field_key": field_key, # Internal hint for extractor
            }

    print("[Planner] ✅ All CAM fields are populated! Routing to END.")
    return {"current_extraction_goal": "__COMPLETE__"}


# ══════════════════════════════════════════════════════════════════════
# NODE 2: RETRIEVER
# ══════════════════════════════════════════════════════════════════════

def retriever_node(state: AgentState) -> dict:
    """
    Takes current_extraction_goal and corporate_applicant_id.
    Calls existing semantic search on Qdrant.
    Appends results to retrieved_docs (operator.add handles accumulation).
    """
    from retriever import search_documents

    goal = state["current_extraction_goal"]
    applicant_id = state.get("corporate_applicant_id", "")
    retry = state.get("retry_count", 0)

    print(f"\n[Retriever] Attempt #{retry + 1} – Goal: {goal[:60]}…")
    print(f"[Retriever] Filtering by applicant: {applicant_id}")

    # Broaden query on retries by extracting key terms
    if retry == 0:
        query = goal
    elif retry == 1:
        # Simplify the search query on second attempt
        query = goal.split(".")[0]  # First sentence only
    else:
        # On third attempt, use just the applicant ID as a broad sweep
        query = f"{applicant_id} financial summary"

    results = search_documents(
        query=query,
        limit=5,
        document_name=applicant_id if applicant_id else None,
    )

    new_docs = [r["text"] for r in results]
    print(f"[Retriever] Retrieved {len(new_docs)} chunks.")

    return {
        "retrieved_docs": new_docs,          # operator.add will APPEND these
        "retry_count": state.get("retry_count", 0),
    }


# ══════════════════════════════════════════════════════════════════════
# NODE 3: GRADER
# ══════════════════════════════════════════════════════════════════════

def grader_node(state: AgentState) -> dict:
    """
    Asks the LLM: 'Do the retrieved docs contain data relevant to the goal?'
    Returns grade: 'yes' or 'no'.
    """
    goal = state["current_extraction_goal"]
    docs = state.get("retrieved_docs", [])
    retry = state.get("retry_count", 0)

    print(f"\n[Grader] Evaluating {len(docs)} doc(s) for relevance… (retry={retry})")

    if not docs:
        print("[Grader] No docs retrieved. Grade: no")
        return {"grade": "no", "retry_count": retry + 1}

    context = "\n\n---\n\n".join(docs[:3])  # Check top 3 docs only

    prompt = f"""You are a strict financial document relevance judge.

EXTRACTION GOAL: {goal}

RETRIEVED DOCUMENT CHUNKS:
{context}

TASK: Does ANY of the retrieved text above contain information that would help answer the extraction goal?

Respond with ONLY a single word — either "yes" or "no". Do not explain. Do not add punctuation."""

    response = LLM.invoke(prompt)
    raw = _clean_response(response.content).lower().strip().strip(".")
    grade = "yes" if "yes" in raw else "no"

    print(f"[Grader] Raw response: '{raw}' → Grade: {grade}")
    return {
        "grade": grade,
        "retry_count": retry + 1 if grade == "no" else retry,
    }


# ══════════════════════════════════════════════════════════════════════
# NODE 4: EXTRACTOR
# ══════════════════════════════════════════════════════════════════════

def extractor_node(state: AgentState) -> dict:
    """
    Given the retrieved_docs and the current_extraction_goal,
    asks the LLM to extract a validated, structured data point.
    Parses the response via Pydantic model and merges into final_master_json.
    """
    goal = state["current_extraction_goal"]
    docs = state.get("retrieved_docs", [])
    master = dict(state.get("final_master_json", {}))

    print(f"\n[Extractor] Extracting data for goal: {goal[:60]}…")

    context = "\n\n---\n\n".join(docs)

    # Determine the CAM field key from the goal mapping
    current_field = None
    for key, mapped_goal in CAM_GOAL_MAP.items():
        if mapped_goal == goal:
            current_field = key
            break

    if not current_field:
        # Fallback: check state hint
        current_field = state.get("_next_field_key", "unknown")

    prompt = f"""You are a precision financial data extractor for a Credit Appraisal Memo.

EXTRACTION GOAL: {goal}

SOURCE DOCUMENTS:
{context}

TASK: Extract the requested financial data from the source documents above.
Respond ONLY with a valid JSON object in this exact format:
{{
  "field_key": "{current_field}",
  "value": "<extracted value, or 'Not Found' if absent>",
  "confidence": "<high|medium|low>",
  "source_snippet": "<brief quote from docs supporting your answer, or null>"
}}

Do not include any explanation, markdown formatting, or text outside the JSON object."""

    response = LLM.invoke(prompt)
    cleaned = _clean_response(response.content)

    # Robustly parse the JSON from LLM output
    extracted = None
    try:
        # Extract JSON block if it's wrapped in markdown code fences
        json_match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if json_match:
            parsed = json.loads(json_match.group())
            extracted = FinancialExtraction(**parsed)
    except Exception as e:
        print(f"[Extractor] ⚠️ Failed to parse LLM response: {e}")
        print(f"[Extractor] Raw LLM output: {cleaned[:200]}")

    if extracted:
        print(f"[Extractor] ✅ Extracted '{current_field}': {extracted.value} (confidence: {extracted.confidence})")
        master[current_field] = {
            "value": extracted.value,
            "confidence": extracted.confidence,
            "source_snippet": extracted.source_snippet,
        }
    else:
        print(f"[Extractor] ⚠️ Could not parse extraction. Marking as Not Found.")
        master[current_field] = {"value": "Not Found", "confidence": "low", "source_snippet": None}

    return {
        "final_master_json": master,
        "retrieved_docs": [],   # Clear docs for next goal
        "grade": "",
    }


# ══════════════════════════════════════════════════════════════════════
# NODE 5: NOT FOUND MARKER (Loop Protection Terminal)
# ══════════════════════════════════════════════════════════════════════

def mark_not_found_node(state: AgentState) -> dict:
    """
    Called when retry_count > 3. Gracefully marks the current goal
    as 'Not Found' in the master JSON and resets state for the next goal.
    Prevents infinite loops.
    """
    goal = state["current_extraction_goal"]
    master = dict(state.get("final_master_json", {}))

    # Identify the field key from the goal
    current_field = None
    for key, mapped_goal in CAM_GOAL_MAP.items():
        if mapped_goal == goal:
            current_field = key
            break

    if not current_field:
        current_field = state.get("_next_field_key", "unknown")

    print(f"\n[LoopGuard] Max retries exceeded for '{current_field}'. Marking as Not Found.")
    master[current_field] = {"value": "Not Found", "confidence": "low", "source_snippet": None}

    return {
        "final_master_json": master,
        "retrieved_docs": [],
        "retry_count": 0,
        "grade": "",
    }
