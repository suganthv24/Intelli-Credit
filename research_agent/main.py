import sys
import json
import os

from research_agent.search.serp_search import search_company_news
from research_agent.scraping.news_scraper import scrape_article
from research_agent.nlp.entity_extractor import extract_entities
from research_agent.nlp.sentiment_analyzer import analyze_sentiment
from research_agent.risk.litigation_detector import detect_litigation as nlp_detect_litigation
from research_agent.risk.sector_risk import analyze_sector_risk
from research_agent.risk.risk_generator import generate_risk_score

def analyze_news(company_name, promoters=None):
    if not promoters:
        promoters = []
    search_results = search_company_news(company_name, promoters)
    
    news_sentiments = []
    articles_analyzed = 0
    scraped_texts = []
    
    for result in search_results:
        article_text = scrape_article(result.get("link"), company_name)
        scraped_texts.append(article_text)
        
        # Entity Recognition (optional for processing, but good for logs/CAM context)
        extract_entities(article_text)
        
        sentiment = analyze_sentiment(article_text)
        news_sentiments.append(sentiment.get("label", "NEUTRAL"))
        articles_analyzed += 1
        
    return {
        "articles_analyzed": articles_analyzed,
        "negative_news": news_sentiments.count("NEGATIVE"),
        "sentiments": news_sentiments,
        "scraped_texts": scraped_texts
    }

def detect_litigation(company_name, scraped_texts=None):
    litigation_flags = []
    if scraped_texts:
        for text in scraped_texts:
            check = nlp_detect_litigation(text)
            litigation_flags.append(check.get("litigation_found", False))
            
    return {
        "litigation_found": any(litigation_flags) if litigation_flags else False,
        "flags": litigation_flags
    }

def calculate_sector_risk(company_name):
    # Determine sector dynamically via sector_risk module
    return analyze_sector_risk(company_name)

def compute_external_risk_score(news_result, litigation_result, sector_risk):
    return generate_risk_score(
        news_result.get("sentiments", []), 
        litigation_result.get("flags", []), 
        sector_risk.get("sector_sentiment", "UNKNOWN")
    )

def run_research_agent(data):
    """
    Main orchestration pipeline for the Research Agent.
    """
    company_name = data.get("company_name", "")
    promoters = data.get("promoters", [])
    
    if not company_name:
        return {"error": "company_name is required"}
        
    # Execute modular functions
    news_result = analyze_news(company_name, promoters)
    litigation_result = detect_litigation(company_name, news_result.get("scraped_texts", []))
    sector_risk = calculate_sector_risk(company_name)
    risk_assessment = compute_external_risk_score(news_result, litigation_result, sector_risk)
    
    # Final Output
    output = {
        "company": company_name,
        "news_analysis": {
            "articles_analyzed": news_result.get("articles_analyzed", 0),
            "negative_news": news_result.get("negative_news", 0)
        },
        "litigation_detection": {
            "litigation_found": litigation_result.get("litigation_found", False)
        },
        "sector_risk": sector_risk.get("sector", "UNKNOWN"),
        "external_risk_score": risk_assessment.get("score"),
        "external_risk_level": risk_assessment.get("level")
    }
    
    return output

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    # Add project root to path for standalone testing
    root_dir = os.path.abspath(os.path.join(base_dir, ".."))
    if root_dir not in sys.path:
        sys.path.append(root_dir)
        
    input_file = "data/input.json"
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
        
    input_path = os.path.join(base_dir, input_file)
    
    try:
        with open(input_path, 'r') as f:
            data = json.load(f)
            
        result = run_research_agent(data)
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
