import uuid
from typing import Literal

from fastapi import APIRouter, Query

from app.core.deps import DB, Actor, require_permission
from app.core.permissions import P
from app.domains.identity.schemas import UserOut
from app.domains.operations import service
from app.domains.operations.schemas import (
    AccountStatusIn,
    AdminDriverOut,
    DashboardStats,
    DriverApprovalIn,
    Page,
)

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats", response_model=DashboardStats)
async def stats(db: DB, _: Actor = require_permission(P.ANALYTICS_READ)):
    return await service.dashboard_stats(db)


@router.get("/users", response_model=Page[UserOut])
async def list_users(
    db: DB,
    _: Actor = require_permission(P.USERS_READ),
    search: str | None = None,
    role: Literal["CUSTOMER", "DRIVER", "ADMIN", "SUPER_ADMIN"] | None = None,
    status: Literal["ACTIVE", "SUSPENDED", "DEACTIVATED"] | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    items, total = await service.list_users(
        db, search=search, role=role, status=status, page=page, page_size=page_size
    )
    return Page(items=[UserOut.model_validate(u) for u in items], total=total, page=page, page_size=page_size)


@router.patch("/users/{user_id}/status", response_model=UserOut)
async def set_user_status(
    user_id: uuid.UUID, body: AccountStatusIn, db: DB, actor: Actor = require_permission(P.USERS_MANAGE)
):
    return await service.set_user_status(db, actor.user, user_id, body.status)


@router.get("/drivers", response_model=Page[AdminDriverOut])
async def list_drivers(
    db: DB,
    _: Actor = require_permission(P.DRIVERS_READ),
    search: str | None = None,
    approval_status: Literal["PENDING", "APPROVED", "REJECTED", "SUSPENDED"] | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    items, total = await service.list_drivers(
        db, search=search, approval_status=approval_status, page=page, page_size=page_size
    )
    return Page(items=[AdminDriverOut.model_validate(d) for d in items], total=total, page=page, page_size=page_size)


@router.patch("/drivers/{driver_id}/approval", response_model=AdminDriverOut)
async def set_driver_approval(
    driver_id: uuid.UUID, body: DriverApprovalIn, db: DB, actor: Actor = require_permission(P.DRIVERS_APPROVE)
):
    return await service.set_driver_approval(db, actor.user, driver_id, body.status)
