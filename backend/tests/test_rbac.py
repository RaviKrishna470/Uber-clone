from tests.conftest import bearer, login

CUSTOMER, DRIVER, ADMIN = "+919000000002", "+919000000003", "+919000000001"


async def test_customer_blocked_from_admin_and_driver_routes(client):
    h = bearer((await login(client, CUSTOMER))["access_token"])
    assert (await client.get("/admin/stats", headers=h)).status_code == 403
    assert (await client.get("/admin/users", headers=h)).status_code == 403
    assert (await client.get("/drivers/me", headers=h)).status_code == 403


async def test_admin_can_list_and_suspend(client):
    target = await login(client, "9866666666")
    await client.post(
        "/me/onboarding", json={"name": "Temp", "role": "CUSTOMER"}, headers=bearer(target["access_token"])
    )

    h = bearer((await login(client, ADMIN))["access_token"])
    r = await client.get("/admin/users", params={"search": "9866666666"}, headers=h)
    assert r.status_code == 200 and r.json()["total"] == 1
    user_id = r.json()["items"][0]["id"]

    assert (await client.patch(f"/admin/users/{user_id}/status", json={"status": "SUSPENDED"}, headers=h)).status_code == 200
    # the suspended account's open session is revoked
    assert (await client.get("/me", headers=bearer(target["access_token"]))).status_code == 401
    assert (await client.post("/auth/refresh", json={"refresh_token": target["refresh_token"]})).status_code == 401


async def test_driver_apply_needs_approval_before_online(client):
    auth = await login(client, "9877777777")
    r = await client.post(
        "/me/onboarding", json={"name": "New Driver", "role": "DRIVER"}, headers=bearer(auth["access_token"])
    )
    h = bearer(r.json()["access_token"])
    body = {
        "license_number": "KA0520260009999",
        "vehicle": {"registration_number": "ka 05 mn 4321", "vehicle_type": "AUTO"},
    }
    r = await client.post("/drivers/apply", json=body, headers=h)
    assert r.status_code == 201
    assert r.json()["approval_status"] == "PENDING"
    assert r.json()["active_vehicle"]["registration_number"] == "KA05MN4321"
    driver_id = r.json()["id"]

    r = await client.patch("/drivers/me/availability", json={"status": "ONLINE"}, headers=h)
    assert r.status_code == 403 and r.json()["error"]["code"] == "DRIVER_NOT_APPROVED"

    ha = bearer((await login(client, ADMIN))["access_token"])
    r = await client.patch(f"/admin/drivers/{driver_id}/approval", json={"status": "APPROVED"}, headers=ha)
    assert r.status_code == 200
    r = await client.patch("/drivers/me/availability", json={"status": "ONLINE"}, headers=h)
    assert r.status_code == 200 and r.json()["availability_status"] == "ONLINE"


async def test_seeded_driver_profile(client):
    h = bearer((await login(client, DRIVER))["access_token"])
    r = await client.get("/drivers/me", headers=h)
    assert r.status_code == 200 and r.json()["approval_status"] == "APPROVED"
