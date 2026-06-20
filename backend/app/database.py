from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_recycle=3600,
    pool_size=10,
    max_overflow=20,
    echo=settings.debug,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all tables defined in models."""
    import app.models  # noqa: F401 – ensure all models are imported
    Base.metadata.create_all(bind=engine)
    print("Database tables created.")


def check_connection():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print(f"Connected to MySQL: {settings.db_name}")
        return True
    except Exception as exc:
        print(f"Database connection failed: {exc}")
        return False

