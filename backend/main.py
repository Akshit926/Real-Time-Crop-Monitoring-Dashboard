"""
AgroVision Backend — FastAPI application for crop disease prediction and chat.
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
import uuid

try:
    from .model import predictor
    from .chatbot import chatbot
    from .weather import get_weather
    from .ai_chat import get_ai_chat_response
except ImportError:
    try:  # Vercel / sys.path-based import
        from backend.model import predictor
        from backend.chatbot import chatbot
        from backend.weather import get_weather
        from backend.ai_chat import get_ai_chat_response
    except ImportError:  # pragma: no cover - bare local script execution
        from model import predictor  # type: ignore[no-redef]
        from chatbot import chatbot  # type: ignore[no-redef]
        from weather import get_weather  # type: ignore[no-redef]
        from ai_chat import get_ai_chat_response  # type: ignore[no-redef]

app = FastAPI(
    title="AgroVision API",
    description="AI-powered crop disease detection and agricultural advice",
    version="1.0.0"
)

# ── CORS ──────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Models ────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str
    lang: str = "en"
    weather: dict | None = None


class ChatResponse(BaseModel):
    response: str
    source: str = "local"


class WeatherResponse(BaseModel):
    location: str
    latitude: float
    longitude: float
    temperature_c: int
    wind_kph: int
    humidity: int
    precipitation_probability: int
    condition: str
    advice: str
    source: str


# ── Farm Zone Data (Simulated) ────────────────────────────────────
FARM_ZONES = [
    {
        "id": "A",
        "name": "Zone A — North Field",
        "crop": "Tomato",
        "status": "healthy",
        "health_percent": 94,
        "last_scan": "2026-04-09 10:30 AM",
        "area_acres": 2.5,
        "color": "#22c55e"
    },
    {
        "id": "B",
        "name": "Zone B — East Field",
        "crop": "Potato",
        "status": "warning",
        "health_percent": 71,
        "last_scan": "2026-04-09 09:15 AM",
        "area_acres": 3.0,
        "color": "#eab308"
    },
    {
        "id": "C",
        "name": "Zone C — South Field",
        "crop": "Corn",
        "status": "critical",
        "health_percent": 42,
        "last_scan": "2026-04-09 08:00 AM",
        "area_acres": 4.0,
        "color": "#ef4444"
    },
    {
        "id": "D",
        "name": "Zone D — West Field",
        "crop": "Rice",
        "status": "healthy",
        "health_percent": 88,
        "last_scan": "2026-04-08 04:45 PM",
        "area_acres": 5.0,
        "color": "#22c55e"
    },
    {
        "id": "E",
        "name": "Zone E — Central Plot",
        "crop": "Wheat",
        "status": "warning",
        "health_percent": 65,
        "last_scan": "2026-04-08 02:30 PM",
        "area_acres": 1.5,
        "color": "#eab308"
    },
    {
        "id": "F",
        "name": "Zone F — Orchard",
        "crop": "Apple",
        "status": "healthy",
        "health_percent": 91,
        "last_scan": "2026-04-09 11:00 AM",
        "area_acres": 2.0,
        "color": "#22c55e"
    }
]


# ── Endpoints ─────────────────────────────────────────────────────

@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "app": "AgroVision API", "version": "1.0.0"}


@app.get("/health")
async def health():
    """Dedicated health endpoint for deployment checks."""
    return {
        "status": "ok",
        "model_mode": "fallback" if getattr(predictor, "_fallback_mode", False) else "tensorflow",
    }


@app.post("/predict")
async def predict_disease(file: UploadFile = File(...)):
    """
    Predict crop disease from an uploaded image.
    
    Accepts: JPEG, PNG, WebP image files.
    Returns: Disease classification, confidence, and recommendations.
    """
    # Validate file type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Please upload an image (JPEG, PNG, or WebP)."
        )

    try:
        image_bytes = await file.read()
        if len(image_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty file uploaded.")

        result = predictor.predict(image_bytes)
        return result

    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Agricultural chatbot endpoint.
    
    Accepts: message (str) and lang ('en' or 'hi').
    Returns: AI-generated farming advice.
    """
    try:
        response, source = get_ai_chat_response(chatbot, request.message, request.lang, request.weather)
        return ChatResponse(response=response, source=source)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")


@app.get("/zones")
async def get_farm_zones():
    """Return simulated farm zone data."""
    return {"zones": FARM_ZONES}


@app.get("/weather", response_model=WeatherResponse)
async def weather_endpoint(lat: float | None = None, lon: float | None = None, lang: str = "en", location: str | None = None):
    """Return current field weather and lightweight farming advice."""
    try:
        return WeatherResponse(**get_weather(lat=lat, lon=lon, lang=lang, location_name=location))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Weather lookup failed: {str(e)}")


# ── Field Journal (In-Memory Store) ──────────────────────────────

# In-memory store — resets on server restart (replace with DB for persistence)
_journal_entries: list[dict] = [
    {
        "id": "demo-1",
        "crop": "Tomato",
        "status": "warning",
        "note": "Noticed yellowing on lower leaves in the north row. Could be early blight or nutrient deficiency. Scheduled follow-up scan.",
        "weather": "Cloudy",
        "zone": "Zone A",
        "tags": ["early-blight", "yellowing"],
        "timestamp": "2026-04-10T08:30:00+00:00",
    },
    {
        "id": "demo-2",
        "crop": "Wheat",
        "status": "healthy",
        "note": "Crops looking great after last week's irrigation. Good tillering observed. No signs of disease.",
        "weather": "Sunny",
        "zone": "Zone E",
        "tags": ["healthy", "irrigation"],
        "timestamp": "2026-04-09T14:15:00+00:00",
    },
    {
        "id": "demo-3",
        "crop": "Corn",
        "status": "critical",
        "note": "Significant lesions on multiple plants. Northern leaf blight confirmed by AI scan. Applied copper-based fungicide. Monitoring closely.",
        "weather": "Humid",
        "zone": "Zone C",
        "tags": ["northern-leaf-blight", "fungicide", "urgent"],
        "timestamp": "2026-04-09T09:00:00+00:00",
    },
]


