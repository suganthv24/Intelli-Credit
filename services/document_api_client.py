import requests

def fetch_processed_documents(file_path):
    """
    Simulates calling an external Teammate API (e.g., http://document-service:8001/process)
    that processes a raw PDF and extracts structured JSON financial data.
    
    For the hackathon, if the API is not live, we will return a mock structure natively
    derived from our standard input.
    """
    # url = "http://document-service:8001/process"
    # try:
    #     files = {"file": open(file_path, "rb")}
    #     response = requests.post(url, files=files)
    #     return response.json()
    # except Exception as e:
    #     print(f"Failed to connect to document-service: {e}. Falling back to mock data.")

    # Mock Data matching the OCR/Document output format
    return {
        "company_profile": {
            "name": "ABC Manufacturing Pvt Ltd",
            "industry": "Auto Components",
            "promoter": "Rajesh Kumar"
        },
        "financials": {
            "revenue": 52000000,
            "profit": 6200000,
            "debt_equity": 1.33,
            "interest_coverage": 2.6,
            "gst_bank_mismatch": 0.038
        },
        "transactions": [
            {"from": "ABC", "to": "CompanyB", "amount": 500000},
            {"from": "CompanyB", "to": "CompanyC", "amount": 480000},
            {"from": "CompanyC", "to": "ABC", "amount": 470000}
        ]
    }
