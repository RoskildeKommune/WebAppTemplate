from pydantic import BaseModel, Field


class DashboardMetrics(BaseModel):
    """Dashboard overview metrics."""

    flowsToday: int = Field(..., alias="flows_today", description="Antal flow kørsler i dag")
    successRate: float = Field(..., alias="success_rate", description="Success rate i procent")
    activeRobots: int = Field(..., alias="active_robots", description="Antal aktive robotter")
    errorsToday: int = Field(..., alias="errors_today", description="Antal fejl i dag")

    class Config:
        populate_by_name = True
