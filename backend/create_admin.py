import os
import app.db.base  # This ensures all models are loaded
from app.models.user import User, UserRole
from app.db.session import SessionLocal
from app.core.security import get_password_hash

def create_initial_admin():
    db = SessionLocal()
    admin_user = db.query(User).filter(User.username == "admin").first()
    if not admin_user:
        print("Creating default admin user...")
        user = User(
            username="admin",
            hashed_password=get_password_hash("password123"), # Default password
            account_name="管理者",
            birth_year_month="1990-01",
            role=UserRole.ADMIN
        )
        db.add(user)
        db.commit()
        print("Admin user created: username='admin', password='password123'")
    else:
        print("Admin user already exists.")
    db.close()

if __name__ == "__main__":
    create_initial_admin()
