from sqlalchemy import Column, Integer, String, JSON, DateTime
from sqlalchemy.sql import func
from app.db.database import Base

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String, index=True)
    batch_number = Column(String, index=True)
    description = Column(String)
    severity = Column(String)
    raw_data = Column(JSON)  # Store the full structured JSON from the frontend
    created_at = Column(DateTime(timezone=True), server_default=func.now())
