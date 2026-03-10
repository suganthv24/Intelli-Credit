def validate_gst_vs_bank(financials):
    """
    Detects revenue inflation or under-reporting by comparing
    GST sales versus Bank deposits.
    """
    gst_sales = financials.get("gst_sales", 0)
    bank_deposits = financials.get("bank_deposits", 0)

    if gst_sales == 0:
        return {"status": "OK", "reason": "No GST sales reported"}

    difference = abs(gst_sales - bank_deposits)
    percent_diff = difference / gst_sales

    if percent_diff > 0.15:
        return {
            "status": "FLAGGED",
            "reason": "Possible revenue inflation: Bank inflow significantly lower/higher than GST sales"
        }

    return {
        "status": "OK",
        "reason": "Normal"
    }
