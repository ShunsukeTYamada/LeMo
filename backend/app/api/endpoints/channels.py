from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.db.session import get_db
from app.models.source import Source, SourceStatus
from app.models.user import User
from app.schemas.core import SourceResponse
from app.services.youtube import discover_new_channels, search_channels_by_keyword
from app.api.deps import get_current_admin

router = APIRouter()

class ManualDiscoverRequest(BaseModel):
    query: str

@router.post("/manual-discover", response_model=List[SourceResponse])
def run_manual_discovery(
    req: ManualDiscoverRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Search YouTube channels by a specific keyword and add them as PENDING sources.
    (Admin only)
    """
    try:
        new_channels = search_channels_by_keyword(req.query, max_results=5)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    created_sources = []
    
    for ch in new_channels:
        existing = db.query(Source).filter(Source.external_source_id == ch["id"]).first()
        if existing:
            created_sources.append(existing)
            continue
            
        snippet = ch.get("snippet", {})
        statistics = ch.get("statistics", {})
        
        source = Source(
            platform="youtube",
            external_source_id=ch["id"],
            name=snippet.get("title", "Unknown"),
            category="all", # Default, can be reassigned
            status=SourceStatus.PENDING,
            metadata_={
                "description": snippet.get("description", ""),
                "subscriberCount": statistics.get("subscriberCount", 0),
                "videoCount": statistics.get("videoCount", 0),
                "thumbnail": snippet.get("thumbnails", {}).get("default", {}).get("url", "")
            }
        )
        db.add(source)
        db.commit()
        db.refresh(source)
        created_sources.append(source)
        
    return created_sources

@router.post("/discover", response_model=List[SourceResponse])
def run_discovery(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Triggers YouTube API to find new kids-safe channels
    and saves pending sources to the database.
    (Admin only)
    """
    try:
        new_channels = discover_new_channels(min_subscribers=20000) # strict for kids but allowing more channels
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    created_sources = []
    
    for ch in new_channels:
        # Check if already exists
        existing = db.query(Source).filter(Source.external_source_id == ch["id"]).first()
        if existing:
            continue
            
        snippet = ch.get("snippet", {})
        statistics = ch.get("statistics", {})
        
        source = Source(
            platform="youtube",
            external_source_id=ch["id"],
            name=snippet.get("title", "Unknown"),
            category=ch.get("_discovered_category"),
            status=SourceStatus.PENDING,
            metadata_={
                "description": snippet.get("description", ""),
                "subscriberCount": statistics.get("subscriberCount", 0),
                "videoCount": statistics.get("videoCount", 0),
                "thumbnail": snippet.get("thumbnails", {}).get("default", {}).get("url", "")
            }
        )
        db.add(source)
        db.commit()
        db.refresh(source)
        created_sources.append(source)
        
    return created_sources

@router.get("/", response_model=List[SourceResponse])
def list_sources(
    skip: int = 0, limit: int = 1000, 
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    List all channels (sources). Useful for admin panel.
    (Admin only)
    """
    return db.query(Source).offset(skip).limit(limit).all()

@router.put("/{source_id}/approve", response_model=SourceResponse)
def approve_source(
    source_id: str, 
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Approve a pending channel to start fetching its videos.
    (Admin only)
    """
    source = db.query(Source).filter(Source.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
        
    source.status = SourceStatus.APPROVED
    db.commit()
    db.refresh(source)
    return source
    
@router.put("/{source_id}/reject", response_model=SourceResponse)
def reject_source(
    source_id: str, 
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Reject a pending channel so its videos are not fetched.
    (Admin only)
    """
    source = db.query(Source).filter(Source.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
        
    source.status = SourceStatus.REJECTED
    db.commit()
    db.refresh(source)
    return source
