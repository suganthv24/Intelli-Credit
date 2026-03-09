import networkx as nx

def build_transaction_graph(transactions):
    """
    Builds a directed graph from the list of transactions.
    """
    G = nx.DiGraph()

    for t in transactions:
        from_node = t.get("from")
        to_node = t.get("to")
        amount = t.get("amount", 0)
        
        if from_node and to_node:
            G.add_edge(from_node, to_node, weight=amount)

    return G
