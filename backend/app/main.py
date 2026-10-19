import logging

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import admin, auth, drivers, users
from app.core.config import settings
from app.core.errors import install_error_handlers

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")

app = FastAPI(title=settings.APP_NAME, version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-Id"],
)
install_error_handlers(app)

v1 = APIRouter(prefix="/v1")
for module in (auth, users, drivers, admin):
    v1.include_router(module.router)
app.include_router(v1)


@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok"}
