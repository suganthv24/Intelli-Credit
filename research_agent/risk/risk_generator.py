def generate_risk_score(news_sentiments, litigation_flags, sector_risk_sentiment):
    """
    Generate an external risk score based on negative news count, 
    litigation keywords, and sector risk sentiment.
    """
    score = 0
    
    # 1. Negative news
    negative_news_count = news_sentiments.count("NEGATIVE")
    if negative_news_count > 3:
        score += 3
        
    # 2. Litigation flags
    if any(litigation_flags):
        score += 4
        
    # 3. Sector Risk 
    if sector_risk_sentiment == "NEGATIVE":
        score += 2
        
    # Determine Level based on constraints: 0-2 LOW, 3-5 MEDIUM, 6+ HIGH
    if score <= 2:
        risk_level = "LOW"
    elif score <= 5:
        risk_level = "MEDIUM"
    else:
        risk_level = "HIGH"
        
    return {
        "score": score,
        "level": risk_level
    }
