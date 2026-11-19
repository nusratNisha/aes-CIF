import os

import pytest
from fastapi import HTTPException


@pytest.mark.asyncio
async def test_api_requires_ndss_integration_outside_local_mode(monkeypatch) -> None:
    monkeypatch.setenv(
        "AES_DATABASE_URL",
        os.getenv(
            "AES_DATABASE_URL",
            "postgresql+asyncpg://test:test@127.0.0.1:5432/aes_cif_test",
        ),
    )
    from app.main import require_local_access, settings

    original_environment = settings.aes_environment
    original_bypass = settings.aes_dev_unauthenticated
    try:
        settings.aes_environment = "production"
        settings.aes_dev_unauthenticated = False
        with pytest.raises(HTTPException) as exc_info:
            await require_local_access()
        assert exc_info.value.status_code == 503
    finally:
        settings.aes_environment = original_environment
        settings.aes_dev_unauthenticated = original_bypass
