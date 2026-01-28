"""
Flows API endpoints.

Erstat mock data med rigtig database integration.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/api/flows", tags=["flows"])


# ============================================
# Mock data - erstat med database
# ============================================

MOCK_FLOWS = [
    {
        "id": 1,
        "name": "Faktura behandling",
        "robot": "Robot-01",
        "status": "success",
        "last_run": "14:32",
        "runs_24h": 45,
        "success_rate": 97.8,
        "description": "Behandler indgående fakturaer fra e-mail",
        "created_at": datetime(2024, 1, 1, 10, 0, 0),
    },
    {
        "id": 2,
        "name": "Kunde oprettelse",
        "robot": "Robot-02",
        "status": "success",
        "last_run": "14:15",
        "runs_24h": 38,
        "success_rate": 100.0,
        "description": "Opretter nye kunder i CRM fra webformular",
        "created_at": datetime(2024, 1, 5, 14, 30, 0),
    },
    {
        "id": 3,
        "name": "Rapport generering",
        "robot": "Robot-01",
        "status": "running",
        "last_run": "14:30",
        "runs_24h": 29,
        "success_rate": 96.5,
        "description": "Genererer daglige salgsrapporter",
        "created_at": datetime(2024, 1, 10, 9, 0, 0),
    },
    {
        "id": 4,
        "name": "Email parsing",
        "robot": "Robot-03",
        "status": "failed",
        "last_run": "14:32",
        "runs_24h": 12,
        "success_rate": 83.3,
        "description": "Parser og kategoriserer indgående mails",
        "created_at": datetime(2024, 1, 15, 11, 0, 0),
    },
    {
        "id": 5,
        "name": "SAP integration",
        "robot": "Robot-02",
        "status": "idle",
        "last_run": "11:15",
        "runs_24h": 8,
        "success_rate": 87.5,
        "description": "Synkroniserer data mellem systemer og SAP",
        "created_at": datetime(2024, 1, 20, 8, 0, 0),
    },
]


# ============================================
# Endpoints
# ============================================

@router.get("/")
async def get_flows(
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(100, ge=1, le=1000),
):
    """Hent alle flows med optional status filter."""
    results = MOCK_FLOWS

    if status and status != "all":
        results = [f for f in results if f["status"] == status]

    return [
        {
            "id": f["id"],
            "name": f["name"],
            "robot": f["robot"],
            "status": f["status"],
            "lastRun": f["last_run"],
            "runs24h": f["runs_24h"],
            "successRate": f["success_rate"],
        }
        for f in results[:limit]
    ]


@router.get("/{flow_id}")
async def get_flow(flow_id: int):
    """Hent enkelt flow by ID."""
    for flow in MOCK_FLOWS:
        if flow["id"] == flow_id:
            return {
                "id": flow["id"],
                "name": flow["name"],
                "robot": flow["robot"],
                "status": flow["status"],
                "lastRun": flow["last_run"],
                "runs24h": flow["runs_24h"],
                "successRate": flow["success_rate"],
                "description": flow.get("description"),
                "createdAt": flow["created_at"].isoformat(),
            }

    raise HTTPException(status_code=404, detail=f"Flow med id {flow_id} ikke fundet")
