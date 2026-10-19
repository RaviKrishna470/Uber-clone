"""Uniform error envelope: {"error": {"code", "message", "request_id"}}."""

import logging
import uuid
from contextvars import ContextVar

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger("app")

request_id_ctx: ContextVar[str] = ContextVar("request_id", default="-")


class AppError(Exception):
    def __init__(self, code: str, message: str, status_code: int = 400, details: dict | None = None):
        super().__init__(message)
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details


class Unauthorized(AppError):
    def __init__(self, message: str = "Authentication required", code: str = "UNAUTHENTICATED"):
        super().__init__(code, message, 401)


class Forbidden(AppError):
    def __init__(self, message: str = "You do not have permission to perform this action"):
        super().__init__("FORBIDDEN", message, 403)


class NotFound(AppError):
    def __init__(self, message: str = "Resource not found"):
        super().__init__("NOT_FOUND", message, 404)


class Conflict(AppError):
    def __init__(self, message: str, code: str = "CONFLICT"):
        super().__init__(code, message, 409)


class TooManyRequests(AppError):
    def __init__(self, message: str, retry_after: int | None = None):
        super().__init__("RATE_LIMITED", message, 429, {"retry_after": retry_after} if retry_after else None)


def _envelope(code: str, message: str, status: int, details: dict | None = None) -> JSONResponse:
    body = {"error": {"code": code, "message": message, "request_id": request_id_ctx.get()}}
    if details:
        body["error"]["details"] = details
    headers = {"Retry-After": str(details["retry_after"])} if details and details.get("retry_after") else None
    return JSONResponse(status_code=status, content=body, headers=headers)


def install_error_handlers(app: FastAPI) -> None:
    @app.middleware("http")
    async def request_id_middleware(request: Request, call_next):
        rid = request.headers.get("X-Request-Id") or uuid.uuid4().hex
        token = request_id_ctx.set(rid)
        try:
            response = await call_next(request)
        finally:
            request_id_ctx.reset(token)
        response.headers["X-Request-Id"] = rid
        return response

    @app.exception_handler(AppError)
    async def app_error_handler(_: Request, exc: AppError):
        return _envelope(exc.code, exc.message, exc.status_code, exc.details)

    @app.exception_handler(RequestValidationError)
    async def validation_handler(_: Request, exc: RequestValidationError):
        fields = [{"field": ".".join(str(p) for p in e["loc"][1:]), "message": e["msg"]} for e in exc.errors()]
        return _envelope("VALIDATION_ERROR", "Invalid input", 422, {"fields": fields})

    @app.exception_handler(StarletteHTTPException)
    async def http_handler(_: Request, exc: StarletteHTTPException):
        return _envelope("HTTP_ERROR", str(exc.detail), exc.status_code)

    @app.exception_handler(Exception)
    async def unhandled_handler(_: Request, exc: Exception):
        logger.exception("Unhandled error request_id=%s", request_id_ctx.get())
        return _envelope("INTERNAL_ERROR", "Something went wrong", 500)
