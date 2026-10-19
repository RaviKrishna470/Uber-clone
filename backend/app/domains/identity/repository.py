import uuid
from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.identity.models import AuditLog, OTPChallenge, RefreshSession, Role, User, UserRole


async def get_user(db: AsyncSession, user_id: uuid.UUID) -> User | None:
    return await db.get(User, user_id)


async def get_user_by_phone(db: AsyncSession, phone: str) -> User | None:
    return await db.scalar(select(User).where(User.phone == phone))


async def get_role(db: AsyncSession, name: str) -> Role | None:
    return await db.scalar(select(Role).where(Role.name == name))


async def assign_role(db: AsyncSession, user: User, role: Role, assigned_by: uuid.UUID | None = None) -> None:
    exists = await db.get(UserRole, (user.id, role.id))
    if not exists:
        db.add(UserRole(user_id=user.id, role_id=role.id, assigned_by=assigned_by))
        await db.flush()
        await db.refresh(user, ["roles"])


async def count_otp_requests(db: AsyncSession, *, since: datetime, phone: str | None = None, ip: str | None = None) -> int:
    stmt = select(func.count(OTPChallenge.id)).where(OTPChallenge.created_at >= since)
    if phone:
        stmt = stmt.where(OTPChallenge.phone == phone)
    if ip:
        stmt = stmt.where(OTPChallenge.ip_address == ip)
    return await db.scalar(stmt) or 0


async def latest_otp_challenge(db: AsyncSession, phone: str, *, for_update: bool = False) -> OTPChallenge | None:
    stmt = (
        select(OTPChallenge)
        .where(OTPChallenge.phone == phone, OTPChallenge.consumed_at.is_(None))
        .order_by(OTPChallenge.created_at.desc())
        .limit(1)
    )
    if for_update:
        stmt = stmt.with_for_update()
    return await db.scalar(stmt)


async def get_session_by_token_hash(db: AsyncSession, token_hash: str) -> RefreshSession | None:
    return await db.scalar(select(RefreshSession).where(RefreshSession.token_hash == token_hash).with_for_update())


async def get_session(db: AsyncSession, session_id: uuid.UUID) -> RefreshSession | None:
    return await db.get(RefreshSession, session_id)


def add_audit(
    db: AsyncSession,
    *,
    actor_id: uuid.UUID | None,
    entity_type: str,
    entity_id: str,
    action: str,
    previous_state: dict | None = None,
    new_state: dict | None = None,
) -> None:
    db.add(
        AuditLog(
            actor_id=actor_id,
            entity_type=entity_type,
            entity_id=entity_id,
            action=action,
            previous_state=previous_state,
            new_state=new_state,
        )
    )
