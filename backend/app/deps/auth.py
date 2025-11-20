from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.auth.jwt import verify_jwt

auth_scheme = HTTPBearer()

async def get_current_user(creds: HTTPAuthorizationCredentials = Depends(auth_scheme)) -> dict:
    # full claims (keep if you need email, etc.)
    return await verify_jwt(creds.credentials)

async def get_current_user_id(creds: HTTPAuthorizationCredentials = Depends(auth_scheme)) -> str:
    claims = await verify_jwt(creds.credentials)
    sub = claims.get("sub")
    if not sub:
        raise HTTPException(status_code=401, detail="Missing sub in token")
    return sub
