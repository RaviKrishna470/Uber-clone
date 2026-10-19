import uuid
from enum import StrEnum

from sqlalchemy import Boolean, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base, TimestampMixin
from app.domains.identity.models import User


class ApprovalStatus(StrEnum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    SUSPENDED = "SUSPENDED"


class AvailabilityStatus(StrEnum):
    OFFLINE = "OFFLINE"
    ONLINE = "ONLINE"


class VehicleType(StrEnum):
    BIKE = "BIKE"
    AUTO = "AUTO"
    CAR = "CAR"


class Vehicle(TimestampMixin, Base):
    __tablename__ = "vehicles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    driver_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("drivers.id", ondelete="CASCADE"), index=True)
    registration_number: Mapped[str] = mapped_column(String(20), unique=True)
    vehicle_type: Mapped[str] = mapped_column(String(10))
    make_model: Mapped[str | None] = mapped_column(String(100))
    color: Mapped[str | None] = mapped_column(String(30))
    active: Mapped[bool] = mapped_column(Boolean, default=True)


class Driver(TimestampMixin, Base):
    __tablename__ = "drivers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    license_number: Mapped[str] = mapped_column(String(30))
    approval_status: Mapped[str] = mapped_column(String(20), default=ApprovalStatus.PENDING)
    availability_status: Mapped[str] = mapped_column(String(20), default=AvailabilityStatus.OFFLINE)

    user: Mapped[User] = relationship(lazy="selectin")
    vehicles: Mapped[list[Vehicle]] = relationship(lazy="selectin", order_by=Vehicle.created_at)

    @property
    def active_vehicle(self) -> Vehicle | None:
        return next((v for v in self.vehicles if v.active), None)
