from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from typing import List

from app.db.session import get_db
from app.models.user import User, Favorite, WatchHistory
from app.models.content import Content
from app.schemas.user import UserResponse, FavoriteResponse, WatchHistoryResponse
from app.schemas.core import ContentResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def read_user_me(current_user: User = Depends(get_current_user)):
    """
    Get current user profile.
    """
    return current_user

@router.get("/favorites", response_model=List[FavoriteResponse])
def get_user_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0, limit: int = 100
):
    """
    Get current user's favorite videos.
    """
    return db.query(Favorite).filter(Favorite.user_id == current_user.id).order_by(Favorite.created_at.desc()).offset(skip).limit(limit).all()

@router.post("/favorites/{content_id}", response_model=FavoriteResponse)
def add_favorite(
    content_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Add a video to favorites.
    """
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Video not found")
        
    existing = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.content_id == content_id
    ).first()
    if existing:
        return existing
        
    favorite = Favorite(user_id=current_user.id, content_id=content_id)
    db.add(favorite)
    db.commit()
    db.refresh(favorite)
    return favorite

@router.delete("/favorites/{content_id}")
def remove_favorite(
    content_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Remove a video from favorites.
    """
    favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.content_id == content_id
    ).first()
    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite not found")
        
    db.delete(favorite)
    db.commit()
    return {"ok": True}

@router.get("/history", response_model=List[WatchHistoryResponse])
def get_watch_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0, limit: int = 50
):
    """
    Get user's watch history.
    """
    return db.query(WatchHistory).filter(WatchHistory.user_id == current_user.id).order_by(WatchHistory.last_watched_at.desc()).offset(skip).limit(limit).all()

@router.post("/history/{content_id}", response_model=WatchHistoryResponse)
def record_watch_history(
    content_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Record that a user started watching a video.
    """
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Video not found")
        
    history = db.query(WatchHistory).filter(
        WatchHistory.user_id == current_user.id,
        WatchHistory.content_id == content_id
    ).first()
    
    if history:
        # DB automatically updates last_watched_at via onupdate=func.now()
        # but SQLAlchemy requires an actual update to trigger it.
        # Alternatively, we can just bump the column.
        history.last_watched_at = func.now()
        db.commit()
        db.refresh(history)
        return history
        
    new_history = WatchHistory(user_id=current_user.id, content_id=content_id)
    db.add(new_history)
    db.commit()
    db.refresh(new_history)
    return new_history
