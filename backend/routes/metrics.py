"""
Metrics API endpoints.

Erstat mock data med rigtig beregning fra database.
"""

from fastapi import APIRouter

router = APIRouter(prefix="/api/metrics", tags=["metrics"])


@router.get("/")
async def get_dashboard_metrics():
    """Hent dashboard overview metrics."""
    # Mock data - erstat med rigtig beregning
    return {
        "flowsToday": 142,
        "successRate": 97.2,
        "activeRobots": 8,
        "errorsToday": 4,
    }
