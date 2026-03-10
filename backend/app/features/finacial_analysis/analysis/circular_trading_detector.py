import networkx as nx
from finacial_analysis.utils.graph_utils import build_transaction_graph

def detect_circular_trades(transactions):
    """
    Detects circular trading cycles in a given set of transactions.
    """
    if not transactions:
        return {
            "detected": False,
            "cycles": []
        }
        
    G = build_transaction_graph(transactions)
    
    # NetworkX simple_cycles returns an iterator of cycles (lists of nodes)
    try:
        cycles = list(nx.simple_cycles(G))
    except Exception as e:
        cycles = []
        
    detected = len(cycles) > 0
    
    return {
        "detected": detected,
        "cycles": cycles
    }
