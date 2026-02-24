from app.db.session import Base

# Import all models here so Alembic can discover them
from app.models.source import Source
from app.models.content import Content
from app.models.user import User, Favorite, WatchHistory
