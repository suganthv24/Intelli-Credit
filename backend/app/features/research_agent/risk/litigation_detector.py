def detect_litigation(text):
    """
    Detects if the text contains keywords indicative of legal or regulatory risk.
    """
    keywords = [
        "fraud",
        "court",
        "investigation",
        "nclt",
        "bankruptcy",
        "default",
        "sebi action",
        "tax evasion",
        "ed",
        "summoned",
        "cbi"
    ]
    
    found_keywords = []
    text_lower = text.lower()
    
    for k in keywords:
        if k in text_lower:
            found_keywords.append(k)
            
    return {
        "litigation_found": len(found_keywords) > 0,
        "keywords_found": found_keywords
    }
