"""AI-assisted chat service with graceful fallback to the local chatbot."""

from __future__ import annotations

import json
import os
from typing import Any
from urllib.request import Request, urlopen


OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"


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
            "आप AgroVision के कृषि सहायक हैं। जवाब छोटे, व्यावहारिक और किसान-हितैषी रखें। "
            "जहां जरूरी हो वहां कदमों में सलाह दें। अनिश्चित होने पर स्पष्ट बताएं।"
            + weather_text
        )

    return (
        "You are AgroVision's farm assistant. Keep answers practical, concise, and field-oriented. "
        "Use simple action steps when helpful, and be explicit when uncertain."
        + weather_text
    )


def _fallback_with_context(chatbot, message: str, lang: str, weather: dict[str, Any] | None) -> tuple[str, str]:
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


def get_ai_chat_response(chatbot, message: str, lang: str = "en", weather: dict[str, Any] | None = None) -> tuple[str, str]:
    api_key = os.getenv("OPENAI_API_KEY")
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    if not api_key:
        return _fallback_with_context(chatbot, message, lang, weather)

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
        OPENAI_API_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urlopen(request, timeout=18) as response:
            body = json.loads(response.read().decode("utf-8"))
        content = body["choices"][0]["message"]["content"].strip()
        return content, "ai"
    except Exception:
        return _fallback_with_context(chatbot, message, lang, weather)
