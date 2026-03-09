# Intelli-Credit --- AI Powered Corporate Credit Appraisal Engine

## Hackathon Project Documentation

------------------------------------------------------------------------

# 1. Project Overview

**Intelli-Credit** is an AI-powered credit decisioning system that
automates the creation of a **Credit Appraisal Memo (CAM)** for
corporate lending.

The platform ingests structured and unstructured data sources such as:

-   GST filings
-   Bank statements
-   Financial statements
-   Annual reports
-   News and regulatory intelligence
-   Credit officer qualitative inputs

Using document intelligence, machine learning, and automated research
agents, the system produces:

-   Credit risk score
-   Loan approval recommendation
-   Suggested loan limit
-   Suggested interest rate
-   Automated CAM report

------------------------------------------------------------------------

# 2. Problem Statement

Corporate loan evaluation requires analyzing multiple sources of
financial and qualitative information.

Credit managers must manually evaluate:

### Structured Data

-   GST returns
-   Income tax filings
-   Bank statements

### Unstructured Data

-   Annual reports
-   Financial statements
-   Rating agency reports
-   Board meeting notes

### External Intelligence

-   News reports
-   MCA filings
-   Litigation records

### Primary Observations

-   Factory visits
-   Management interviews

This process often takes **weeks**, leading to slow credit decisions and
potential risk oversight.

------------------------------------------------------------------------

# 3. Proposed Solution

The Intelli-Credit platform automates the entire credit appraisal
workflow.

Key capabilities:

1.  Multi-format document ingestion
2.  Intelligent document parsing
3.  External research automation
4.  Credit risk scoring using ML
5.  Explainable AI risk analysis
6.  Automated CAM report generation

The system reduces credit analysis time from **weeks to minutes**.

------------------------------------------------------------------------

# 4. System Architecture

## High-Level Architecture

    Frontend Dashboard
            ↓
    Backend API Layer
            ↓
    Document Processing Engine
            ↓
    Feature Engineering Pipeline
            ↓
    Credit Risk Model
            ↓
    Explainability Engine
            ↓
    Recommendation Engine
            ↓
    CAM Generator
            ↓
    Database + File Storage

------------------------------------------------------------------------

# 5. System Components

## 5.1 Data Ingestion Layer

Handles uploading and storing documents.

Supported formats:

-   PDF
-   Excel
-   CSV
-   Text

Documents include:

-   Annual reports
-   GST filings
-   Bank statements
-   Legal notices
-   Financial statements

Files are stored using structured directories.

Example:

    data/
       companies/
          company_id/
             annual_reports/
             bank_statements/
             gst_returns/

------------------------------------------------------------------------

## 5.2 Document Intelligence Engine

Extracts information from uploaded documents.

Technologies:

-   pdfplumber
-   tabula
-   pytesseract OCR

Extracted data includes:

-   Revenue
-   Profit
-   Total assets
-   Debt levels
-   Financial ratios

Tables are converted into **pandas DataFrames**.

------------------------------------------------------------------------

## 5.3 Research Agent

The research engine gathers external intelligence.

Sources include:

-   News APIs
-   Industry reports
-   Litigation records

Example outputs:

-   Negative news detection
-   Regulatory risks
-   Legal disputes involving promoters

------------------------------------------------------------------------

## 5.4 Feature Engineering

Extracted financial metrics are transformed into features.

Key features:

-   Debt to equity ratio
-   Interest coverage ratio
-   Revenue growth
-   Cash flow stability
-   GST vs bank mismatch
-   Litigation count

These features become inputs to the ML model.

------------------------------------------------------------------------

## 5.5 Credit Risk Model

The ML model predicts the probability of default.

Primary algorithm:

-   XGBoost

Model output:

    Default probability
    Credit risk score
    Risk category

Example:

    Credit Score: 72
    Risk Category: Medium

------------------------------------------------------------------------

## 5.6 Explainable AI

Financial institutions require explainable decisions.

SHAP is used to explain predictions.

Example explanation:

    High debt ratio increased risk
    Litigation cases increased risk
    Strong revenue growth reduced risk

------------------------------------------------------------------------

## 5.7 Recommendation Engine

Based on the risk score, the system recommends:

