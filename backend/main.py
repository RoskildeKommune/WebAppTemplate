"""
RPA Dashboard Backend

Start serveren med:
    uvicorn main:app --reload

API dokumentation tilgængelig på:
    http://localhost:8000/docs
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routes
from routes.flows import router as flows_router
from routes.metrics import router as metrics_router

app = FastAPI(
    title="RPA Dashboard API",
    description="Backend API til RPA monitoring dashboard",
    version="0.1.0",
)

# CORS middleware (tillad frontend at kalde API'et)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrer routes
app.include_router(flows_router)
app.include_router(metrics_router)


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "message": "RPA Dashboard API"}


@app.get("/api/health")
async def health():
    """Detaljeret health check."""
    return {
        "status": "healthy",
        "version": "0.1.0",
    }
