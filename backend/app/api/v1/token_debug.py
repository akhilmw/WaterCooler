from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
from app.auth.jwt import _get_jwks  # reuse the cached fetcher

router = APIRouter(prefix="/debug", tags=["debug"])
bearer = HTTPBearer(auto_error=False)

@router.get("/kid")
async def debug_kid(creds: HTTPAuthorizationCredentials = Depends(bearer)):
    if not creds or creds.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")

    token = creds.credentials
    try:
        header = jwt.get_unverified_header(token)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Bad token header: {e}")

    kid = header.get("kid")
    alg = header.get("alg")
    jwks = await _get_jwks()
    jwks_kids = [k.get("kid") for k in jwks.get("keys", [])]

    return {"token_kid": kid, "token_alg": alg, "jwks_kids": jwks_kids}
