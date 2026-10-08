"""API entry point for the Fireflies clone."""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.meetings import router as meetings_router

app = FastAPI(
    title="Fireflies Clone API",
    version="0.1.0",
    description="Backend API for the meeting notes and transcript workspace.",
)

frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)
app.include_router(meetings_router)


@app.get("/api/health", tags=["health"])
def health_check() -> dict[str, str]:
    """Report that the API process is available."""
    return {"status": "ok", "service": "fireflies-clone-api"}
