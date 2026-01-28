"""Tests for /api/metrics endpoints."""


async def test_get_metrics_returns_data(client):
    response = await client.get("/api/metrics/")
    assert response.status_code == 200
    data = response.json()
    assert data is not None


async def test_get_metrics_response_shape(client):
    response = await client.get("/api/metrics/")
    data = response.json()
    assert "flowsToday" in data
    assert "successRate" in data
    assert "activeRobots" in data
    assert "errorsToday" in data


async def test_get_metrics_values_are_numeric(client):
    response = await client.get("/api/metrics/")
    data = response.json()
    assert isinstance(data["flowsToday"], (int, float))
    assert isinstance(data["successRate"], (int, float))
    assert isinstance(data["activeRobots"], (int, float))
    assert isinstance(data["errorsToday"], (int, float))
