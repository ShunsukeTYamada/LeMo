from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.source import Source, SourceStatus
from app.models.content import Content, ContentStatus
from app.schemas.core import ContentResponse
from app.services.youtube import get_recent_videos
import dateutil.parser

router = APIRouter()

def filter_ng_words(title: str) -> bool:
    """
    Very basic NG word filter.
    Returns True if safe, False if it contains NG words.
    """
    ng_words = ["暴力", "グロ", "エロ", "18禁", "アダルト", "殺", "死"]
    for word in ng_words:
        if word in title:
            return False
    return True

@router.post("/fetch-updates", response_model=List[ContentResponse])
def fetch_updates(db: Session = Depends(get_db)):
    """
    Simulates a batch job by fetching new videos for all APPROVED sources.
    In production, this would be triggered by Celery or APScheduler.
    """
    approved_sources = db.query(Source).filter(Source.status == SourceStatus.APPROVED).all()
    new_contents = []
    
    for source in approved_sources:
        try:
            videos = get_recent_videos(source.external_source_id, max_results=10)
        except Exception as e:
            print(f"Error fetching videos for {source.name}: {e}")
            continue
            
        for video in videos:
            vid_id = video["id"]
            
            try:
                # Upsert logic - check if exists
                existing = db.query(Content).filter(Content.external_content_id == vid_id).first()
                if existing:
                    # Update metrics if exists
                    stats = video.get("statistics", {})
                    existing.metrics = {
                        "viewCount": stats.get("viewCount", "0"),
                        "likeCount": stats.get("likeCount", "0"),
                        "commentCount": stats.get("commentCount", "0")
                    }
                    db.commit()
                    continue
                    
                snippet = video.get("snippet", {})
                title = snippet.get("title", "")
                
                # Simple NG Word filtering
                status = ContentStatus.ACTIVE if filter_ng_words(title) else ContentStatus.FILTERED
                
                published_at = dateutil.parser.isoparse(snippet.get("publishedAt"))
                
                content = Content(
                    source_id=source.id,
                    external_content_id=vid_id,
                    title=title,
                    url=f"https://www.youtube.com/watch?v={vid_id}",
                    thumbnail_url=snippet.get("thumbnails", {}).get("high", {}).get("url", ""),
                    published_at=published_at,
                    status=status,
                    metrics={
                        "viewCount": video.get("statistics", {}).get("viewCount", "0"),
                        "likeCount": video.get("statistics", {}).get("likeCount", "0"),
                        "commentCount": video.get("statistics", {}).get("commentCount", "0")
                    }
                )
                
                db.add(content)
                db.commit()
                db.refresh(content)
                new_contents.append(content)
                
            except Exception as e:
                db.rollback()
                print(f"Error saving video {vid_id} from source {source.name}: {e}")
                
    return new_contents

@router.get("/", response_model=List[ContentResponse])
def list_videos(q: str = None, category: str = None, skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """
    Fetch active videos for the frontend timeline.
    Ordered by published_at DESC for a simple timeline.
    Optionally filter by keyword (title search).
    Optionally filter by category (genre).
    """
    query = db.query(Content).join(Source).filter(Content.status == ContentStatus.ACTIVE)
    
    if q:
        # Simple ILIKE search on title
        query = query.filter(Content.title.ilike(f"%{q}%"))
        
    if category:
        query = query.filter(Source.category == category)
        
    return query.order_by(Content.published_at.desc()).offset(skip).limit(limit).all()
