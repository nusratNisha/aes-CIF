from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Path, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.db import get_session
from app.schemas import AesRecordResponse, AesSubmission
from app.service import (
    AesDuplicateError,
    AesNotFoundError,
    as_response,
    create_investigation,
    get_investigation,
    replace_investigation,
)


settings = get_settings()
app = FastAPI(title="AES-CIF standalone API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.aes_cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT"],
    allow_headers=["Content-Type"],
)


async def require_local_access() -> None:
    """LOCAL ONLY. Replace with NDSS authentication and facility/case checks."""
    if settings.aes_environment != "local" or not settings.aes_dev_unauthenticated:
        raise HTTPException(status_code=503, detail="NDSS authorization integration is required")


SessionDep = Annotated[AsyncSession, Depends(get_session)]
AccessDep = Annotated[None, Depends(require_local_access)]
CaseId = Annotated[str, Path(min_length=1, max_length=128, pattern=r"^[A-Za-z0-9_-]+$")]


@app.exception_handler(RequestValidationError)
async def validation_error_handler(_request: Request, exc: RequestValidationError) -> JSONResponse:
    # Never include exc.body or error input: these may contain patient information.
    errors = [
        {
            "field": ".".join(str(part) for part in error["loc"] if part != "body"),
            "message": error["msg"],
        }
        for error in exc.errors()
    ]
    return JSONResponse(status_code=422, content={"message": "Validation failed", "errors": errors})


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post(
    "/api/v1/aes-investigations/{external_case_id}",
    response_model=AesRecordResponse,
    status_code=201,
)
async def create_aes(
    external_case_id: CaseId,
    payload: AesSubmission,
    session: SessionDep,
    _access: AccessDep,
) -> AesRecordResponse:
    try:
        record = await create_investigation(session, external_case_id, payload)
    except AesDuplicateError as exc:
        raise HTTPException(status_code=409, detail="AES investigation already exists") from exc
    return as_response(record)


@app.get(
    "/api/v1/aes-investigations/{external_case_id}",
    response_model=AesRecordResponse,
)
async def read_aes(
    external_case_id: CaseId,
    session: SessionDep,
    _access: AccessDep,
) -> AesRecordResponse:
    try:
        record = await get_investigation(session, external_case_id)
    except AesNotFoundError as exc:
        raise HTTPException(status_code=404, detail="AES investigation not found") from exc
    return as_response(record)


@app.put(
    "/api/v1/aes-investigations/{external_case_id}",
    response_model=AesRecordResponse,
)
async def update_aes(
    external_case_id: CaseId,
    payload: AesSubmission,
    session: SessionDep,
    _access: AccessDep,
) -> AesRecordResponse:
    try:
        record = await replace_investigation(session, external_case_id, payload)
    except AesNotFoundError as exc:
        raise HTTPException(status_code=404, detail="AES investigation not found") from exc
    return as_response(record)
