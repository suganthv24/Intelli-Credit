from transformers import pipeline

# Initialize sentiment pipeline. Warning: this takes a moment to load and download on first run.
# Using a lightweight model for speed if needed: distilbert-base-uncased-finetuned-sst-2-english
sentiment_model = None

def get_sentiment_model():
    """Lazy load the sentiment model"""
    global sentiment_model
    if sentiment_model is None:
        try:
            sentiment_model = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
        except Exception:
            pass
    return sentiment_model

def analyze_sentiment(text):
    """
    Classifies the text sentiment as POSITIVE, NEGATIVE, or NEUTRAL.
    """
    model = get_sentiment_model()
    if not model:
        return {"label": "UNKNOWN", "score": 0.0}
    
    # Process only the first 512 tokens to avoid length errors from transformer models
    try:
        result = sentiment_model(text[:512])[0]
        
        # distilbert returns POSITIVE or NEGATIVE
        return {
            "label": result["label"].upper(),
            "score": result["score"]
        }
    except Exception as e:
        return {"label": "ERROR", "score": 0.0}
