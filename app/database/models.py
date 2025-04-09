from sqlalchemy import Column, Integer, String, Boolean, create_engine, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import os
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

# SQLite database URL
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./garden.db")

# Create SQLAlchemy engine
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

# Define Plant model
class Plant(Base):
    __tablename__ = "plants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    type = Column(String, nullable=True)
    seedlings = Column(Integer, nullable=True)
    transplant = Column(Integer, nullable=True)
    harvest = Column(Integer, nullable=True)
    
    # Relationship to Planting
    plantings = relationship("Planting", back_populates="plant")

# Define Planting model
class Planting(Base):
    __tablename__ = "plantings"
    
    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, nullable=False)
    plant_id = Column(Integer, ForeignKey("plants.id"), nullable=False)
    seedlings = Column(DateTime, nullable=True)
    planted = Column(DateTime, nullable=True)
    location = Column(String, nullable=True)
    
    # Relationship to Plant
    plant = relationship("Plant", back_populates="plantings")

# Create tables
def create_tables():
    Base.metadata.create_all(bind=engine)