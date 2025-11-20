import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.db.session import get_db
from app.db.models import Profile
from app.deps.auth import get_current_user_id
from app.api.v1.schemas.profile import ProfileIn, ProfileOut
from fastapi import HTTPException

router = APIRouter()

@router.get("/profile/me", response_model=ProfileOut)
def get_my_profile(db: Session = Depends(get_db), uid: str = Depends(get_current_user_id)):
    row = db.execute(select(Profile).where(Profile.id == uid)).scalar_one_or_none()
    if row is None:
        raise HTTPException(404, "profile not found")
    return row

@router.post("/profile", response_model=ProfileOut)
def create_my_profile(
    payload: ProfileIn,
    db: Session = Depends(get_db),
    uid: str = Depends(get_current_user_id),
):
    existing = db.execute(select(Profile).where(Profile.id == uid)).scalar_one_or_none()
    if existing:
        # update instead of duplicate (optional)
        for k, v in payload.model_dump(exclude_unset=True).items():
            setattr(existing, k, v)
        db.commit()
        db.refresh(existing)
        return existing

    profile = Profile(
        id=uuid.UUID(uid) if len(uid) == 36 else uuid.UUID(uid),  # uid is a UUID string
        full_name=payload.full_name,
        headline=payload.headline,
        location=payload.location,
        avatar_url=payload.avatar_url,
        good_at=payload.good_at,
        need_help_with=payload.need_help_with,
        want_to_help=payload.want_to_help,
        audio_urls=payload.audio_urls or [],
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.patch("", response_model=ProfileOut)
def update_my_profile(payload: ProfileIn, user=Depends(get_current_user_id), db: Session = Depends(get_db)):
    uid = user.get("sub")
    row = db.get(Profile, uid)
    if not row:
        raise HTTPException(status_code=404, detail="Profile not found")

    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)

    return ProfileOut(
        id=str(row.id),
        full_name=row.full_name,
        headline=row.headline,
        location=row.location,
        avatar_url=row.avatar_url,
        good_at=row.good_at,
        need_help_with=row.need_help_with,
        want_to_help=row.want_to_help,
        audio_urls=row.audio_urls,
    )
