"""
Shared test fixtures.

Provides an async HTTP client that talks directly to the FastAPI app
via httpx ASGITransport (no network needed).
"""

import pytest
from httpx import ASGITransport, AsyncClient
from main import app


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
