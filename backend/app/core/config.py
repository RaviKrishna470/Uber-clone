from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=BASE_DIR / ".env", extra="ignore")

    ENV: str = "development"
    APP_NAME: str = "Ride Booking API"

    DATABASE_URL: str

    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_TTL_MINUTES: int = 15
    REFRESH_TOKEN_TTL_DAYS: int = 30

    OTP_LENGTH: int = 6
    OTP_TTL_SECONDS: int = 300
    OTP_MAX_ATTEMPTS: int = 5
    OTP_RESEND_COOLDOWN_SECONDS: int = 30
    OTP_WINDOW_SECONDS: int = 900
    OTP_MAX_REQUESTS_PER_PHONE: int = 5
    OTP_MAX_REQUESTS_PER_IP: int = 20

    DEFAULT_PHONE_REGION: str = "IN"
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]

    @property
    def is_dev(self) -> bool:
        return self.ENV == "development"

    @property
    def sync_database_url(self) -> str:
        """Alembic runs synchronously through psycopg."""
        return self.DATABASE_URL.replace("+asyncpg", "+psycopg")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
