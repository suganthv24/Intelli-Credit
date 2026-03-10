def generate_executive_summary(data):
    decision = data.get("recommendation", {}).get("loan_decision", "PENDING")
    limit = data.get("recommendation", {}).get("recommended_limit", 0)
    rate = data.get("recommendation", {}).get("interest_rate", 0)
    
    summary = f"""Loan Recommendation: {decision}

Recommended Loan Limit: ₹{limit:,}
Interest Rate: {rate}%

The credit evaluation indicates moderate financial health with certain operational risks.
"""
    return summary

def company_profile_section(data):
    # Fallback to generic if missing from payload
    company = data.get("company_profile", {"name": "Demo Company", "industry": "Manufacturing", "promoter": "Ramesh Kumar"})
    
    text = f"""Company Name: {company.get('name', 'N/A')}
Industry: {company.get('industry', 'N/A')}
Promoter: {company.get('promoter', 'N/A')}
"""
    return text

def financial_analysis_section(data):
    features = data.get("features", {})
    
    text = f"""Debt to Equity Ratio: {features.get('debt_equity', 0)}
Interest Coverage Ratio: {features.get('interest_coverage', 0)}
Revenue Growth: {features.get('revenue_growth', 0)*100}%
"""
    return text

def risk_section(data):
    research = data.get("research_agent", {})
    features = data.get("features", {})
    
    text = f"""Litigation Cases (AI Detected): {research.get('litigation_cases', 0)}
News Sentiment: {research.get('news_summary', 'Neutral')}
Sector Risk: {research.get('sector_risk', 'Moderate')}

Factory Utilization: {features.get('factory_utilization', 0)}%
Inventory Turnover: {features.get('inventory_turnover', 0)}
"""
    return text

def five_cs_section(data):
    text = """Character:
Promoter background shows moderate risk due to litigation signals.

Capacity:
Stable revenue and healthy interest coverage indicate repayment ability.

Capital:
Debt to equity ratio indicates moderate leverage.

Collateral:
Collateral evaluation required before final disbursement.

Conditions:
Industry outlook moderately affected by sector slowdown.
"""
    return text

def recommendation_section(data):
    rec = data.get("recommendation", {})
    
    text = f"""Final Recommendation: {rec.get('loan_decision', 'REVIEW')}

Proposed Loan Limit: ₹{rec.get('recommended_limit', 0):,}

Suggested Interest Rate: {rec.get('interest_rate', 0)}%

Risk Grade: BBB
"""
    return text

def explanation_section(data):
    risk = data.get("explanation", {}).get("risk_factors", [])
    positive = data.get("explanation", {}).get("positive_signals", [])
    
    text = "Decision Explanation\n\n"
    text += "Risk Drivers:\n"
    for r in risk:
        text += f"+ {r}\n"
        
    text += "\nPositive Indicators:\n"
    for p in positive:
        text += f"- {p}\n"
        
    return text

def swot_section(data):
    swot = data.get("swot", {})
    
    text = "GenAI SWOT Matrix\n\n"
    
    text += "Strengths:\n"
    for s in swot.get("strengths", []):
        text += f" + {s}\n"
        
    text += "\nWeaknesses:\n"
    for w in swot.get("weaknesses", []):
        text += f" - {w}\n"
        
    text += "\nOpportunities:\n"
    for o in swot.get("opportunities", []):
        text += f" * {o}\n"
        
    text += "\nThreats:\n"
    for t in swot.get("threats", []):
        text += f" ! {t}\n"
        
    return text
