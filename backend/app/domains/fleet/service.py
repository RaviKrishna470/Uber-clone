from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import AppError, Conflict, NotFound
from app.domains.fleet.models import ApprovalStatus, AvailabilityStatus, Driver, Vehicle
from app.domains.fleet.schemas import DriverApplyIn
from app.domains.identity import repository as identity_repo
from app.domains.identity.models import User


async def get_driver_for_user(db: AsyncSession, user: User) -> Driver | None:
    return await db.scalar(select(Driver).where(Driver.user_id == user.id))


async def apply(db: AsyncSession, user: User, data: DriverApplyIn) -> Driver:
    if await get_driver_for_user(db, user):
        raise Conflict("Driver profile already exists", code="DRIVER_EXISTS")
    if await db.scalar(select(Vehicle.id).where(Vehicle.registration_number == data.vehicle.registration_number)):
        raise Conflict("This vehicle is already registered", code="VEHICLE_EXISTS")

    driver = Driver(user_id=user.id, license_number=data.license_number.strip().upper())
    db.add(driver)
    await db.flush()
    db.add(Vehicle(driver_id=driver.id, **data.vehicle.model_dump()))
    identity_repo.add_audit(
        db, actor_id=user.id, entity_type="driver", entity_id=str(driver.id),
        action="driver.applied", new_state={"approval_status": ApprovalStatus.PENDING},
    )
    await db.commit()
    await db.refresh(driver, ["vehicles"])
    return driver


async def set_availability(db: AsyncSession, user: User, status: str) -> Driver:
    driver = await get_driver_for_user(db, user)
    if driver is None:
        raise NotFound("Driver profile not found")
    if status == AvailabilityStatus.ONLINE and driver.approval_status != ApprovalStatus.APPROVED:
        raise AppError("DRIVER_NOT_APPROVED", "Your profile must be approved before going online", 403)
    if status == AvailabilityStatus.ONLINE and driver.active_vehicle is None:
        raise AppError("NO_ACTIVE_VEHICLE", "Add an active vehicle before going online", 422)
    driver.availability_status = status
    await db.commit()
    await db.refresh(driver)
    return driver
