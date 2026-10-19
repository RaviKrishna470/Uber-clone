"""Idempotent seed: roles, permissions and test users for local development.

    python -m scripts.seed
"""

import asyncio

from sqlalchemy import select

from app.core.db import SessionLocal, engine
from app.core.permissions import PERMISSION_DESCRIPTIONS, ROLE_DESCRIPTIONS, ROLE_PERMISSIONS
from app.domains.fleet.models import ApprovalStatus, Driver, Vehicle
from app.domains.identity import repository as repo
from app.domains.identity.models import Permission, Role, RoleName, User

# Mock-OTP test accounts (login with these numbers; the OTP is printed in the API console in dev).
SEED_USERS = [
    {"phone": "+919000000001", "name": "Super Admin", "roles": [RoleName.SUPER_ADMIN, RoleName.ADMIN]},
    {"phone": "+919000000002", "name": "Test Customer", "roles": [RoleName.CUSTOMER]},
    {"phone": "+919000000003", "name": "Test Driver", "roles": [RoleName.DRIVER],
     "driver": {"license_number": "KA0120260001234",
                "vehicle": {"registration_number": "KA01AB1234", "vehicle_type": "CAR",
                            "make_model": "Maruti Dzire", "color": "White"}}},
]


async def seed() -> None:
    async with SessionLocal() as db:
        perms: dict[str, Permission] = {}
        for code, desc in PERMISSION_DESCRIPTIONS.items():
            p = await db.scalar(select(Permission).where(Permission.code == code))
            if p is None:
                p = Permission(code=code, description=desc)
                db.add(p)
            perms[code] = p
        await db.flush()

        for name, codes in ROLE_PERMISSIONS.items():
            role = await repo.get_role(db, name)
            if role is None:
                role = Role(name=name, description=ROLE_DESCRIPTIONS[name])
                db.add(role)
                await db.flush()
                await db.refresh(role, ["permissions"])
            role.permissions = [perms[c] for c in codes]
        await db.flush()

        for spec in SEED_USERS:
            user = await repo.get_user_by_phone(db, spec["phone"])
            if user is None:
                user = User(phone=spec["phone"], name=spec["name"])
                db.add(user)
                await db.flush()
                await db.refresh(user, ["roles"])
            for role_name in spec["roles"]:
                await repo.assign_role(db, user, await repo.get_role(db, role_name))

            if d := spec.get("driver"):
                driver = await db.scalar(select(Driver).where(Driver.user_id == user.id))
                if driver is None:
                    driver = Driver(user_id=user.id, license_number=d["license_number"],
                                    approval_status=ApprovalStatus.APPROVED)
                    db.add(driver)
                    await db.flush()
                    db.add(Vehicle(driver_id=driver.id, **d["vehicle"]))

        await db.commit()
    await engine.dispose()
    print("Seed complete:")
    for spec in SEED_USERS:
        print(f"  {spec['phone']}  {spec['name']:<14} {', '.join(spec['roles'])}")


if __name__ == "__main__":
    asyncio.run(seed())
