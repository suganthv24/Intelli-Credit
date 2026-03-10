def litigation_feature(count):
    """Returns the raw or transformed litigation count."""
    return count


def negative_news_ratio(negative, total):
    """Calculates the ratio of negative news to total news extracted."""
    if total == 0 or total is None:
        return 0.0
    return negative / total


def promoter_risk_index(litigation_count, negative_news_ratio):
    """Computes a synthetic score combining legal cases and sentiment."""
    score = 0.0
    score += litigation_count * 0.4
    score += negative_news_ratio * 0.6
    return score


def compute_research_features(research_data):
    """Wrapper function to compute all research features from the research dictionary."""
    cases = research_data.get("litigation_cases", 0)
    neg_news = research_data.get("negative_news", 0)
    total_news = research_data.get("total_news", 0)

    litigation = litigation_feature(cases)
    neg_ratio = negative_news_ratio(neg_news, total_news)
    promoter_risk = promoter_risk_index(litigation, neg_ratio)

    computed = {
        "litigation_count": float(litigation),
        "negative_news_ratio": float(neg_ratio),
        "promoter_risk_index": float(promoter_risk)
    }
    
    return computed
