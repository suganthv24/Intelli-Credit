from research_agent.nlp.sentiment_analyzer import analyze_sentiment
import random

def analyze_sector_risk(company_name, sector_name=None):
    """
    Search for sector trends and analyze sentiment.
    In a real app, you would hit SerpAPI again for 'sector outlook India'.
    """
    if not sector_name:
        sectors = ["Manufacturing", "Technology", "Finance", "Healthcare", "Energy", "Retail", "Telecommunications"]
        sector_name = random.choice(sectors)
        
    # Mocking sector news dynamically
    mock_sector_news_samples = [
        f"The {sector_name} sector is facing headwinds due to supply chain issues and decreased demand.",
        f"The {sector_name} industry is experiencing rapid growth with new innovations.",
        f"Regulatory pressures are mounting on the {sector_name} sector, increasing compliance costs.",
        f"Investments are pouring into the {sector_name} sector, driving optimistic forecasts.",
        f"Market analysts predict steady but slow growth for the {sector_name} sector this year.",
        f"Disruptive technologies are reshaping the competitive landscape in {sector_name}."
    ]
    
    mock_sector_news = random.choice(mock_sector_news_samples)
    sentiment = analyze_sentiment(mock_sector_news)
    
    return {
        "sector": sector_name,
        "sector_sentiment": sentiment.get("label", "NEUTRAL")
    }
