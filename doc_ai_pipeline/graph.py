"""
Graph Module — LangGraph Agentic CAM Workflow
----------------------------------------------
Assembles the four specialized nodes into a directed state graph with
automatic loop protection to prevent infinite retry cycles.

Graph Flow:
  START → planner_node → retriever_node → grader_node
                                          ↓ yes
                                     extractor_node → planner_node (loop)
                                          ↓ no (retry < 3)
                                     retriever_node (retry)
                                          ↓ no (retry >= 3)
                                  mark_not_found_node → planner_node
                                          ↓ goal == __COMPLETE__
                                        END

The compiled graph is exported as `cam_graph` for import in app.py.
"""

from langgraph.graph import StateGraph, END

from state import AgentState
from nodes import (
    planner_node,
    retriever_node,
    grader_node,
    extractor_node,
    mark_not_found_node,
)

# ── Max retries before forcing Not Found ─────────────────────────────
MAX_RETRIES = 3


# ── Conditional Edge: After Planner ──────────────────────────────────

def route_after_planner(state: AgentState) -> str:
    """
    Check if the planner has signalled completion or wants retrieval.
    """
    if state.get("current_extraction_goal") == "__COMPLETE__":
        return "done"
    return "retrieve"


# ── Conditional Edge: After Grader ───────────────────────────────────

def route_after_grader(state: AgentState) -> str:
    """
    Core loop protection logic:
    - grade == 'yes'           → extract
    - grade == 'no', retry ≤ MAX_RETRIES → retry retrieval
    - grade == 'no', retry > MAX_RETRIES → mark not found, continue
    """
    grade = state.get("grade", "no")
    retry = state.get("retry_count", 0)

    if grade == "yes":
        return "extract"
    elif retry > MAX_RETRIES:
        print(f"[Graph] Loop Guard triggered at retry={retry}. Routing to mark_not_found.")
        return "not_found"
    else:
        print(f"[Graph] Grade=no, retry={retry}/{MAX_RETRIES}. Retrying retriever.")
        return "retry"


# ── Build the Graph ───────────────────────────────────────────────────

def build_cam_graph() -> StateGraph:
    graph = StateGraph(AgentState)

    # ── Add Nodes ──────────────────────────────────────────────────
    graph.add_node("planner", planner_node)
    graph.add_node("retriever", retriever_node)
    graph.add_node("grader", grader_node)
    graph.add_node("extractor", extractor_node)
    graph.add_node("mark_not_found", mark_not_found_node)

    # ── Entry Point ────────────────────────────────────────────────
    graph.set_entry_point("planner")

    # ── Edges ──────────────────────────────────────────────────────

    # After planner: either route to retriever or terminate
    graph.add_conditional_edges(
        "planner",
        route_after_planner,
        {
            "retrieve": "retriever",
            "done": END,
        },
    )

    # Retriever always feeds into grader
    graph.add_edge("retriever", "grader")

    # After grader: extract, retry, or mark not found
    graph.add_conditional_edges(
        "grader",
        route_after_grader,
        {
            "extract": "extractor",
            "retry": "retriever",      # Retry with broader query
            "not_found": "mark_not_found",  # Loop guard
        },
    )

    # After extractor: always return to planner for next goal
    graph.add_edge("extractor", "planner")

    # After marking not found: return to planner for next goal
    graph.add_edge("mark_not_found", "planner")

    return graph


# ── Compile the Graph (exported for app.py) ───────────────────────────

_raw_graph = build_cam_graph()
cam_graph = _raw_graph.compile()

if __name__ == "__main__":
    print("[Graph] CAM graph compiled successfully.")
    print("[Graph] Nodes:", list(_raw_graph.nodes))
    print("[Graph] Edges:", list(_raw_graph.edges))
