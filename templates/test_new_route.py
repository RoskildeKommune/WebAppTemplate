"""
TEMPLATE: Backend test for a new route module.

Kopier denne fil og erstat:
- "example" med det faktiske route-navn
- "/api/example" med den faktiske API-sti
- Tilpas mock data assertions til de faktiske felter

Navngivning: test_{route_name}.py  (fx test_robots.py)
Placering:   backend/tests/
"""


async def test_get_all_returns_list(client):
    response = await client.get("/api/example/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


async def test_get_all_response_shape(client):
    response = await client.get("/api/example/")
    data = response.json()
    item = data[0]
    # Tilpas disse felter til din model:
    assert "id" in item
    assert "name" in item
    assert "status" in item


async def test_get_by_id(client):
    response = await client.get("/api/example/1")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1


async def test_get_by_id_not_found(client):
    response = await client.get("/api/example/999")
    assert response.status_code == 404
