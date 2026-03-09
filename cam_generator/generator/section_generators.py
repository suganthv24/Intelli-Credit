def generate_executive_summary(data):
    decision = data["recommendation"]["loan_decision"]
    limit = data["recommendation"]["recommended_limit"]
    rate = data["recommendation"]["interest_rate"]
    
    summary = f"""Loan Recommendation: {decision}

Recommended Loan Limit: ₹{limit:,}
Interest Rate: {rate}%

The credit evaluation indicates moderate financial health with certain operational risks.
"""
    return summary

def company_profile_section(data):
    company = data["company_profile"]
    
    text = f"""Company Name: {company['name']}
Industry: {company['industry']}
Promoter: {company['promoter']}
"""
    return text

def financial_analysis_section(data):
    f = data["financial_analysis"]
    
    text = f"""Revenue: ₹{f['revenue']:,}
Net Profit: ₹{f['profit']:,}

Debt to Equity Ratio: {f['debt_equity']}
Interest Coverage Ratio: {f['interest_coverage']}
"""
    return text

def risk_section(data):
    research = data["research_analysis"]
    ops = data["operational_insights"]
    
    text = f"""Litigation Cases: {research['litigation_cases']}
Negative News Ratio: {research['negative_news_ratio']}
Sector Risk: {research['sector_risk']}

Factory Utilization: {ops['factory_utilization']}%
Inventory Status: {ops['inventory_status']}
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
    rec = data["recommendation"]
    
    text = f"""Final Recommendation: {rec['loan_decision']}

Proposed Loan Limit: ₹{rec['recommended_limit']:,}

Suggested Interest Rate: {rec['interest_rate']}%

Risk Grade: BBB
"""
    return text

def explanation_section(data):
    risk = data["explanation"]["risk_factors"]
    positive = data["explanation"]["positive_signals"]
    
    text = "Decision Explanation\n\n"
    text += "Risk Drivers:\n"
    for r in risk:
        text += f"+ {r}\n"
        
    text += "\nPositive Indicators:\n"
    for p in positive:
        text += f"- {p}\n"
        
    return text
