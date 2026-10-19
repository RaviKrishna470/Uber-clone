from fastapi import APIRouter

from app.core.deps import DB, CurrentActor
from app.domains.identity import service
from app.domains.identity.schemas import OnboardingIn, OnboardingOut, ProfileUpdateIn, UserOut

router = APIRouter(prefix="/me", tags=["me"])


@router.get("", response_model=UserOut)
async def get_me(actor: CurrentActor):
    return actor.user


@router.patch("", response_model=UserOut)
async def update_me(body: ProfileUpdateIn, actor: CurrentActor, db: DB):
    return await service.update_profile(db, actor.user, body)


@router.post("/onboarding", response_model=OnboardingOut)
async def onboarding(body: OnboardingIn, actor: CurrentActor, db: DB):
    return await service.complete_onboarding(db, actor.user, actor.session.id, body)
