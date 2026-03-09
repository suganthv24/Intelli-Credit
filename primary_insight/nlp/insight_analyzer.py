from transformers import pipeline

# Initialize the sentiment analysis pipeline using the same model as the Research Agent to stay consistent
sentiment_model = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")

def analyze_qualitative_note(note):
    """
    Analyzes a single credit officer note or observation for sentiment.
    """
    if not note:
        return {"label": "NEUTRAL", "score": 1.0}
    try:
        # truncate just in case string is too long for the model
        result = sentiment_model(note[:512])[0]
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
