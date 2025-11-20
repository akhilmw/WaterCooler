from fastapi import APIRouter, Depends
from app.deps.auth import get_current_user

router = APIRouter(prefix="/me", tags=["auth"])

@router.get("")
async def me(user=Depends(get_current_user)):
    # Supabase tokens include 'sub', and often 'email' in 'user_metadata' or 'email' claim
    # We’ll safely pick a few common fields
    return {
        "sub": user.get("sub"),
        "email": user.get("email") or user.get("user_metadata", {}).get("email"),
        "role": user.get("role"),
        "aud": user.get("aud"),
        "iss": user.get("iss"),
    }
