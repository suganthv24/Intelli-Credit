from cam_generator.generator.section_generators import (
    generate_executive_summary,
    company_profile_section,
    financial_analysis_section,
    risk_section,
    five_cs_section,
    recommendation_section,
    explanation_section
)

def build_cam(data):
    """
    Orchestrates mapping exactly the JSON structure sequentially to the string generators.
    """
    sections = {
        "Executive Summary": generate_executive_summary(data),
        "Company Profile": company_profile_section(data),
        "Financial Analysis": financial_analysis_section(data),
        "Risk Assessment": risk_section(data),
        "Five Cs of Credit": five_cs_section(data),
        "Recommendation": recommendation_section(data),
        "Decision Explanation": explanation_section(data)
    }
    
    return sections
