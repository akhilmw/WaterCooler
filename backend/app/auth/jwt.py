# backend/app/auth/jwt.py
from dotenv import load_dotenv
load_dotenv()

import os
import time
import httpx
from jose import jwt
from fastapi import HTTPException, status

SUPABASE_ISSUER = os.getenv("SUPABASE_ISSUER")
SUPABASE_AUDIENCE = os.getenv("SUPABASE_AUDIENCE", "authenticated")
SUPABASE_JWKS_URL = os.getenv("SUPABASE_JWKS_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

_JWKS = None
_JWKS_TS = 0
_JWKS_TTL = 60 * 10  # 10 minutes

async def _get_jwks():
    """Fetch JWKS with optional apikey header; cache it."""
    global _JWKS, _JWKS_TS
    now = time.time()
    if _JWKS and (now - _JWKS_TS) < _JWKS_TTL:
        return _JWKS
    if not SUPABASE_JWKS_URL:
        raise HTTPException(status_code=500, detail="JWKS URL not configured")

    headers = {}
    if SUPABASE_ANON_KEY:
        headers["apikey"] = SUPABASE_ANON_KEY  # <-- important for some setups

    try:
        async with httpx.AsyncClient(timeout=8) as client:
            r = await client.get(SUPABASE_JWKS_URL, headers=headers)
            if r.status_code == 401:
                # Make this explicit so we don't show a 500 to the client
                raise HTTPException(
                    status_code=500,
                    detail="Server cannot fetch JWKS (401). Check SUPABASE_ANON_KEY and JWKS URL."
                )
            r.raise_for_status()
            _JWKS = r.json()
            _JWKS_TS = now
            return _JWKS
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"JWKS fetch failed: {e}")

def _rsa_verify(token, public_key_jwk, algorithms=("RS256",)):
    try:
        return jwt.decode(
            token,
            public_key_jwk,
            algorithms=list(algorithms),
            audience=SUPABASE_AUDIENCE,
            issuer=SUPABASE_ISSUER,
            options={"verify_aud": True, "verify_iss": True},
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid token: {e}")

def _verify_hs256(token: str) -> dict:
    if not SUPABASE_JWT_SECRET:
        raise HTTPException(status_code=500, detail="Missing SUPABASE_JWT_SECRET")
    try:
        return jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience=SUPABASE_AUDIENCE,
            issuer=SUPABASE_ISSUER,
            options={"verify_aud": True, "verify_iss": True},
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid token: {e}")

async def verify_jwt(token: str) -> dict:
    if not SUPABASE_ISSUER:
        raise HTTPException(status_code=500, detail="Auth is not configured on the server")

    # Peek at header to branch on algorithm
    try:
        header = jwt.get_unverified_header(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Malformed token header")

    alg = header.get("alg")
    if alg == "HS256":
        return _verify_hs256(token)

    # (Optional) If you ever switch to RS256 in future, you can keep your old JWKS path here.
    raise HTTPException(status_code=400, detail=f"Unsupported token alg: {alg}")
