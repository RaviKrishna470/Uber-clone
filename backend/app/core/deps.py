"""Request dependencies: current actor and RBAC guards (authorization is always enforced here, never in UI)."""

import uuid
from dataclasses import dataclass
from typing import Annotated

import jwt
from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.errors import Forbidden, Unauthorized
from app.core.security import decode_access_token, utcnow
from app.domains.identity import repository as repo
from app.domains.identity.models import AccountStatus, RefreshSession, User

bearer = HTTPBearer(auto_error=False)

DB = Annotated[AsyncSession, Depends(get_db)]


@dataclass
class Actor:
    user: User
    session: RefreshSession

    @property
    def roles(self) -> set[str]:
        return set(self.user.role_names)

    @property
    def permissions(self) -> set[str]:
        return self.user.permission_codes


async def get_current_actor(
    db: DB, creds: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)]
) -> Actor:
    if creds is None:
        raise Unauthorized()
    try:
        payload = decode_access_token(creds.credentials)
    except jwt.ExpiredSignatureError:
        raise Unauthorized("Access token expired", code="TOKEN_EXPIRED")
    except jwt.InvalidTokenError:
        raise Unauthorized("Invalid access token", code="INVALID_TOKEN")

    session = await repo.get_session(db, uuid.UUID(payload["sid"]))
    if session is None or session.revoked_at is not None or session.expires_at <= utcnow():
        raise Unauthorized("Session expired. Please log in again.", code="SESSION_EXPIRED")

    user = await repo.get_user(db, uuid.UUID(payload["sub"]))
    if user is None or user.id != session.user_id:
        raise Unauthorized("Invalid access token", code="INVALID_TOKEN")
    if user.account_status != AccountStatus.ACTIVE:
        raise Forbidden("This account is not active")
    return Actor(user=user, session=session)


CurrentActor = Annotated[Actor, Depends(get_current_actor)]


def require_roles(*roles: str):
    async def guard(actor: CurrentActor) -> Actor:
        if not actor.roles.intersection(roles):
            raise Forbidden()
        return actor

    return Depends(guard)


def require_permission(code: str):
    async def guard(actor: CurrentActor) -> Actor:
        if code not in actor.permissions:
            raise Forbidden()
        return actor

    return Depends(guard)


def client_ip(request: Request) -> str | None:
    return request.client.host if request.client else None