class JournalEntryIn(BaseModel):
    crop: str
    status: str  # healthy | warning | critical | observation
    note: str
    weather: Optional[str] = "Sunny"
    zone: Optional[str] = ""
    tags: Optional[List[str]] = []


class JournalEntryOut(JournalEntryIn):
    id: str
    timestamp: str


@app.get("/journal")
async def get_journal():
    """Return all field journal entries (newest first)."""
    return {"entries": list(reversed(_journal_entries))}


@app.post("/journal", response_model=JournalEntryOut, status_code=201)
async def add_journal_entry(entry: JournalEntryIn):
    """Add a new field journal entry."""
    if not entry.note.strip():
        raise HTTPException(status_code=400, detail="Note cannot be empty.")
    if entry.status not in ("healthy", "warning", "critical", "observation"):
        raise HTTPException(status_code=400, detail="Invalid status value.")

    new_entry = {
        "id": str(uuid.uuid4()),
        "crop": entry.crop,
        "status": entry.status,
        "note": entry.note.strip(),
        "weather": entry.weather or "Sunny",
        "zone": entry.zone or "",
        "tags": entry.tags or [],
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    _journal_entries.append(new_entry)
    return new_entry


@app.delete("/journal/{entry_id}", status_code=204)
async def delete_journal_entry(entry_id: str):
    """Delete a journal entry by ID."""
    global _journal_entries
    original_len = len(_journal_entries)
    _journal_entries = [e for e in _journal_entries if e["id"] != entry_id]
    if len(_journal_entries) == original_len:
        raise HTTPException(status_code=404, detail="Entry not found.")


# ── Farm Task Manager (In-Memory Store) ──────────────────────────

_tasks: list[dict] = [
    {
        "id": "task-1",
        "title": "Irrigate Zone D (West Rice Field)",
        "description": "Apply 50mm of irrigation water to the rice crop. Check drainage outlets before starting.",
        "priority": "high",
        "category": "Irrigation",
        "zone": "Zone D — Rice",
        "status": "pending",
        "due_date": "2026-04-12",
        "created_at": "2026-04-11T04:00:00+00:00",
    },
    {
        "id": "task-2",
        "title": "Apply fungicide to Zone C (Corn)",
        "description": "Use copper-based fungicide as follow-up treatment for northern leaf blight. Target morning application.",
        "priority": "high",
        "category": "Spraying",
        "zone": "Zone C — Corn",
        "status": "in_progress",
        "due_date": "2026-04-11",
        "created_at": "2026-04-10T08:00:00+00:00",
    },
    {
        "id": "task-3",
        "title": "Scout Zone B for late blight progression",
        "description": "Walk-through scout for potato late blight. Check lower canopy first. Document with photos.",
        "priority": "medium",
        "category": "Scouting",
        "zone": "Zone B — Potato",
        "status": "pending",
        "due_date": "2026-04-13",
        "created_at": "2026-04-10T09:30:00+00:00",
    },
    {
        "id": "task-4",
        "title": "Apply NPK fertilizer to Zone E (Wheat)",
        "description": "Top-dress with urea at 50 kg/acre. Apply before rain forecast on Thursday.",
        "priority": "medium",
        "category": "Fertilization",
        "zone": "Zone E — Wheat",
        "status": "done",
        "due_date": "2026-04-10",
        "created_at": "2026-04-09T07:00:00+00:00",
    },
]


class TaskIn(BaseModel):
    title: str
    description: Optional[str] = ""
    priority: str = "medium"   # high | medium | low
    category: str = "Other"
    zone: Optional[str] = "All Zones"
    due_date: Optional[str] = None   # ISO date string YYYY-MM-DD


class TaskOut(TaskIn):
    id: str
    status: str
    created_at: str


@app.get("/tasks")
async def get_tasks():
    """Return all farm tasks (newest first)."""
    return {"tasks": list(reversed(_tasks))}


@app.post("/tasks", response_model=TaskOut, status_code=201)
async def create_task(task: TaskIn):
    """Create a new farm task."""
    if not task.title.strip():
        raise HTTPException(status_code=400, detail="Title cannot be empty.")
    if task.priority not in ("high", "medium", "low"):
        raise HTTPException(status_code=400, detail="Invalid priority.")

    new_task = {
        "id": str(uuid.uuid4()),
        "title": task.title.strip(),
        "description": (task.description or "").strip(),
        "priority": task.priority,
        "category": task.category,
        "zone": task.zone or "All Zones",
        "status": "pending",
        "due_date": task.due_date or None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    _tasks.append(new_task)
    return new_task


@app.patch("/tasks/{task_id}/status")
async def update_task_status(task_id: str, status: str):
    """Update the status of a task."""
    if status not in ("pending", "in_progress", "done"):
        raise HTTPException(status_code=400, detail="Invalid status.")
    for t in _tasks:
        if t["id"] == task_id:
            t["status"] = status
            return t
    raise HTTPException(status_code=404, detail="Task not found.")


@app.delete("/tasks/{task_id}", status_code=204)
async def delete_task(task_id: str):
    """Delete a task by ID."""
    global _tasks
    orig = len(_tasks)
    _tasks = [t for t in _tasks if t["id"] != task_id]
    if len(_tasks) == orig:
        raise HTTPException(status_code=404, detail="Task not found.")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
