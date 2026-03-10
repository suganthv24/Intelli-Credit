def score_insights(analyzed_notes):
    """
    Takes in a list of analyzed notes (each containing the note text and its sentiment).
    Calculates an overall risk adjustment score and an insight risk category.
    """
    total_notes = len(analyzed_notes)
    if total_notes == 0:
        return {
            "insight_score_adjustment": 0,
            "category": "NEUTRAL",
            "summary": "No primary insights provided."
        }

    positive_count = sum(1 for n in analyzed_notes if n.get("sentiment", {}).get("label") == "POSITIVE")
    negative_count = sum(1 for n in analyzed_notes if n.get("sentiment", {}).get("label") == "NEGATIVE")

    # Basic scoring logic:
    # Each negative note adds +1 to the risk score adjustment
    # Each positive note subtracts -1 to the risk score adjustment
    score_adjustment = negative_count - positive_count

    # Determine risk category based on the balance
    if score_adjustment > 0:
        category = "NEGATIVE"
    elif score_adjustment < 0:
        category = "POSITIVE"
    else:
        category = "MIXED"

    return {
        "insight_score_adjustment": score_adjustment,
        "category": category,
        "summary": f"Analyzed {total_notes} notes. {positive_count} positive, {negative_count} negative.",
        "detailed_notes": analyzed_notes
    }
