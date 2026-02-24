from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID
from datetime import datetime

class SourceBase(BaseModel):
    name: str
    category: Optional[str] = None
    platform: str = "youtube"
    external_source_id: str

class SourceCreate(SourceBase):
    pass

class SourceResponse(SourceBase):
    id: UUID
    status: str
    metadata_: dict = Field(default={})
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ContentBase(BaseModel):
    title: str
    url: str
    thumbnail_url: Optional[str] = None
    external_content_id: str
    published_at: datetime
    metrics: dict = {}

class ContentCreate(ContentBase):
    source_id: UUID

class ContentResponse(ContentBase):
    id: UUID
    source_id: UUID
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
