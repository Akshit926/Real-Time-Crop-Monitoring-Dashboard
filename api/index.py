"""Vercel Python serverless entrypoint for the AgroVision API.

Vercel routes /api/* requests to this file with the full path preserved,
so we mount the FastAPI app and tell it to strip the /api prefix via root_path.
"""

import sys
import os

# Ensure the project root is on the path so 'backend' package can be found
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.main import app  # noqa: E402 — path must be set first

# Vercel passes /api/predict as the path. FastAPI routes are defined as /predict.
# We add a middleware to strip the /api prefix so routes resolve correctly.
from fastapi import Request  # noqa: E402
from fastapi.routing import APIRoute  # noqa: E402


@app.middleware("http")
async def strip_api_prefix(request: Request, call_next):
    """Strip the /api prefix that Vercel prepends to all serverless function calls."""
    scope = request.scope
    path: str = scope.get("path", "")
    if path.startswith("/api"):
        scope["path"] = path[4:] or "/"
        raw_path: bytes = scope.get("raw_path", path.encode())
        scope["raw_path"] = raw_path[4:] or b"/"
    return await call_next(request)


__all__ = ["app"]
