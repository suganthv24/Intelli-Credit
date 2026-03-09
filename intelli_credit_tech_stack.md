# Intelli-Credit Hackathon Project --- Technology Stack

## 1. Overall System Architecture

The Intelli-Credit system consists of five major layers:

    Frontend Dashboard
            ↓
    Backend API Layer
            ↓
    Document Processing Layer
            ↓
    Machine Learning / AI Engine
            ↓
    Database + File Storage

Each layer uses technologies selected for rapid development and strong
AI/ML capabilities.

------------------------------------------------------------------------

# 2. Backend Layer

## FastAPI (Python)

FastAPI serves as the core backend framework.

### Why FastAPI

-   Native Python support for ML integration
-   Extremely fast API performance
-   Automatic API documentation (Swagger)
-   Easy asynchronous processing

### Responsibilities

-   Document upload APIs
-   Company profile management
-   Trigger ML analysis
-   Generate CAM reports
-   Serve results to the frontend

### Example APIs

    POST /create_company
    POST /upload_documents
    POST /analyze_company
    GET /credit_score
    GET /download_cam

------------------------------------------------------------------------

# 3. Machine Learning / AI Layer

## Scikit-Learn

Used for:

-   Data preprocessing
-   Feature engineering
-   Baseline credit risk models

Algorithms:

-   Logistic Regression
-   Random Forest
-   Gradient Boosting

------------------------------------------------------------------------

## XGBoost

Primary model used for **credit scoring**.

### Why XGBoost

-   Best performing algorithm for tabular financial data
-   Handles nonlinear relationships well
-   Widely used in financial risk modelling

Example Output:

    Probability of Default: 0.23
    Credit Score: 77
    Risk Category: Medium

------------------------------------------------------------------------

## SHAP (Explainable AI)

Banks require transparent models.

SHAP explains:

-   Why a loan was approved or rejected
-   Which variables increased risk

Example Explanation:

    High debt ratio increased risk by +0.18
    Litigation cases increased risk by +0.07
    Strong revenue growth reduced risk by -0.12

------------------------------------------------------------------------

# 4. Document Processing Stack

The system must parse **messy financial PDFs**.

## pdfplumber

Used for:

-   Extracting text
-   Extracting tables
-   Reading financial numbers

Documents processed:

-   Annual reports
-   Financial statements
-   Rating reports

------------------------------------------------------------------------

## tabula

Used for **table extraction from PDFs**.

Example tables extracted:

-   Balance sheet
-   Income statement
-   Cash flow tables

Output format:

    pandas DataFrame

------------------------------------------------------------------------

## pytesseract (OCR)

Some documents are scanned images.

OCR converts:

    Image → Text

Used for:

-   Scanned financial statements
-   Legal notices
-   Printed bank statements

------------------------------------------------------------------------

# 5. NLP / Text Intelligence

Used to analyze unstructured text.

Examples:

-   Annual report narratives
-   Legal notices
-   News articles
-   Management notes

## spaCy

Used for:

-   Named entity recognition
-   Keyword extraction
-   Risk signal detection

Example extraction:

    Company name
    Director name
    Legal case mention
    Debt value

------------------------------------------------------------------------

## Transformers (Optional)

Used for:

-   Text summarization
-   News risk classification

Example:

    News article → summarized risk insight

------------------------------------------------------------------------

# 6. Research Agent Stack

The research agent gathers **external intelligence automatically**.

## NewsAPI

Used to collect:

-   Company-related news
-   Sector trends
-   Regulatory updates

Example query:

    "ABC Steel India investigation"

------------------------------------------------------------------------

## Web Scraping

Libraries:

-   BeautifulSoup
-   Requests

Used to gather:

-   Litigation records
-   Industry reports
-   Regulatory announcements

------------------------------------------------------------------------

# 7. Feature Engineering Layer

## Pandas

Used for:

-   Financial calculations
-   Data transformation
-   Ratio calculations

Example financial features:

    Debt to equity ratio
    Interest coverage ratio
    Revenue growth
    GST vs bank mismatch

------------------------------------------------------------------------

## NumPy

Used for:

-   Numerical operations
-   Matrix operations
-   Statistical calculations

------------------------------------------------------------------------

# 8. Database

## PostgreSQL

Stores structured data including:

-   Company profiles
-   Uploaded documents metadata
-   Extracted financial metrics
-   Risk scores
-   CAM reports

Example tables:

    companies
    documents
    financial_metrics
    risk_scores
    cam_reports

### Why PostgreSQL

-   Reliable relational database
-   Strong analytical capabilities
-   Excellent Python integration

------------------------------------------------------------------------

# 9. File Storage

Uploaded files are stored locally.

Example structure:

    data/
       companies/
          company_id/
               annual_reports/
               gst_returns/
               bank_statements/

Example path:

    data/companies/101/annual_report.pdf

Production systems typically use:

    AWS S3

------------------------------------------------------------------------

# 10. CAM Report Generation

## python-docx

Used to generate:

    Credit_Appraisal_Memo.docx

Example sections:

-   Borrower profile
-   Financial analysis
-   Risk indicators
-   Loan recommendation

------------------------------------------------------------------------

## reportlab

Alternative library used to generate:

    PDF CAM reports

------------------------------------------------------------------------

# 11. Frontend

## React / Next.js

Used to build the user dashboard.

Main features:

-   Company creation
-   Document upload
-   Risk analysis visualization
-   CAM report download

------------------------------------------------------------------------

## Tailwind CSS

Used for:

-   Fast UI styling
-   Responsive layout
-   Clean modern interface

Dashboard sections:

    Company Profile
    Document Upload
    Analysis Results
    Credit Score
    Download CAM

------------------------------------------------------------------------

# 12. Data Visualization

Libraries:

-   Chart.js
-   Recharts

Used to display:

-   Financial ratios
-   Revenue trends
-   Credit risk score

------------------------------------------------------------------------

# 13. Deployment (Optional)

For hackathons the system can run locally.

Optional deployment platforms:

Backend:

    Render
    Railway
    AWS

Frontend:

    Vercel
    Netlify

------------------------------------------------------------------------

# 14. Complete Tech Stack Summary

  Layer               Technology
  ------------------- ------------------------
  Frontend            next.js + Tailwind
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

# 15. Final System Architecture

    Next.js Dashboard
            ↓
    FastAPI Backend
            ↓
    Document Processing Engine
    (pdfplumber + OCR)
            ↓
    Feature Engineering
    (Pandas)
            ↓
    Credit Risk Model
    (XGBoost)
            ↓
    Explainable AI
    (SHAP)
            ↓
    Recommendation Engine
            ↓
    CAM Generator
    (PDF / Word)
            ↓
    PostgreSQL Database
