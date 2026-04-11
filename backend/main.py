"""
AgroVision Backend — FastAPI application for crop disease prediction and chat.
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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


class DiseaseRiskResponse(BaseModel):
    level_code: str
    level: str
    score: int
    likely_diseases: list[str]
    reason: str


class IrrigationResponse(BaseModel):
    level_code: str
    level: str
    should_water: bool
    recommended_mm: float
    recommended_liters_m2: float
    rain_mm_next_24h: float
    recommendation: str


class ForecastPointResponse(BaseModel):
    time: str
    label: str
    temperature_c: int
    precipitation_probability: int
    rain_mm: float


class WeatherResponse(BaseModel):
    location: str
    latitude: float
    longitude: float
    temperature_c: int
    wind_kph: int
    humidity: int
    precipitation_probability: int
    rain_mm_next_24h: float
    condition: str
    advice: str
    disease_risk: DiseaseRiskResponse
    irrigation: IrrigationResponse
    forecast_next_hours: list[ForecastPointResponse]
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
