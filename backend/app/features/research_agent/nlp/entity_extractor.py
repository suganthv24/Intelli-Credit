import spacy

try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    # Need to download the model if not present, handled by main script usually
    pass

def extract_entities(text):
    """
    Extracts named entities from the given text (Persons, Orgs, GPEs).
    """
    try:
        doc = nlp(text)
        # Filter for relevant labels
        relevant_labels = {"PERSON", "ORG", "GPE", "LAW"}
        entities = [(ent.text, ent.label_) for ent in doc.ents if ent.label_ in relevant_labels]
        # Deduplicate
        unique_entities = list(set(entities))
        return unique_entities
    except Exception as e:
        return []
