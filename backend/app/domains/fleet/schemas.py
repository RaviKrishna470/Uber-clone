import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class VehicleIn(BaseModel):
    registration_number: str = Field(min_length=4, max_length=20)
    vehicle_type: Literal["BIKE", "AUTO", "CAR"]
    make_model: str | None = Field(default=None, max_length=100)
    color: str | None = Field(default=None, max_length=30)

    @field_validator("registration_number")
    @classmethod
    def normalize_reg(cls, v: str) -> str:
        return "".join(v.split()).upper()


class VehicleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    registration_number: str
    vehicle_type: str
    make_model: str | None
    color: str | None
    active: bool


class DriverApplyIn(BaseModel):
    license_number: str = Field(min_length=5, max_length=30)
    vehicle: VehicleIn


class DriverOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    license_number: str
    approval_status: str
    availability_status: str
    active_vehicle: VehicleOut | None
    created_at: datetime


class AvailabilityIn(BaseModel):
    status: Literal["ONLINE", "OFFLINE"]
