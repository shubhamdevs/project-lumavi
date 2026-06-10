import httpx
from fastapi import Depends, HTTPException, Query, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt, JWTError
from app.config import get_settings

bearer = HTTPBearer()
_jwks_cache: dict | None = None


async def _get_jwks() -> dict:
    global _jwks_cache
    if _jwks_cache:
        return _jwks_cache
    settings = get_settings()
    async with httpx.AsyncClient() as client:
        r = await client.get(settings.clerk_jwks_url)
        r.raise_for_status()
        _jwks_cache = r.json()
    return _jwks_cache


async def _decode_token(token: str) -> str:
    try:
        jwks = await _get_jwks()
        header = jwt.get_unverified_header(token)
        key = next(
            (k for k in jwks["keys"] if k.get("kid") == header.get("kid")),
            jwks["keys"][0],
        )
        payload = jwt.decode(token, key, algorithms=["RS256"])
        user_id: str = payload.get("sub", "")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return user_id
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


async def get_current_user_id(
    creds: HTTPAuthorizationCredentials = Depends(bearer),
) -> str:
    return await _decode_token(creds.credentials)


async def get_current_user_id_sse(
    _token: str | None = Query(default=None),
    token: str | None = Query(default=None),
    creds: HTTPAuthorizationCredentials | None = Depends(HTTPBearer(auto_error=False)),
) -> str:
    """Accepts token from query param (for EventSource) or Authorization header."""
    actual_token = _token or token or (creds.credentials if creds else None)
    if not actual_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return await _decode_token(actual_token)
