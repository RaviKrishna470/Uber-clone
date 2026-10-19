"""Imports every model so Base.metadata is complete (used by Alembic)."""

from app.core.db import Base
from app.domains.fleet.models import Driver, Vehicle
from app.domains.identity.models import (
    AuditLog,
    OTPChallenge,
    Permission,
    RefreshSession,
    Role,
    User,
    UserRole,
    role_permissions,
)

__all__ = [
    "AuditLog",
    "Base",
    "Driver",
    "OTPChallenge",
    "Permission",
    "RefreshSession",
    "Role",
    "User",
    "UserRole",
    "Vehicle",
    "role_permissions",
]
