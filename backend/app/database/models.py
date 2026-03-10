from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.db import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    sessions = relationship("AnalysisSession", back_populates="user")
    documents = relationship("Document", back_populates="user")

class AnalysisSession(Base):
    __tablename__ = "analysis_sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="completed") # pending, completed, failed
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="sessions")
    documents = relationship("Document", back_populates="session")
    features = relationship("FinancialFeatures", back_populates="session", uselist=False)
    loan_application = relationship("LoanApplication", back_populates="session", uselist=False)
    cam_report = relationship("CAMReport", back_populates="session", uselist=False)

from sqlalchemy.dialects.postgresql import JSONB

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    session_id = Column(Integer, ForeignKey("analysis_sessions.id"), nullable=True)
    filename = Column(String)
    file_type = Column(String)
    file_size = Column(Integer)
    storage_path = Column(String)
    upload_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="uploaded") # uploaded, processing, processed, failed
    extracted_data = Column(JSONB, nullable=True) # Postgres JSONB for flexible schema
    
    user = relationship("User", back_populates="documents")
    session = relationship("AnalysisSession", back_populates="documents")

class Company(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    industry = Column(String)
    promoter = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class LoanApplication(Base):
    __tablename__ = "loan_applications"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    session_id = Column(Integer, ForeignKey("analysis_sessions.id"))
    risk_probability = Column(Float)
    loan_decision = Column(String)
    recommended_limit = Column(Float)
    interest_rate = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    session = relationship("AnalysisSession", back_populates="loan_application")

class FinancialFeatures(Base):
    __tablename__ = "financial_features"
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    session_id = Column(Integer, ForeignKey("analysis_sessions.id"))
    debt_equity = Column(Float)
    revenue_growth = Column(Float)
    interest_coverage = Column(Float)
    gst_bank_mismatch = Column(Float)
    litigation_count = Column(Integer)
    negative_news_ratio = Column(Float)
    factory_utilization = Column(Float)
    inventory_turnover = Column(Float)
    
    session = relationship("AnalysisSession", back_populates="features")

class CAMReport(Base):
    __tablename__ = "cam_reports"
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    session_id = Column(Integer, ForeignKey("analysis_sessions.id"))
    file_path = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    session = relationship("AnalysisSession", back_populates="cam_report")
