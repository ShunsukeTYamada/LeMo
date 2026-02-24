from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from app.schemas.core import ContentResponse

class UserBase(BaseModel):
    username: str
    account_name: str
    birth_year_month: str = Field(..., description="Format: YYYY-MM")

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: UUID
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

class FavoriteResponse(BaseModel):
    id: UUID
    content: ContentResponse
    created_at: datetime
    
    class Config:
        from_attributes = True

class WatchHistoryResponse(BaseModel):
    id: UUID
    content: ContentResponse
    last_watched_at: datetime
    
    class Config:
        from_attributes = True
