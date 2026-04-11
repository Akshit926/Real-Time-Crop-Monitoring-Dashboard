"""AI-assisted chat service with Google/Groq support and graceful local fallback."""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any
from urllib.request import Request, urlopen

try:
    from dotenv import load_dotenv

    current_dir = Path(__file__).resolve().parent
    load_dotenv(current_dir.parent / ".env")
    load_dotenv(current_dir / ".env")
except Exception:
    pass


OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GOOGLE_API_URL = "https://generativelanguage.googleapis.com/v1beta/models"

PROJECT_KEYWORDS = {
    "agrovision",
    "crop",
    "disease",
    "leaf",
    "plant",
    "farm",
    "weather",
    "zone",
    "analysis",
    "dashboard",
    "predict",
    "chatbot",
    "fertilizer",
    "irrigation",
    "blight",
    "pest",
    "farming",
    "कृषि",
    "फसल",
    "मौसम",
    "रोग",
}


def _is_summary_request(message: str) -> bool:
    message_lower = message.lower()
    summary_markers = ["summar", "summary", "overview", "project summary", "summarise", "summarize", "सार", "सारांश"]
    return any(marker in message_lower for marker in summary_markers)


def _is_project_related(message: str) -> bool:
    message_lower = message.lower()
    return any(keyword in message_lower for keyword in PROJECT_KEYWORDS)


def _build_system_prompt(lang: str, weather: dict[str, Any] | None) -> str:
    weather_text = ""
    if weather:
        weather_text = (
            f" Current weather: {weather.get('condition')}, temperature {weather.get('temperature_c')}C, "
            f"humidity {weather.get('humidity')}%, wind {weather.get('wind_kph')} km/h, rain chance "
            f"{weather.get('precipitation_probability')}%. Field advice: {weather.get('advice')}"
        )

    if lang == "hi":
        return (
            "आप AgroVision के कृषि सहायक हैं। केवल AgroVision, फसल स्वास्थ्य, रोग पहचान, मौसम, "
            "और इसी प्रोजेक्ट से जुड़े विषयों पर ही जवाब दें। यदि सवाल विषय से बाहर हो तो विनम्रता से "
            "मना करें और यूजर को परियोजना-संबंधित सवाल पूछने के लिए कहें। जवाब छोटे, व्यावहारिक और "
            "किसान-हितैषी रखें। जहां जरूरी हो वहां कदमों में सलाह दें। अनिश्चित होने पर स्पष्ट बताएं। "
            "यदि यूजर सारांश मांगे तो AgroVision का संक्षिप्त प्रोजेक्ट-सार दें: React+Vite frontend, "
            "FastAPI backend, crop disease prediction model, weather panel, farm zone map, and bilingual chat."
            + weather_text
        )

    return (
        "You are AgroVision's assistant. Answer ONLY AgroVision-project topics: crop health, disease prediction, "
        "weather, farm zones, analysis dashboard, and project usage. If asked out-of-scope questions, politely refuse "
        "and ask for AgroVision-related queries. Keep answers practical, concise, and field-oriented. "
        "If the user asks for a summary, provide a concise AgroVision project summary: React+Vite frontend, FastAPI backend, "
        "crop disease prediction model, weather insights, farm map, and bilingual assistant."
        + weather_text
    )


def _fallback_with_context(chatbot, message: str, lang: str, weather: dict[str, Any] | None) -> tuple[str, str]:
    if _is_summary_request(message):
        response = chatbot.get_project_summary(lang)
    elif not _is_project_related(message):
        response = chatbot.get_out_of_scope_response(lang)
    else:
        response = chatbot.get_response(message, lang)

    if weather:
        if lang == "hi":
            response += (
                f"\n\nमौसम संकेत: अभी {weather.get('condition').lower()} है, तापमान {weather.get('temperature_c')}°C "
                f"और बारिश की संभावना {weather.get('precipitation_probability')}% है। {weather.get('advice')}"
            )
        else:
            response += (
                f"\n\nWeather note: It is currently {weather.get('condition').lower()} with {weather.get('temperature_c')}C "
                f"and a {weather.get('precipitation_probability')}% rain chance. {weather.get('advice')}"
            )
    return response, "local"


def _extract_google_text(body: dict[str, Any]) -> str:
    candidates = body.get("candidates", [])
    if not candidates:
        return ""

    parts = candidates[0].get("content", {}).get("parts", [])
    text_chunks = [part.get("text", "").strip() for part in parts if part.get("text")]
    return "\n".join(chunk for chunk in text_chunks if chunk).strip()


def _request_google_response(message: str, lang: str, weather: dict[str, Any] | None) -> str:
    api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GOOGLE_AI_STUDIO_API_KEY")
    if not api_key:
        return ""

    model = os.getenv("GOOGLE_MODEL", "gemini-2.0-flash")
    api_url = os.getenv("GOOGLE_API_URL", GOOGLE_API_URL).rstrip("/")
    request_url = f"{api_url}/{model}:generateContent?key={api_key}"

    payload = {
        "system_instruction": {"parts": [{"text": _build_system_prompt(lang, weather)}]},
        "contents": [{"role": "user", "parts": [{"text": message}]}],
        "generationConfig": {
            "temperature": 0.4,
            "maxOutputTokens": 300,
        },
    }

    request = Request(
        request_url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urlopen(request, timeout=18) as response:
        body = json.loads(response.read().decode("utf-8"))

    return _extract_google_text(body)


def _request_openai_compatible_response(message: str, lang: str, weather: dict[str, Any] | None) -> str:
    api_key = os.getenv("GROQ_API_KEY") or os.getenv("OPENAI_API_KEY")
    if not api_key:
        return ""

    model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    api_url = os.getenv("GROQ_API_URL", GROQ_API_URL)

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": _build_system_prompt(lang, weather)},
            {"role": "user", "content": message},
        ],
        "temperature": 0.4,
        "max_tokens": 300,
    }

    request = Request(
        api_url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    with urlopen(request, timeout=18) as response:
        body = json.loads(response.read().decode("utf-8"))

    return body.get("choices", [{}])[0].get("message", {}).get("content", "").strip()


def get_ai_chat_response(chatbot, message: str, lang: str = "en", weather: dict[str, Any] | None = None) -> tuple[str, str]:
    is_summary = _is_summary_request(message)

    if is_summary:
        message = (
            "Give a concise summary of the AgroVision project with features, architecture, and how farmers use it in practice."
            if lang == "en"
            else "AgroVision प्रोजेक्ट का संक्षिप्त सार दें: फीचर्स, आर्किटेक्चर और किसान उपयोग।"
        )

    if not _is_project_related(message) and not is_summary:
        return chatbot.get_out_of_scope_response(lang), "local"

    try:
        content = _request_google_response(message, lang, weather)
        if content:
            return content, "ai"
    except Exception:
        pass

    try:
        content = _request_openai_compatible_response(message, lang, weather)
        if content:
            return content, "ai"
    except Exception:
        pass

    return _fallback_with_context(chatbot, message, lang, weather)
