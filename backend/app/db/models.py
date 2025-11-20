from datetime import datetime
from typing import Optional, List
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.types import DateTime
import uuid

class Base(DeclarativeBase):
    pass

class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=text("timezone('utc', now())"),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=text("timezone('utc', now())"),
        nullable=False
    )
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    headline: Mapped[str] = mapped_column(String(200), nullable=False)
    location: Mapped[Optional[str]] = mapped_column(String(120))
    avatar_url: Mapped[Optional[str]] = mapped_column(String(400))
    good_at: Mapped[Optional[str]] = mapped_column(String(500))
    need_help_with: Mapped[Optional[str]] = mapped_column(String(500))
    want_to_help: Mapped[Optional[str]] = mapped_column(String(500))
    audio_urls: Mapped[Optional[dict]] = mapped_column(JSONB, server_default=text("'[]'::jsonb"))
