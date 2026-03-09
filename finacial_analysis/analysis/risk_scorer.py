def calculate_risk_score(ratios, gst_check, circular_check):
    """
    Calculates an aggregated risk score and level based on the various analysis signals.
    """
    score = 0
    
    # Financial ratio checks
    debt_equity = ratios.get("debt_equity")
    if debt_equity is not None and debt_equity > 2:
        score += 2
        
    # GST Mismatch check
    if gst_check.get("status") == "FLAGGED":
        score += 3
        
    # Circular trading check
    if circular_check.get("detected"):
        score += 5
        
    # Determine risk level
    if score <= 3:
        level = "LOW"
    elif score <= 6:
        level = "MEDIUM"
    else:
        level = "HIGH"
        
    return {
        "score": score,
        "level": level
    }
