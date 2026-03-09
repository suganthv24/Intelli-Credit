import requests
from bs4 import BeautifulSoup
import time
import random

def scrape_article(url, company_name="Company"):
    """
    Scrapes the text from a given news article URL.
    Generates dynamic content if the URL is a mock domain.
    """
    if "mock-news.com" in url:
        snippets = [
            f"The operations of {company_name} have been scrutinized recently by investors.",
            f"Sources indicate that {company_name} might be facing legal challenges and tax evasion probes.",
            f"Despite some hurdles, {company_name} continues to operate its core business effectively.",
            f"Authorities are looking into financial records associated with {company_name}.",
            f"{company_name} representatives declined to comment fully on the litigation situation.",
            f"Positive growth metrics were reported for {company_name} in the latest quarter.",
            f"There are allegations of fraud linked to several executives at {company_name}.",
            f"The company's stock rallied after {company_name} announced new partnerships."
        ]
        num_sentences = random.randint(2, 5)
        text = " ".join(random.sample(snippets, num_sentences))
        return text

    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        response = requests.get(url, headers=headers, timeout=5)
        soup = BeautifulSoup(response.text, "html.parser")
        
        # Extract text from paragraphs
        paragraphs = soup.find_all("p")
        text = " ".join([p.get_text().strip() for p in paragraphs])
        
        return text if text else "No content found."
    except Exception as e:
        return f"Scraping failed: {str(e)}"