-   Loan approval / rejection
-   Maximum loan limit
-   Interest rate

Example logic:

    Loan limit = revenue × lending multiplier
    Interest rate = base rate + risk premium

------------------------------------------------------------------------

## 5.8 CAM Generator

Automatically generates a **Credit Appraisal Memo**.

Sections include:

1.  Borrower profile
2.  Promoter analysis
3.  Industry overview
4.  Financial analysis
5.  Risk indicators
6.  Credit score
7.  Final recommendation

Generated as:

-   Word document
-   PDF report

------------------------------------------------------------------------

# 6. Technology Stack

  Layer               Technology
  ------------------- ------------------------
  Frontend            React, Tailwind
  Backend             FastAPI
  ML Models           XGBoost, Scikit-learn
  Explainability      SHAP
  NLP                 spaCy, Transformers
  PDF Processing      pdfplumber, tabula
  OCR                 pytesseract
  Data Processing     Pandas, NumPy
  Database            PostgreSQL
  File Storage        Local filesystem
  Research Agent      NewsAPI, BeautifulSoup
  Report Generation   python-docx

------------------------------------------------------------------------

# 7. Database Design

## Companies Table

    company_id
    company_name
    industry
    created_at

## Documents Table

    doc_id
    company_id
    document_type
    file_path
    upload_time

## Financial Metrics Table

    metric_id
    company_id
    revenue
    profit
    debt
    assets

## Risk Scores Table

    company_id
    credit_score
    risk_category
    model_version

------------------------------------------------------------------------

# 8. API Design

## Create Company

    POST /create_company

## Upload Document

    POST /upload_document

## Analyze Company

    POST /analyze_company

## Get Credit Score

    GET /credit_score/{company_id}

## Download CAM

    GET /download_cam/{company_id}

------------------------------------------------------------------------

# 9. Machine Learning Pipeline

### Step 1: Data Collection

Collect historical credit datasets such as:

-   LendingClub dataset
-   Financial risk datasets

### Step 2: Feature Engineering

Generate financial ratios and behavioral metrics.

### Step 3: Model Training

Train XGBoost classifier.

### Step 4: Model Evaluation

Metrics used:

-   Accuracy
-   AUC score
-   Precision / Recall

### Step 5: Deployment

Expose prediction model through FastAPI.

------------------------------------------------------------------------

# 10. Demo Workflow

### Step 1

Create company profile.

### Step 2

Upload documents:

-   Annual report
-   GST file
-   Bank statement

### Step 3

System extracts financial metrics.

### Step 4

Research agent collects external intelligence.

### Step 5

ML model computes risk score.

### Step 6

System generates CAM report.

------------------------------------------------------------------------

# 11. Hackathon Demo Script

1.  Upload corporate documents
2.  Show extracted financial metrics
3.  Display detected risk signals
4.  Run credit scoring model
5.  Generate CAM instantly

This demonstrates **end-to-end automation**.

------------------------------------------------------------------------

# 12. Unique Features

-   Multi-format financial document ingestion
-   Automated corporate research agent
-   Explainable AI credit scoring
-   CAM generation automation
-   Indian corporate ecosystem support

------------------------------------------------------------------------

# 13. Future Enhancements

-   Integration with MCA corporate database
-   Integration with GSTN APIs
-   Real-time banking transaction feeds
-   Industry risk modeling
-   Advanced NLP using LLMs

------------------------------------------------------------------------

# 14. Project Folder Structure

    intelli-credit/

    backend/
       main.py
       routes/
       services/
       models/

    ml/
       train_model.py
       feature_engineering.py

    document_processing/
       pdf_parser.py
       ocr_engine.py

    research_agent/
       news_collector.py
       litigation_scraper.py

    cam_generator/
       cam_builder.py

    frontend/
       dashboard/
       upload_page/

    data/
       companies/

------------------------------------------------------------------------

# 15. Conclusion

Intelli-Credit demonstrates how AI can transform corporate credit
evaluation.

By combining document intelligence, machine learning, and automated
research, the system delivers:

-   Faster credit decisions
-   Reduced human bias
-   Improved risk detection

The platform enables financial institutions to move from **manual credit
analysis to AI-powered decisioning**.
