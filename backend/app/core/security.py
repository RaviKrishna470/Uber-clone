import hashlib
import hmac
import secrets
import uuid
from datetime import UTC, datetime, timedelta

import jwt

from app.core.config import settings


def utcnow() -> datetime:
    return datetime.now(UTC)


# ---- OTP -------------------------------------------------------------------

def generate_otp() -> str:
    return "".join(secrets.choice("0123456789") for _ in range(settings.OTP_LENGTH))


def hash_otp(phone: str, code: str) -> str:
    """HMAC bound to the phone, so a leaked hash cannot be replayed for another number."""
    return hmac.new(settings.JWT_SECRET.encode(), f"{phone}:{code}".encode(), hashlib.sha256).hexdigest()


def verify_otp_hash(phone: str, code: str, code_hash: str) -> bool:
    return hmac.compare_digest(hash_otp(phone, code), code_hash)


# ---- Refresh tokens ----------------------------------------------------------

def new_refresh_token() -> str:
    return secrets.token_urlsafe(48)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


# ---- Access JWT --------------------------------------------------------------

def create_access_token(user_id: uuid.UUID, session_id: uuid.UUID, roles: list[str]) -> str:
    now = utcnow()
    payload = {
        "sub": str(user_id),
        "sid": str(session_id),
        "roles": roles,
        "type": "access",
        "iat": now,
        "exp": now + timedelta(minutes=settings.ACCESS_TOKEN_TTL_MINUTES),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    if payload.get("type") != "access":
        raise jwt.InvalidTokenError("Not an access token")
    return payload
