from fastapi import APIRouter, Request, status

from app.core.deps import DB, CurrentActor, client_ip
from app.domains.identity import service
from app.domains.identity.schemas import AuthOut, OTPRequestIn, OTPRequestOut, OTPVerifyIn, RefreshIn, TokenPairOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/otp/request", response_model=OTPRequestOut)
async def request_otp(body: OTPRequestIn, request: Request, db: DB):
    return await service.request_otp(db, body.phone, client_ip(request))


@router.post("/otp/verify", response_model=AuthOut)
async def verify_otp(body: OTPVerifyIn, request: Request, db: DB):
    return await service.verify_otp(db, body.phone, body.code, client_ip(request), request.headers.get("user-agent"))


@router.post("/refresh", response_model=TokenPairOut)
async def refresh(body: RefreshIn, db: DB):
    return await service.refresh_tokens(db, body.refresh_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(actor: CurrentActor, db: DB):
    await service.logout(db, actor.session)
