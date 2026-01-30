"""
RPA Dashboard Backend

Start serveren med:
    uvicorn main:app --reload

API dokumentation tilgængelig på:
    http://localhost:8000/docs
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

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


@app.get("/api/health")
async def health():
    """Detaljeret health check."""
    return {
        "status": "healthy",
        "version": "0.1.0",
    }


# Serve static frontend files (if they exist - created during deployment)
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    # Mount assets directory for JS, CSS, images
    assets_dir = os.path.join(static_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """Serve the React SPA for all non-API routes."""
        # Serve static file if it exists
        file_path = os.path.join(static_dir, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        # Otherwise serve index.html (SPA routing)
        return FileResponse(os.path.join(static_dir, "index.html"))
else:
    # No static files - serve API-only response at root
    @app.get("/")
    async def root():
        """Health check endpoint."""
        return {"status": "ok", "message": "RPA Dashboard API"}
