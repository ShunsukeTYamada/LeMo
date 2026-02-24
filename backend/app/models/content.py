from sqlalchemy import Column, String, DateTime, Enum, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from app.db.session import Base

class ContentStatus(str, enum.Enum):
    ACTIVE = "active"
    FILTERED = "filtered"

class Content(Base):
    __tablename__ = "contents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_id = Column(UUID(as_uuid=True), ForeignKey("sources.id"), nullable=False, index=True)
    external_content_id = Column(String, nullable=False, unique=True, index=True) # e.g. YouTube Video ID
    title = Column(String, nullable=False)
    url = Column(String, nullable=False)
    thumbnail_url = Column(String)
    published_at = Column(DateTime(timezone=True), nullable=False, index=True)
    metrics = Column(JSON, default={}) # e.g. viewCount, likeCount
    status = Column(Enum(ContentStatus), default=ContentStatus.ACTIVE, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    source = relationship("Source", back_populates="contents")
