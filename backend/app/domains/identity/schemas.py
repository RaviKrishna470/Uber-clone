import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class OTPRequestIn(BaseModel):
    phone: str = Field(min_length=8, max_length=20)


class OTPRequestOut(BaseModel):
    message: str
    expires_in: int
    resend_after: int
    dev_code: str | None = None  # only populated when ENV=development (mock OTP provider)


class OTPVerifyIn(BaseModel):
    phone: str = Field(min_length=8, max_length=20)
    code: str = Field(pattern=r"^\d{4,8}$")


class RefreshIn(BaseModel):
    refresh_token: str = Field(min_length=20)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    phone: str
    name: str | None
    email: str | None
    account_status: str
    roles: list[str] = Field(validation_alias="role_names")
    profile_complete: bool
    created_at: datetime


class TokenPairOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: Literal["bearer"] = "bearer"
    expires_in: int


class AuthOut(TokenPairOut):
    user: UserOut
    is_new_user: bool


class ProfileUpdateIn(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    email: EmailStr | None = None


class OnboardingIn(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    role: Literal["CUSTOMER", "DRIVER"]  # privileged roles are never self-assigned
    email: EmailStr | None = None


class OnboardingOut(BaseModel):
    user: UserOut
    access_token: str
    expires_in: int
