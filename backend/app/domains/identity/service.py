import logging
from datetime import timedelta

import phonenumbers
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import security
from app.core.config import settings
from app.core.errors import AppError, Forbidden, TooManyRequests, Unauthorized
from app.domains.identity import repository as repo
from app.domains.identity.models import AccountStatus, OTPChallenge, RefreshSession, User
from app.domains.identity.schemas import (
    AuthOut,
    OnboardingIn,
    OnboardingOut,
    OTPRequestOut,
    ProfileUpdateIn,
    TokenPairOut,
    UserOut,
)

logger = logging.getLogger("app.identity")

def _invalid_otp() -> AppError:
    return AppError("INVALID_OTP", "The code is invalid or has expired", 400)


def normalize_phone(raw: str) -> str:
    """Return the phone in E.164 or raise INVALID_PHONE."""
    try:
        parsed = phonenumbers.parse(raw, settings.DEFAULT_PHONE_REGION)
    except phonenumbers.NumberParseException:
        parsed = None
    if parsed is None or not phonenumbers.is_valid_number(parsed):
        raise AppError("INVALID_PHONE", "Enter a valid phone number", 422)
    return phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)


# ---- OTP -------------------------------------------------------------------

async def request_otp(db: AsyncSession, raw_phone: str, ip: str | None) -> OTPRequestOut:
    phone = normalize_phone(raw_phone)
    now = security.utcnow()
    window_start = now - timedelta(seconds=settings.OTP_WINDOW_SECONDS)

    latest = await repo.latest_otp_challenge(db, phone)
    if latest:
        wait = settings.OTP_RESEND_COOLDOWN_SECONDS - int((now - latest.created_at).total_seconds())
        if wait > 0:
            raise TooManyRequests(f"Please wait {wait}s before requesting a new code", retry_after=wait)

    if await repo.count_otp_requests(db, since=window_start, phone=phone) >= settings.OTP_MAX_REQUESTS_PER_PHONE:
        raise TooManyRequests("Too many codes requested. Try again later.", retry_after=settings.OTP_WINDOW_SECONDS)
    if ip and await repo.count_otp_requests(db, since=window_start, ip=ip) >= settings.OTP_MAX_REQUESTS_PER_IP:
        raise TooManyRequests("Too many requests from this network. Try again later.")

    code = security.generate_otp()
    db.add(
        OTPChallenge(
            phone=phone,
            code_hash=security.hash_otp(phone, code),
            ip_address=ip,
            expires_at=now + timedelta(seconds=settings.OTP_TTL_SECONDS),
        )
    )
    await db.commit()

    # Mock OTP provider: in development the code is logged and returned so the app can be tested
    # without paid SMS. In any other environment it is never logged or returned.
    dev_code = None
    if settings.is_dev:
        logger.warning("[DEV OTP] %s -> %s", phone, code)
        dev_code = code
    # else: hand the code to the real SMS provider adapter here.

    return OTPRequestOut(
        message="If the number is valid, a code has been sent",
        expires_in=settings.OTP_TTL_SECONDS,
        resend_after=settings.OTP_RESEND_COOLDOWN_SECONDS,
        dev_code=dev_code,
    )


async def verify_otp(
    db: AsyncSession, raw_phone: str, code: str, ip: str | None, user_agent: str | None
) -> AuthOut:
    phone = normalize_phone(raw_phone)
    now = security.utcnow()

    challenge = await repo.latest_otp_challenge(db, phone, for_update=True)
    if challenge is None or challenge.expires_at <= now:
        raise _invalid_otp()
    if challenge.attempt_count >= settings.OTP_MAX_ATTEMPTS:
        raise TooManyRequests("Too many wrong attempts. Request a new code.")

    if not security.verify_otp_hash(phone, code, challenge.code_hash):
        challenge.attempt_count += 1
        await db.commit()
        raise _invalid_otp()

    challenge.consumed_at = now

    user = await repo.get_user_by_phone(db, phone)
    if user is None:
        user = User(phone=phone, account_status=AccountStatus.ACTIVE)
        db.add(user)
        await db.flush()
        await db.refresh(user, ["roles"])
        repo.add_audit(db, actor_id=user.id, entity_type="user", entity_id=str(user.id), action="user.registered")
    elif user.account_status != AccountStatus.ACTIVE:
        await db.commit()  # keep the OTP consumed
        raise Forbidden("This account is not active. Contact support.")

    tokens = await _open_session(db, user, ip, user_agent)
    await db.commit()
    return AuthOut(**tokens.model_dump(), user=UserOut.model_validate(user), is_new_user=not user.profile_complete)


