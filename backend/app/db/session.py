import os
from contextlib import contextmanager
from typing import Generator, Optional
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker

_engine: Optional[Engine] = None
SessionLocal: Optional[sessionmaker] = None

def _build_engine():
    global _engine, SessionLocal
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        return None
    _engine = create_engine(db_url, pool_pre_ping=True)
    SessionLocal = sessionmaker(bind=_engine, autoflush=False, autocommit=False)
    return _engine

def get_engine() -> Optional[Engine]:
    global _engine
    if _engine is None:
        _engine = _build_engine()
    return _engine

def get_db() -> Generator:
    if SessionLocal is None and get_engine() is None:
        raise RuntimeError("DATABASE_URL not configured")
    db = SessionLocal()  # type: ignore[call-arg]
    try:
        yield db
    finally:
        db.close()
