from sqlalchemy import Column, String, DateTime, Enum, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from app.db.session import Base

class SourceStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class Source(Base):
    __tablename__ = "sources"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    platform = Column(String, nullable=False, default="youtube")
    external_source_id = Column(String, nullable=False, unique=True, index=True) # e.g. YouTube Channel ID
    name = Column(String, nullable=False)
    category = Column(String) # For YouTube, the videoCategoryId it belongs to
    status = Column(Enum(SourceStatus), default=SourceStatus.PENDING, nullable=False)
    metadata_ = Column("metadata", JSON, default={}) # extra data like subscriberCount etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    contents = relationship("Content", back_populates="source", cascade="all, delete-orphan")
