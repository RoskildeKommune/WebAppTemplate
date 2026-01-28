"""
TEMPLATE: Kopier denne fil og erstat:
- "example" med domæne navn (fx flows, robots, metrics)
- ExampleResponse/ExampleCreate med korrekte models
- Implementer faktisk logik i stedet for mock data

Husk at:
1. Oprette Pydantic models i /backend/models/
2. Importere og registrere router i /backend/main.py:
   from routes.example import router as example_router
   app.include_router(example_router)
3. Tilføje TypeScript types i /frontend/src/types/api.ts
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from datetime import datetime

# Importer dine models her:
# from models.example import ExampleResponse, ExampleCreate

router = APIRouter(prefix="/api/example", tags=["example"])


# ============================================
# Mock data - erstat med rigtig implementation
# ============================================

MOCK_DATA = [
    {"id": 1, "name": "Item 1", "status": "active", "created_at": "2024-01-15T10:00:00"},
    {"id": 2, "name": "Item 2", "status": "failed", "created_at": "2024-01-15T11:00:00"},
]


# ============================================
# GET endpoints
# ============================================

@router.get("/")
async def get_all(
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(100, ge=1, le=1000, description="Max antal resultater"),
    offset: int = Query(0, ge=0, description="Skip første N resultater"),
):
    """
    Hent alle items med optional filtrering og paginering.
    """
    results = MOCK_DATA

    # Filtrering
    if status:
        results = [item for item in results if item["status"] == status]

    # Paginering
    results = results[offset : offset + limit]

    return results


@router.get("/{item_id}")
async def get_by_id(item_id: int):
    """
    Hent enkelt item by ID.
    """
    for item in MOCK_DATA:
        if item["id"] == item_id:
            return item

    raise HTTPException(status_code=404, detail=f"Item med id {item_id} ikke fundet")


# ============================================
# POST endpoints
# ============================================

@router.post("/", status_code=201)
async def create(data: dict):  # Erstat dict med Pydantic model
    """
    Opret nyt item.
    """
    new_item = {
        "id": len(MOCK_DATA) + 1,
        **data,
        "created_at": datetime.now().isoformat(),
    }
    MOCK_DATA.append(new_item)
    return new_item


# ============================================
# PUT endpoints
# ============================================

@router.put("/{item_id}")
async def update(item_id: int, data: dict):  # Erstat dict med Pydantic model
    """
    Opdater eksisterende item.
    """
    for i, item in enumerate(MOCK_DATA):
        if item["id"] == item_id:
            MOCK_DATA[i] = {**item, **data}
            return MOCK_DATA[i]

    raise HTTPException(status_code=404, detail=f"Item med id {item_id} ikke fundet")


# ============================================
# DELETE endpoints
# ============================================

@router.delete("/{item_id}", status_code=204)
async def delete(item_id: int):
    """
    Slet item.
    """
    for i, item in enumerate(MOCK_DATA):
        if item["id"] == item_id:
            MOCK_DATA.pop(i)
            return

    raise HTTPException(status_code=404, detail=f"Item med id {item_id} ikke fundet")
