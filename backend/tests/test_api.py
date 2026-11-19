import os
from collections.abc import AsyncIterator
from uuid import uuid4

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine


@pytest_asyncio.fixture
async def client(monkeypatch) -> AsyncIterator[AsyncClient]:
    test_url = os.getenv("AES_TEST_DATABASE_URL")
    if not test_url:
        pytest.skip("Set AES_TEST_DATABASE_URL to run PostgreSQL integration tests")
    if not test_url.startswith("postgresql+asyncpg://") or not (
        make_url(test_url).database or ""
    ).endswith("_test"):
        pytest.fail("AES_TEST_DATABASE_URL must target a dedicated *_test PostgreSQL database")

    from app.config import get_settings

    try:
        normal_url = get_settings().aes_database_url
    except Exception:
        normal_url = None
    if test_url == normal_url:
        pytest.fail("Test and application database URLs must be different")

    monkeypatch.setenv("AES_DATABASE_URL", test_url)
    monkeypatch.setenv("AES_ENVIRONMENT", "local")
    monkeypatch.setenv("AES_DEV_UNAUTHENTICATED", "true")
    get_settings.cache_clear()

    from app.db import get_session
    from app.main import app, require_local_access
    from app.models import Base

    test_engine = create_async_engine(test_url)
    test_sessions = async_sessionmaker(test_engine, expire_on_commit=False)

    # Destructive only in an explicitly separate, disposable *_test database.
    async with test_engine.begin() as connection:
        await connection.run_sync(Base.metadata.drop_all)
        await connection.run_sync(Base.metadata.create_all)

    async def override_session():
        async with test_sessions() as session:
            yield session

    async def override_access():
        return None

    app.dependency_overrides[get_session] = override_session
    app.dependency_overrides[require_local_access] = override_access

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as api:
        yield api

    app.dependency_overrides.clear()
    async with test_engine.begin() as connection:
        await connection.run_sync(Base.metadata.drop_all)
    await test_engine.dispose()
    get_settings.cache_clear()


@pytest.mark.asyncio
async def test_create_read_update_and_duplicate(client: AsyncClient, valid_payload: dict) -> None:
    external_case_id = f"TEST-{uuid4().hex}"
    url = f"/api/v1/aes-investigations/{external_case_id}"

    created = await client.post(url, json=valid_payload)
    assert created.status_code == 201, created.text
    assert created.json()["externalCaseId"] == external_case_id
    assert created.json()["payload"]["vaccinationHistory"]["doseByCard"] == 0

    duplicate = await client.post(url, json=valid_payload)
    assert duplicate.status_code == 409

    read = await client.get(url)
    assert read.status_code == 200
    assert read.json()["id"] == created.json()["id"]

    valid_payload["populationGroup"] = "non_tribal"
    updated = await client.put(url, json=valid_payload)
    assert updated.status_code == 200
    assert updated.json()["payload"]["populationGroup"] == "non_tribal"


@pytest.mark.asyncio
async def test_api_validation_errors(client: AsyncClient, valid_payload: dict) -> None:
    valid_payload["vaccinationHistory"]["doseByHistory"] = "0"
    response = await client.post("/api/v1/aes-investigations/TEST-BAD", json=valid_payload)
    assert response.status_code == 422
    assert any(
        item["field"] == "vaccinationHistory.doseByCard"
        for item in response.json()["errors"]
    )


@pytest.mark.asyncio
async def test_missing_record(client: AsyncClient) -> None:
    response = await client.get("/api/v1/aes-investigations/TEST-MISSING")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_missing_record(client: AsyncClient, valid_payload: dict) -> None:
    response = await client.put("/api/v1/aes-investigations/TEST-MISSING", json=valid_payload)
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_local_bypass_off_denies_access(client: AsyncClient) -> None:
    from app.main import app, require_local_access

    app.dependency_overrides.pop(require_local_access)
    try:
        # This exercise does not touch the database, so it checks the route gate itself.
        from app.main import settings

        was_allowed = settings.aes_dev_unauthenticated
        settings.aes_dev_unauthenticated = False
        try:
            response = await client.get("/api/v1/aes-investigations/TEST-PRIVATE")
            assert response.status_code == 503
        finally:
            settings.aes_dev_unauthenticated = was_allowed
    finally:
        app.dependency_overrides[require_local_access] = lambda: None
