from tests.conftest import bearer, login, wrong_code


async def test_new_user_signup_and_onboarding(client):
    auth = await login(client, "9811111111")
    assert auth["is_new_user"] is True
    assert auth["user"]["roles"] == []

    h = bearer(auth["access_token"])
    r = await client.post("/me/onboarding", json={"name": "Asha", "role": "CUSTOMER"}, headers=h)
    assert r.status_code == 200
    assert r.json()["user"]["roles"] == ["CUSTOMER"]

    h = bearer(r.json()["access_token"])
    r = await client.post("/me/onboarding", json={"name": "Asha", "role": "DRIVER"}, headers=h)
    assert r.status_code == 409


async def test_cannot_self_assign_admin(client):
    auth = await login(client, "9822222222")
    h = bearer(auth["access_token"])
    r = await client.post("/me/onboarding", json={"name": "Evil", "role": "ADMIN"}, headers=h)
    assert r.status_code == 422


async def test_wrong_and_reused_otp_fail(client):
    phone = "9833333333"
    code = (await client.post("/auth/otp/request", json={"phone": phone})).json()["dev_code"]
    r = await client.post("/auth/otp/verify", json={"phone": phone, "code": wrong_code(code)})
    assert r.status_code == 400 and r.json()["error"]["code"] == "INVALID_OTP"
    assert (await client.post("/auth/otp/verify", json={"phone": phone, "code": code})).status_code == 200
    assert (await client.post("/auth/otp/verify", json={"phone": phone, "code": code})).status_code == 400


async def test_otp_attempt_budget(client):
    phone = "9844444444"
    code = (await client.post("/auth/otp/request", json={"phone": phone})).json()["dev_code"]
    for _ in range(5):
        await client.post("/auth/otp/verify", json={"phone": phone, "code": wrong_code(code)})
    r = await client.post("/auth/otp/verify", json={"phone": phone, "code": code})
    assert r.status_code == 429


async def test_resend_cooldown(client):
    await client.post("/auth/otp/request", json={"phone": "9855555555"})
    r = await client.post("/auth/otp/request", json={"phone": "9855555555"})
    assert r.status_code == 429 and r.headers["Retry-After"]


async def test_invalid_phone(client):
    r = await client.post("/auth/otp/request", json={"phone": "12345678"})
    assert r.status_code == 422 and r.json()["error"]["code"] == "INVALID_PHONE"


async def test_refresh_rotation_and_logout(client):
    auth = await login(client, "+919000000002")
    r = await client.post("/auth/refresh", json={"refresh_token": auth["refresh_token"]})
    assert r.status_code == 200
    new = r.json()
    # the rotated-out token no longer works
    assert (await client.post("/auth/refresh", json={"refresh_token": auth["refresh_token"]})).status_code == 401

    assert (await client.post("/auth/logout", headers=bearer(new["access_token"]))).status_code == 204
    assert (await client.get("/me", headers=bearer(new["access_token"]))).status_code == 401
    assert (await client.post("/auth/refresh", json={"refresh_token": new["refresh_token"]})).status_code == 401


async def test_unauthenticated(client):
    r = await client.get("/me")
    assert r.status_code == 401 and r.json()["error"]["code"] == "UNAUTHENTICATED"
    assert (await client.get("/me", headers=bearer("garbage"))).status_code == 401
