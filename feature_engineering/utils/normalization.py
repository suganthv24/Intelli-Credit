def min_max_scale(value, min_val, max_val):
    """
    Manually scale a value between 0 and 1, assuming min_val and max_val bounds.
    If bounds are equal, returns 0.0.
    """
    if value is None:
        return 0.0
    if max_val == min_val:
        return 0.0
    
    # Bound the value within the min/max limits to prevent > 1 or < 0
    val = max(min_val, min(value, max_val))
    
    return (val - min_val) / (max_val - min_val)