# ---- Sessions ----------------------------------------------------------------

async def _open_session(db: AsyncSession, user: User, ip: str | None, user_agent: str | None) -> TokenPairOut:
    refresh = security.new_refresh_token()
    session = RefreshSession(
        user_id=user.id,
        token_hash=security.hash_token(refresh),
        ip_address=ip,
        user_agent=(user_agent or "")[:255] or None,
        expires_at=security.utcnow() + timedelta(days=settings.REFRESH_TOKEN_TTL_DAYS),
    )
    db.add(session)
    await db.flush()
    return TokenPairOut(
        access_token=security.create_access_token(user.id, session.id, user.role_names),
        refresh_token=refresh,
        expires_in=settings.ACCESS_TOKEN_TTL_MINUTES * 60,
    )


async def refresh_tokens(db: AsyncSession, refresh_token: str) -> TokenPairOut:
    """Rotate the refresh token: the old one stops working immediately."""
    now = security.utcnow()
    session = await repo.get_session_by_token_hash(db, security.hash_token(refresh_token))
    if session is None or session.revoked_at is not None or session.expires_at <= now:
        raise Unauthorized("Session expired. Please log in again.", code="SESSION_EXPIRED")

    user = await repo.get_user(db, session.user_id)
    if user is None or user.account_status != AccountStatus.ACTIVE:
        session.revoked_at = now
        await db.commit()
        raise Unauthorized("Session expired. Please log in again.", code="SESSION_EXPIRED")

    new_refresh = security.new_refresh_token()
    session.token_hash = security.hash_token(new_refresh)
    session.last_used_at = now
    await db.commit()
    return TokenPairOut(
        access_token=security.create_access_token(user.id, session.id, user.role_names),
        refresh_token=new_refresh,
        expires_in=settings.ACCESS_TOKEN_TTL_MINUTES * 60,
    )


async def logout(db: AsyncSession, session: RefreshSession) -> None:
    if session.revoked_at is None:
        session.revoked_at = security.utcnow()
        await db.commit()


# ---- Profile -----------------------------------------------------------------

async def update_profile(db: AsyncSession, user: User, data: ProfileUpdateIn) -> User:
    changes = data.model_dump(exclude_unset=True)
    before = {k: getattr(user, k) for k in changes}
    for key, value in changes.items():
        setattr(user, key, value)
    repo.add_audit(
        db, actor_id=user.id, entity_type="user", entity_id=str(user.id),
        action="user.profile_updated", previous_state=before, new_state=changes,
    )
    await db.commit()
    await db.refresh(user)
    return user


async def complete_onboarding(db: AsyncSession, user: User, session_id, data: OnboardingIn) -> OnboardingOut:
    if user.profile_complete:
        raise AppError("ALREADY_ONBOARDED", "Profile is already set up", 409)
    role = await repo.get_role(db, data.role)
    if role is None:
        raise AppError("ROLE_MISSING", "Role is not configured. Run the seed script.", 500)

    user.name = data.name.strip()
    if data.email:
        user.email = data.email
    await repo.assign_role(db, user, role)
    repo.add_audit(
        db, actor_id=user.id, entity_type="user", entity_id=str(user.id),
        action="user.onboarded", new_state={"name": user.name, "role": data.role},
    )
    await db.commit()
    await db.refresh(user)
    await db.refresh(user, ["roles"])
    return OnboardingOut(
        user=UserOut.model_validate(user),
        access_token=security.create_access_token(user.id, session_id, user.role_names),
        expires_in=settings.ACCESS_TOKEN_TTL_MINUTES * 60,
    )
