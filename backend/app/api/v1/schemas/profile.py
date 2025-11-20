from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid

class ProfileIn(BaseModel):
    full_name: str
    headline: str
    location: Optional[str] = None
    avatar_url: Optional[str] = None
    good_at: Optional[str] = None
    need_help_with: Optional[str] = None
    want_to_help: Optional[str] = None
    audio_urls: Optional[list] = None

class ProfileOut(ProfileIn):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime