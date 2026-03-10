"""
State Module — LangGraph Agentic CAM Workflow
----------------------------------------------
Defines the shared, mutable memory (AgentState) that flows through
every node in the LangGraph Credit Appraisal Memo (CAM) graph.

Key design decisions:
- `retrieved_docs` uses Annotated[list, operator.add] so each node
  APPENDS to the list instead of overwriting it (fan-in safe).
- `final_master_json` is a plain dict — each extractor_node call
  merges keys into it progressively.
- `retry_count` is scoped per extraction goal and is reset by
  planner_node when it picks a new goal.
"""

import operator
from typing import Annotated, TypedDict


class AgentState(TypedDict):
    # ── Identity ─────────────────────────────────────────────────────
    corporate_applicant_id: str
    """The unique identifier for the corporate credit applicant.
    Used as a Qdrant metadata filter to isolate that company's documents."""

    # ── Planning ─────────────────────────────────────────────────────
    current_extraction_goal: str
    """The specific data point the agent is currently trying to extract.
    Examples: 'Extract GST Revenue', 'Extract Bank Statement Credits',
    'Identify Litigation Risks'.
    Set by the planner_node and consumed by retriever_node."""

    # ── Retrieval (Accumulative) ──────────────────────────────────────
    retrieved_docs: Annotated[list, operator.add]
    """The raw Markdown chunks fetched from Qdrant for the current goal.
    Uses operator.add so parallel or sequential retriever calls
    accumulate context instead of overwriting it."""

    # ── Grading ──────────────────────────────────────────────────────
    grade: str
    """Binary verdict from grader_node — 'yes' (docs are relevant)
    or 'no' (docs do not contain the target financial data)."""

    # ── Loop Guard ───────────────────────────────────────────────────
    retry_count: int
    """How many times the retriever has been retried for the current
    extraction goal. Forcefully routes to 'Not Found' if > 3."""

    # ── Output ───────────────────────────────────────────────────────
    final_master_json: dict
    """The progressively assembled Credit Appraisal Memo JSON.
    Keys are added as each extraction goal succeeds or is gracefully
    marked 'Not Found'."""
