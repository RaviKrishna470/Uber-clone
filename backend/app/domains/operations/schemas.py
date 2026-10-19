from typing import Generic, Literal, TypeVar

from pydantic import BaseModel

from app.domains.fleet.schemas import DriverOut
from app.domains.identity.schemas import UserOut

T = TypeVar("T")


class Page(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int


class AccountStatusIn(BaseModel):
    status: Literal["ACTIVE", "SUSPENDED", "DEACTIVATED"]


class DriverApprovalIn(BaseModel):
    status: Literal["APPROVED", "REJECTED", "SUSPENDED"]


class AdminDriverOut(DriverOut):
    user: UserOut


class CountItem(BaseModel):
    label: str
    value: int


class DashboardStats(BaseModel):
    total_users: int
    total_drivers: int
    pending_drivers: int
    online_drivers: int
    users_by_role: list[CountItem]
    drivers_by_approval: list[CountItem]
    signups_last_7_days: list[CountItem]
