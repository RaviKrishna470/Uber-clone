from fastapi import APIRouter, status

from app.core.deps import DB, Actor, require_permission
from app.core.errors import NotFound
from app.core.permissions import P
from app.domains.fleet import service
from app.domains.fleet.schemas import AvailabilityIn, DriverApplyIn, DriverOut

router = APIRouter(prefix="/drivers", tags=["drivers"])

DriverSelf = require_permission(P.DRIVER_SELF)


@router.post("/apply", response_model=DriverOut, status_code=status.HTTP_201_CREATED)
async def apply(body: DriverApplyIn, db: DB, actor: Actor = DriverSelf):
    return await service.apply(db, actor.user, body)


@router.get("/me", response_model=DriverOut)
async def get_my_driver_profile(db: DB, actor: Actor = DriverSelf):
    driver = await service.get_driver_for_user(db, actor.user)
    if driver is None:
        raise NotFound("Driver profile not found")
    return driver


@router.patch("/me/availability", response_model=DriverOut)
async def set_availability(body: AvailabilityIn, db: DB, actor: Actor = DriverSelf):
    return await service.set_availability(db, actor.user, body.status)
