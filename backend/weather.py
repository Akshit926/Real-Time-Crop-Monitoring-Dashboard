"""Weather service helpers powered by Open-Meteo with local fallbacks."""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any
from urllib.parse import urlencode
from urllib.request import urlopen


DEFAULT_LOCATION = {
    "name": "New Delhi",
    "latitude": 28.6139,
    "longitude": 77.2090,
}


WEATHER_CODE_MAP = {
    0: ("Clear", "Clear sky and stable field conditions."),
    1: ("Mostly Clear", "Mostly clear conditions with good crop observation visibility."),
    2: ("Partly Cloudy", "Partly cloudy weather with moderate sunlight."),
    3: ("Overcast", "Cloud cover is high, which can slow leaf drying."),
    45: ("Fog", "Foggy conditions increase leaf wetness and disease risk."),
    48: ("Frost Fog", "Low-visibility fog with colder conditions near the canopy."),
    51: ("Light Drizzle", "Light drizzle may increase fungal pressure."),
    53: ("Drizzle", "Drizzle is keeping foliage damp for longer."),
    55: ("Dense Drizzle", "Persistent drizzle can raise mildew and blight risk."),
    61: ("Light Rain", "Light rain is expected. Watch soil moisture carefully."),
    63: ("Rain", "Rainfall can spread foliar disease between plants."),
    65: ("Heavy Rain", "Heavy rain can waterlog fields and spread disease quickly."),
    71: ("Light Snow", "Cold weather may slow growth and stress warm-season crops."),
    80: ("Rain Showers", "Intermittent showers can trigger rapid leaf wetness cycles."),
    95: ("Thunderstorm", "Storm conditions raise lodging and runoff risk."),
}


def _pick_weather_description(code: int, lang: str) -> tuple[str, str]:
    label, advice = WEATHER_CODE_MAP.get(code, ("Variable", "Weather conditions are changing. Monitor your field closely."))
    if lang == "hi":
        translations = {
            "Clear": ("साफ मौसम", "आसमान साफ है और खेत की निगरानी के लिए अच्छा समय है।"),
            "Mostly Clear": ("अधिकतर साफ", "मौसम काफी साफ है और धूप संतुलित है।"),
            "Partly Cloudy": ("आंशिक बादल", "हल्के बादल हैं, धूप मध्यम रहेगी।"),
            "Overcast": ("घना बादल", "बादल अधिक हैं, पत्तियां देर से सूख सकती हैं।"),
            "Fog": ("कोहरा", "कोहरे से पत्तियों पर नमी बढ़ सकती है और रोग का खतरा बढ़ता है।"),
            "Frost Fog": ("ठंडा कोहरा", "ठंडा और धुंधला मौसम फसल पर तनाव डाल सकता है।"),
            "Light Drizzle": ("हल्की फुहार", "हल्की फुहार से फफूंद रोग का जोखिम बढ़ सकता है।"),
            "Drizzle": ("फुहार", "लगातार नमी पत्तियों को देर तक गीला रख सकती है।"),
            "Dense Drizzle": ("घनी फुहार", "लगातार फुहार मिल्ड्यू और ब्लाइट का जोखिम बढ़ाती है।"),
            "Light Rain": ("हल्की बारिश", "हल्की बारिश है, मिट्टी की नमी पर नजर रखें।"),
            "Rain": ("बारिश", "बारिश से पत्तियों के रोग तेजी से फैल सकते हैं।"),
            "Heavy Rain": ("तेज बारिश", "तेज बारिश से जलभराव और रोग फैलाव दोनों बढ़ सकते हैं।"),
            "Light Snow": ("हल्की बर्फ", "ठंडे मौसम में गर्म फसलों की बढ़त धीमी हो सकती है।"),
            "Rain Showers": ("बारिश की बौछारें", "रुक-रुक कर बारिश पत्तियों को बार-बार गीला करती है।"),
            "Thunderstorm": ("आंधी-तूफान", "तूफानी मौसम से फसल गिरने और बहाव का खतरा बढ़ता है।"),
            "Variable": ("बदलता मौसम", "मौसम बदल रहा है, खेत की नजदीकी निगरानी रखें।"),
        }
        return translations.get(label, translations["Variable"])
    return label, advice


def _build_fallback_weather(location_name: str, lat: float, lon: float, lang: str) -> dict[str, Any]:
    summary, advice = _pick_weather_description(2, lang)
    return {
        "location": location_name,
        "latitude": lat,
        "longitude": lon,
        "temperature_c": 29,
        "wind_kph": 11,
        "humidity": 58,
        "precipitation_probability": 18,
        "condition": summary,
        "advice": advice,
        "source": "fallback",
    }


def get_weather(lat: float | None = None, lon: float | None = None, lang: str = "en", location_name: str | None = None) -> dict[str, Any]:
    latitude = lat if lat is not None else DEFAULT_LOCATION["latitude"]
    longitude = lon if lon is not None else DEFAULT_LOCATION["longitude"]
    name = location_name or DEFAULT_LOCATION["name"]

    params = urlencode(
        {
            "latitude": latitude,
            "longitude": longitude,
            "current": "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
            "hourly": "precipitation_probability",
            "forecast_days": 1,
            "timezone": "auto",
        }
    )
    url = f"https://api.open-meteo.com/v1/forecast?{params}"

    try:
        with urlopen(url, timeout=10) as response:
            payload = json.loads(response.read().decode("utf-8"))

        current = payload.get("current", {})
        hourly = payload.get("hourly", {})
        precipitation_series = hourly.get("precipitation_probability", [])
        precipitation_probability = max(precipitation_series[:6] or [0])
        code = int(current.get("weather_code", 0))
        condition, advice = _pick_weather_description(code, lang)

        return {
            "location": name,
            "latitude": latitude,
            "longitude": longitude,
            "temperature_c": round(float(current.get("temperature_2m", 0))),
            "wind_kph": round(float(current.get("wind_speed_10m", 0))),
            "humidity": int(current.get("relative_humidity_2m", 0)),
            "precipitation_probability": int(precipitation_probability),
            "condition": condition,
            "advice": advice,
            "source": "open-meteo",
        }
    except Exception:
        return _build_fallback_weather(name, latitude, longitude, lang)
