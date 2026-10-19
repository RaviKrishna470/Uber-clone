"""Admin queries, moderation actions and dashboard analytics."""

import uuid
from datetime import timedelta

from sqlalchemy import Date, cast, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import Forbidden, NotFound
from app.core.security import utcnow
from app.domains.fleet.models import ApprovalStatus, AvailabilityStatus, Driver
from app.domains.identity import repository as identity_repo
from app.domains.identity.models import RefreshSession, Role, RoleName, User, UserRole
from app.domains.operations.schemas import CountItem, DashboardStats


async def list_users(
    db: AsyncSession, *, search: str | None, role: str | None, status: str | None, page: int, page_size: int
) -> tuple[list[User], int]:
    stmt = select(User)
    if search:
        like = f"%{search.strip()}%"
        stmt = stmt.where(or_(User.phone.ilike(like), User.name.ilike(like), User.email.ilike(like)))
    if role:
        stmt = stmt.join(UserRole, UserRole.user_id == User.id).join(Role).where(Role.name == role)
    if status:
        stmt = stmt.where(User.account_status == status)

    total = await db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    rows = await db.scalars(stmt.order_by(User.created_at.desc()).offset((page - 1) * page_size).limit(page_size))
    return list(rows), total


async def set_user_status(db: AsyncSession, actor: User, user_id: uuid.UUID, status: str) -> User:
    user = await identity_repo.get_user(db, user_id)
    if user is None:
        raise NotFound("User not found")
    if user.id == actor.id:
        raise Forbidden("You cannot change your own account status")
    privileged = {RoleName.ADMIN, RoleName.SUPER_ADMIN}
    if privileged.intersection(user.role_names) and RoleName.SUPER_ADMIN not in actor.role_names:
        raise Forbidden("Only a super admin can change an administrator's status")

    before = user.account_status
    user.account_status = status
    if status != "ACTIVE":
        # Suspending/deactivating revokes every open session immediately.
        sessions = await db.scalars(
            select(RefreshSession).where(RefreshSession.user_id == user.id, RefreshSession.revoked_at.is_(None))
        )
        for s in sessions:
            s.revoked_at = utcnow()
    identity_repo.add_audit(
        db, actor_id=actor.id, entity_type="user", entity_id=str(user.id), action="user.status_changed",
        previous_state={"account_status": before}, new_state={"account_status": status},
    )
    await db.commit()
    await db.refresh(user)
    return user


async def list_drivers(
    db: AsyncSession, *, search: str | None, approval_status: str | None, page: int, page_size: int
) -> tuple[list[Driver], int]:
    stmt = select(Driver).join(User, User.id == Driver.user_id)
    if search:
        like = f"%{search.strip()}%"
        stmt = stmt.where(or_(User.phone.ilike(like), User.name.ilike(like), Driver.license_number.ilike(like)))
    if approval_status:
        stmt = stmt.where(Driver.approval_status == approval_status)

    total = await db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    rows = await db.scalars(stmt.order_by(Driver.created_at.desc()).offset((page - 1) * page_size).limit(page_size))
    return list(rows), total


async def set_driver_approval(db: AsyncSession, actor: User, driver_id: uuid.UUID, status: str) -> Driver:
    driver = await db.get(Driver, driver_id)
    if driver is None:
        raise NotFound("Driver not found")
    before = driver.approval_status
    driver.approval_status = status
    if status != ApprovalStatus.APPROVED:
        driver.availability_status = AvailabilityStatus.OFFLINE
    identity_repo.add_audit(
        db, actor_id=actor.id, entity_type="driver", entity_id=str(driver.id), action="driver.approval_changed",
        previous_state={"approval_status": before}, new_state={"approval_status": status},
    )
    await db.commit()
    await db.refresh(driver)
    return driver


async def dashboard_stats(db: AsyncSession) -> DashboardStats:
    total_users = await db.scalar(select(func.count(User.id))) or 0
    total_drivers = await db.scalar(select(func.count(Driver.id))) or 0
    pending = await db.scalar(select(func.count(Driver.id)).where(Driver.approval_status == ApprovalStatus.PENDING)) or 0
    online = await db.scalar(
        select(func.count(Driver.id)).where(Driver.availability_status == AvailabilityStatus.ONLINE)
    ) or 0

    by_role = await db.execute(
        select(Role.name, func.count(UserRole.user_id))
        .join(UserRole, UserRole.role_id == Role.id, isouter=True)
        .group_by(Role.name)
        .order_by(Role.name)
    )
    by_approval = await db.execute(
        select(Driver.approval_status, func.count(Driver.id)).group_by(Driver.approval_status)
    )

    today = utcnow().date()
    start = today - timedelta(days=6)
    day = cast(User.created_at, Date)
    signup_rows = dict(
        (await db.execute(select(day, func.count(User.id)).where(day >= start).group_by(day))).all()
    )
    signups = [
        CountItem(label=(start + timedelta(days=i)).isoformat(), value=signup_rows.get(start + timedelta(days=i), 0))
        for i in range(7)
    ]

    return DashboardStats(
        total_users=total_users,
        total_drivers=total_drivers,
        pending_drivers=pending,
        online_drivers=online,
        users_by_role=[CountItem(label=r, value=c) for r, c in by_role.all()],
        drivers_by_approval=[CountItem(label=s, value=c) for s, c in by_approval.all()],
        signups_last_7_days=signups,
    )
