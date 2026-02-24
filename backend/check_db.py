from app.db.session import SessionLocal
from app.models.source import Source, SourceStatus
from app.models.content import Content

def main():
    db = SessionLocal()
    sources = db.query(Source).all()
    print(f"Total sources: {len(sources)}")
    approved = [s for s in sources if s.status == SourceStatus.APPROVED]
    print(f"Approved sources: {len(approved)}")
    contents = db.query(Content).all()
    print(f"Total videos: {len(contents)}")

if __name__ == "__main__":
    main()
