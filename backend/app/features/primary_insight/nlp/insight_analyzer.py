from transformers import pipeline

# Initialize the sentiment analysis pipeline using the same model as the Research Agent to stay consistent
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

def analyze_qualitative_note(note):
    """
    Analyzes a single credit officer note or observation for sentiment.
    """
    if not note:
        return {"label": "NEUTRAL", "score": 1.0}
    try:
        model = get_sentiment_model()
        if not model:
            return {"label": "NEUTRAL", "score": 1.0, "error": "Model failed to load"}
        # truncate just in case string is too long for the model
        result = model(note[:512])[0]
        return result
    except Exception as e:
        return {"label": "NEUTRAL", "score": 1.0, "error": str(e)}

def analyze_all_notes(notes):
    """
    Analyzes a list of notes, returning the full list of sentiments.
    """
    results = []
    for note in notes:
        results.append({
            "note": note,
            "sentiment": analyze_qualitative_note(note)
        })
    return results
