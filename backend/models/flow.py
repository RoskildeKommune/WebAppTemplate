from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from enum import Enum


class FlowStatus(str, Enum):
    SUCCESS = "success"
    RUNNING = "running"
    FAILED = "failed"
    IDLE = "idle"


class FlowBase(BaseModel):
    """Basis felter for Flow."""

    name: str = Field(..., min_length=1, max_length=200)
    robot: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None


class FlowResponse(FlowBase):
    """Response model for flow liste."""

    id: int
    status: FlowStatus
    lastRun: str = Field(..., alias="last_run")
    runs24h: int = Field(..., alias="runs_24h")
    successRate: float = Field(..., alias="success_rate")

    class Config:
        from_attributes = True
        populate_by_name = True


class FlowDetailResponse(FlowResponse):
    """Detaljeret flow response."""

    createdAt: datetime = Field(..., alias="created_at")
    updatedAt: Optional[datetime] = Field(None, alias="updated_at")
