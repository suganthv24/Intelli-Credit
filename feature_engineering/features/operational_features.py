def factory_utilization(capacity):
    """Normalize factory capacity utilization score."""
    if capacity is None:
        return 0.0
    return capacity / 100.0


def inventory_turnover(cogs, inventory):
    """Calculates inventory turnover based on COGS and average inventory."""
    if inventory == 0 or inventory is None:
        return 0.0
    return cogs / inventory


def compute_operational_features(operations_data):
    """Wrapper function to compute all operational features from the operations dictionary."""
    capacity = operations_data.get("capacity_utilization", 0)
    inventory = operations_data.get("inventory_value", 0)
    cogs = operations_data.get("cost_of_goods_sold", 0)

    computed = {
        "factory_utilization": factory_utilization(capacity),
        "inventory_turnover": inventory_turnover(cogs, inventory)
    }
    
    # Handle None
    for k, v in computed.items():
        if v is None:
            computed[k] = 0.0
            
    return computed
