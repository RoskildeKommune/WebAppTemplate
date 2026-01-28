"""Tests for health check endpoints in main.py."""


async def test_root_returns_ok(client):
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


async def test_health_returns_version(client):
    response = await client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
