"""
TEMPLATE: Kopier denne fil og erstat:
- Example med domæne navn (fx Flow, Robot, Metric)
- Tilføj relevante felter

Husk at:
1. Importere models i route filen
2. Tilføje korresponderende TypeScript types i /frontend/src/types/api.ts
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from enum import Enum


# ============================================
# Enums (hvis relevant)
# ============================================

class ExampleStatus(str, Enum):
    """Mulige status værdier."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    FAILED = "failed"
    PENDING = "pending"


# ============================================
# Base model (fælles felter)
# ============================================

class ExampleBase(BaseModel):
    """Fælles felter for Example - bruges som base for andre models."""

    name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Navn på item",
        examples=["Mit flow"],
    )
    description: Optional[str] = Field(
        None,
        max_length=500,
        description="Valgfri beskrivelse",
    )
    status: ExampleStatus = Field(
        default=ExampleStatus.ACTIVE,
        description="Nuværende status",
    )


# ============================================
# Create model (request body til POST)
# ============================================

class ExampleCreate(ExampleBase):
    """Request model til oprettelse af nyt item."""
    pass


# ============================================
# Update model (request body til PUT/PATCH)
# ============================================

class ExampleUpdate(BaseModel):
    """Request model til opdatering - alle felter optional."""

    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    status: Optional[ExampleStatus] = None


# ============================================
# Response model (returneres fra API)
# ============================================

class ExampleResponse(ExampleBase):
    """Response model med alle felter inkl. auto-genererede."""

    id: int = Field(..., description="Unik ID")
    created_at: datetime = Field(..., description="Oprettelsestidspunkt")
    updated_at: Optional[datetime] = Field(None, description="Seneste opdatering")

    class Config:
        from_attributes = True  # Tillader konvertering fra ORM objekter


# ============================================
# List response (hvis paginering bruges)
# ============================================

class ExampleListResponse(BaseModel):
    """Pagineret liste response."""

    items: list[ExampleResponse]
    total: int = Field(..., description="Totalt antal items")
    limit: int = Field(..., description="Max antal returneret")
    offset: int = Field(..., description="Antal skippet")
