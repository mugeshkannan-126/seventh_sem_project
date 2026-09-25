from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import settings

# Normalize DATABASE_URL in case cloud providers use legacy postgres:// scheme
database_url = settings.DATABASE_URL
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

# Create engine with pool_pre_ping and pool_recycle for Supabase hosted Postgres
engine = create_engine(
    database_url,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=10,
    max_overflow=20,
)

# Set up local session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Standard SQLAlchemy 2.0 Base class
class Base(DeclarativeBase):
    pass

# DB dependency for FastAPI routers
def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

