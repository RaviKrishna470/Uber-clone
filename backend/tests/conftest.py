import os

from dotenv import dotenv_values

# Point the app at the test database before any app module is imported.
# Uses TEST_DATABASE_URL if set, otherwise the .env DATABASE_URL with the database renamed to *_test.
_env = dotenv_values(os.path.join(os.path.dirname(__file__), "..", ".env"))
_base_url = os.environ.get("DATABASE_URL") or _env.get("DATABASE_URL", "")
os.environ["DATABASE_URL"] = os.environ.get("TEST_DATABASE_URL") or _base_url.rsplit("/", 1)[0] + "/ride_booking_test"
os.environ["ENV"] = "development"  # mock OTP returns dev_code

import httpx  # noqa: E402
import pytest  # noqa: E402

from app.core.db import engine  # noqa: E402
from app.main import app  # noqa: E402
from app.models import Base  # noqa: E402
from scripts.seed import seed  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
async def database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    await seed()
    yield
    await engine.dispose()


@pytest.fixture
async def client():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test/v1") as c:
        yield c


async def login(client: httpx.AsyncClient, phone: str) -> dict:
    r = await client.post("/auth/otp/request", json={"phone": phone})
    assert r.status_code == 200, r.text
    r = await client.post("/auth/otp/verify", json={"phone": phone, "code": r.json()["dev_code"]})
    assert r.status_code == 200, r.text
    return r.json()


def bearer(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def wrong_code(code: str) -> str:
    return "111111" if code != "111111" else "222222"
