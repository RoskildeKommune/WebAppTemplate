"""Tests for /api/flows endpoints."""


async def test_get_flows_returns_list(client):
    response = await client.get("/api/flows/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 5


async def test_get_flows_response_shape(client):
    response = await client.get("/api/flows/")
    data = response.json()
    flow = data[0]
    assert "id" in flow
    assert "name" in flow
    assert "robot" in flow
    assert "status" in flow
    assert "lastRun" in flow
    assert "runs24h" in flow
    assert "successRate" in flow


async def test_get_flows_filter_by_status(client):
    response = await client.get("/api/flows/", params={"status": "success"})
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert all(f["status"] == "success" for f in data)


async def test_get_flows_filter_all_returns_everything(client):
    response = await client.get("/api/flows/", params={"status": "all"})
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 5


async def test_get_flows_filter_nonexistent_status(client):
    response = await client.get("/api/flows/", params={"status": "nonexistent"})
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 0


async def test_get_flows_limit(client):
    response = await client.get("/api/flows/", params={"limit": 2})
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


async def test_get_flow_by_id(client):
    response = await client.get("/api/flows/1")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1
    assert data["name"] == "Faktura behandling"


async def test_get_flow_detail_fields(client):
    response = await client.get("/api/flows/1")
    data = response.json()
    assert "description" in data
    assert "createdAt" in data


async def test_get_flow_not_found(client):
    response = await client.get("/api/flows/999")
    assert response.status_code == 404
