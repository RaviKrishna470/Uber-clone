"""Single source of truth for RBAC. The seed script writes this matrix into the database."""

from app.domains.identity.models import RoleName


class P:
    PROFILE_OWN = "profile:own"
    RIDES_REQUEST = "rides:request"
    RIDES_READ_OWN = "rides:read_own"
    DRIVER_SELF = "driver:self"
    USERS_READ = "users:read"
    USERS_MANAGE = "users:manage"
    DRIVERS_READ = "drivers:read"
    DRIVERS_APPROVE = "drivers:approve"
    VEHICLES_MANAGE = "vehicles:manage"
    RIDES_READ_ALL = "rides:read_all"
    RIDES_MANAGE = "rides:manage"
    FARE_MANAGE = "fare:manage"
    ANALYTICS_READ = "analytics:read"
    ADMINS_MANAGE = "admins:manage"
    ROLES_MANAGE = "roles:manage"
    SETTINGS_MANAGE = "settings:manage"


PERMISSION_DESCRIPTIONS = {
    P.PROFILE_OWN: "View and update own profile",
    P.RIDES_REQUEST: "Request and cancel own rides",
    P.RIDES_READ_OWN: "View own ride history",
    P.DRIVER_SELF: "Manage own driver profile, availability and trips",
    P.USERS_READ: "View customers and users",
    P.USERS_MANAGE: "Suspend / reactivate users",
    P.DRIVERS_READ: "View drivers",
    P.DRIVERS_APPROVE: "Approve, reject or suspend drivers",
    P.VEHICLES_MANAGE: "Manage vehicles",
    P.RIDES_READ_ALL: "View all rides",
    P.RIDES_MANAGE: "Intervene in rides",
    P.FARE_MANAGE: "Manage fare configuration",
    P.ANALYTICS_READ: "View dashboards and analytics",
    P.ADMINS_MANAGE: "Manage administrators",
    P.ROLES_MANAGE: "Assign and revoke roles",
    P.SETTINGS_MANAGE: "Change system-wide settings",
}

_ADMIN = [
    P.PROFILE_OWN, P.USERS_READ, P.USERS_MANAGE, P.DRIVERS_READ, P.DRIVERS_APPROVE, P.VEHICLES_MANAGE,
    P.RIDES_READ_ALL, P.RIDES_MANAGE, P.FARE_MANAGE, P.ANALYTICS_READ,
]

ROLE_PERMISSIONS: dict[str, list[str]] = {
    RoleName.CUSTOMER: [P.PROFILE_OWN, P.RIDES_REQUEST, P.RIDES_READ_OWN],
    RoleName.DRIVER: [P.PROFILE_OWN, P.DRIVER_SELF],
    RoleName.ADMIN: _ADMIN,
    RoleName.SUPER_ADMIN: _ADMIN + [P.ADMINS_MANAGE, P.ROLES_MANAGE, P.SETTINGS_MANAGE],
}

ROLE_DESCRIPTIONS = {
    RoleName.CUSTOMER: "Books rides",
    RoleName.DRIVER: "Accepts and completes rides",
    RoleName.ADMIN: "Operates the platform",
    RoleName.SUPER_ADMIN: "Manages administrators and sensitive settings",
}
