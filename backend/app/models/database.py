import json
import datetime
from sqlalchemy import (
    create_engine, Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from app.core.config import settings

# Engine setup with SQLite connect_args if needed
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class LocationModel(Base):
    __tablename__ = "locations"

    id = Column(String, primary_key=True, index=True) # e.g. slug or uuid
    display_name = Column(String, nullable=False, index=True)
    locality = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    country = Column(String, default="India")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    bounding_box = Column(Text, nullable=True) # JSON list [min_lat, max_lat, min_lon, max_lon]
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    livability_reports = relationship("LivabilityReportModel", back_populates="location", cascade="all, delete-orphan")
    builder_reports = relationship("BuilderReportModel", back_populates="location", cascade="all, delete-orphan")

class LivabilityReportModel(Base):
    __tablename__ = "livability_reports"

    id = Column(Integer, primary_key=True, autoincrement=True)
    location_id = Column(String, ForeignKey("locations.id"), nullable=False)
    overall_score = Column(Float, nullable=False)
    is_partial = Column(Boolean, default=False)
    data_completeness_pct = Column(Float, default=100.0)
    
    # Factor breakdown stored as JSON string
    factors_json = Column(Text, nullable=False)
    weights_json = Column(Text, nullable=False)
    ai_summary = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    location = relationship("LocationModel", back_populates="livability_reports")

class BuilderReportModel(Base):
    __tablename__ = "builder_reports"

    id = Column(Integer, primary_key=True, autoincrement=True)
    location_id = Column(String, ForeignKey("locations.id"), nullable=False)
    project_type = Column(String, nullable=False) # residential, commercial, mixed-use
    budget_bracket = Column(String, nullable=True)
    suitability_score = Column(Float, nullable=False)
    feasibility_status = Column(String, nullable=False) # Viable, High Potential, Conditional, Caution
    
    metrics_json = Column(Text, nullable=False)
    due_diligence_json = Column(Text, nullable=True)
    ai_recommendation = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    location = relationship("LocationModel", back_populates="builder_reports")

class SearchHistoryModel(Base):
    __tablename__ = "search_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    query = Column(String, nullable=False)
    location_id = Column(String, nullable=True)
    display_name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    searched_at = Column(DateTime, default=datetime.datetime.utcnow)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
