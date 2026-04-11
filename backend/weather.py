"""Weather service helpers powered by Open-Meteo with local fallbacks."""

from __future__ import annotations

import json
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
    2: ("Partly Cloudy", "Partly cloudy conditions with moderate sunlight."),
    3: ("Overcast", "Cloud cover is high, which can slow leaf drying."),
    45: ("Fog", "Foggy conditions increase leaf wetness and disease risk."),
    48: ("Frost Fog", "Low-visibility fog with colder canopy conditions."),
    51: ("Light Drizzle", "Light drizzle may increase fungal pressure."),
    53: ("Drizzle", "Drizzle is keeping foliage damp for longer."),
    55: ("Dense Drizzle", "Persistent drizzle can raise mildew and blight risk."),
    61: ("Light Rain", "Light rain is expected. Watch soil moisture carefully."),
    63: ("Rain", "Rainfall can spread foliar disease between plants."),
    65: ("Heavy Rain", "Heavy rain can waterlog fields and spread disease quickly."),
    71: ("Light Snow", "Cold weather may slow growth and stress warm-season crops."),
    80: ("Rain Showers", "Intermittent showers can trigger repeated leaf wetness cycles."),
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


def _format_hour_label(hour_iso: str) -> str:
    if "T" not in hour_iso:
        return hour_iso
    return hour_iso.split("T", maxsplit=1)[1][:5]


def _find_start_index(hourly_times: list[str], current_time: str | None) -> int:
    if not hourly_times:
        return 0
    if not current_time:
        return 0

    for idx, time_value in enumerate(hourly_times):
        if time_value >= current_time:
            return idx
    return 0


def _round_series_item(series: list[Any], index: int, default: float = 0.0) -> float:
    if index >= len(series):
        return default
    try:
        return float(series[index])
    except Exception:
        return default


def _build_hourly_forecast(hourly: dict[str, Any], start_idx: int, hours: int = 8) -> list[dict[str, Any]]:
    times = hourly.get("time", [])
    if not times:
        return []

    temperatures = hourly.get("temperature_2m", [])
    rain_probabilities = hourly.get("precipitation_probability", [])
    rain_amounts = hourly.get("precipitation", [])

    forecast: list[dict[str, Any]] = []
    end_idx = min(start_idx + hours, len(times))

    for idx in range(start_idx, end_idx):
        forecast.append(
            {
                "time": times[idx],
                "label": _format_hour_label(times[idx]),
                "temperature_c": round(_round_series_item(temperatures, idx, 0.0)),
                "precipitation_probability": int(round(_round_series_item(rain_probabilities, idx, 0.0))),
                "rain_mm": round(_round_series_item(rain_amounts, idx, 0.0), 1),
            }
        )

    return forecast


def _compute_disease_risk(
    temp_c: float,
    humidity: float,
    precip_prob_next_12h: float,
    rain_mm_next_24h: float,
    wind_kph: float,
    lang: str,
) -> dict[str, Any]:
    wetness_component = min(52.0, humidity * 0.34 + precip_prob_next_12h * 0.30 + rain_mm_next_24h * 2.6)

    if 18 <= temp_c <= 30:
        temperature_component = 24.0
    elif 12 <= temp_c < 18 or 30 < temp_c <= 35:
        temperature_component = 14.0
    else:
        temperature_component = 8.0

    airflow_adjustment = -10.0 if wind_kph >= 22 else (-5.0 if wind_kph >= 14 else 0.0)
    score = int(max(0, min(100, round(wetness_component + temperature_component + 10 + airflow_adjustment))))

    if score >= 70:
        level_code = "high"
        if lang == "hi":
            level = "उच्च"
            reason = "उच्च नमी, बारिश संभावना और पत्तियों के गीले रहने का समय रोग फैलाव के लिए अनुकूल है।"
        else:
            level = "High"
            reason = "High humidity, rain probability, and prolonged leaf wetness are favorable for disease spread."
    elif score >= 45:
        level_code = "moderate"
        if lang == "hi":
            level = "मध्यम"
            reason = "कुछ मौसम संकेत रोग जोखिम बढ़ा रहे हैं, इसलिए सक्रिय निगरानी आवश्यक है।"
        else:
            level = "Moderate"
            reason = "Some weather indicators can increase disease pressure, so active scouting is recommended."
    else:
        level_code = "low"
        if lang == "hi":
            level = "कम"
            reason = "तुरंत रोग दबाव कम दिख रहा है, फिर भी नियमित खेत निरीक्षण जारी रखें।"
        else:
            level = "Low"
            reason = "Immediate disease pressure looks low, but regular field inspection should continue."

    if lang == "hi":
        if level_code == "high" and temp_c <= 28:
            likely_diseases = ["लेट ब्लाइट", "डाउनि मिल्ड्यू", "बैक्टीरियल लीफ स्पॉट"]
        elif level_code == "high":
            likely_diseases = ["अर्ली ब्लाइट", "लीफ स्पॉट", "एन्थ्रेक्नोज"]
        elif level_code == "moderate":
            likely_diseases = ["अर्ली ब्लाइट", "पाउडरी मिल्ड्यू", "लीफ स्पॉट"]
        else:
            likely_diseases = ["तत्काल कम फोलियर जोखिम"]
    else:
        if level_code == "high" and temp_c <= 28:
            likely_diseases = ["Late Blight", "Downy Mildew", "Bacterial Leaf Spot"]
        elif level_code == "high":
            likely_diseases = ["Early Blight", "Leaf Spot", "Anthracnose"]
        elif level_code == "moderate":
            likely_diseases = ["Early Blight", "Powdery Mildew", "Leaf Spot"]
        else:
            likely_diseases = ["Low immediate foliar risk"]

    return {
        "level_code": level_code,
        "level": level,
        "score": score,
        "likely_diseases": likely_diseases,
        "reason": reason,
    }


def _compute_irrigation(
    temp_c: float,
    humidity: float,
    precip_prob_next_12h: float,
    rain_mm_next_24h: float,
    lang: str,
) -> dict[str, Any]:
    if rain_mm_next_24h >= 8 or precip_prob_next_12h >= 75:
        level_code = "skip"
        should_water = False
        recommended_mm = 0.0
    elif temp_c >= 34 and humidity <= 45 and rain_mm_next_24h < 2 and precip_prob_next_12h < 35:
        level_code = "high"
        should_water = True
        recommended_mm = 8.0
    elif temp_c >= 28 and humidity < 60 and rain_mm_next_24h < 4:
        level_code = "medium"
        should_water = True
        recommended_mm = 5.0
    else:
        level_code = "low"
        should_water = True
        recommended_mm = 3.0

    if lang == "hi":
        labels = {
            "skip": "रोकें",
            "high": "उच्च",
            "medium": "मध्यम",
            "low": "कम",
        }
        if level_code == "skip":
            recommendation = "अगले 24 घंटे में पर्याप्त बारिश संभव है, अभी सिंचाई रोकें।"
        elif level_code == "high":
            recommendation = "गर्मी और कम नमी के कारण उच्च सिंचाई की जरूरत है। सुबह या शाम सिंचाई करें।"
        elif level_code == "medium":
            recommendation = "मध्यम सिंचाई रखें और मिट्टी की ऊपरी 5 सेमी नमी जांचते रहें।"
        else:
            recommendation = "हल्की सिंचाई पर्याप्त है। अधिक पानी देने से बचें।"
    else:
        labels = {
            "skip": "Skip",
            "high": "High",
            "medium": "Medium",
            "low": "Low",
        }
        if level_code == "skip":
            recommendation = "Rain is likely in the next 24 hours, so hold irrigation for now."
        elif level_code == "high":
            recommendation = "Heat and low humidity indicate high irrigation demand. Prefer early morning or evening watering."
        elif level_code == "medium":
            recommendation = "Use moderate irrigation and keep checking top-soil moisture."
        else:
            recommendation = "Low irrigation is enough right now. Avoid overwatering."

    return {
        "level_code": level_code,
        "level": labels[level_code],
        "should_water": should_water,
        "recommended_mm": round(recommended_mm, 1),
        "recommended_liters_m2": round(recommended_mm, 1),
        "rain_mm_next_24h": round(rain_mm_next_24h, 1),
        "recommendation": recommendation,
    }


def _build_fallback_weather(location_name: str, lat: float, lon: float, lang: str) -> dict[str, Any]:
    summary, advice = _pick_weather_description(2, lang)
    fallback_risk = _compute_disease_risk(29.0, 58.0, 18.0, 1.2, 11.0, lang)
    fallback_irrigation = _compute_irrigation(29.0, 58.0, 18.0, 1.2, lang)
    labels = ["Now", "+1h", "+2h", "+3h", "+4h", "+5h"]
    if lang == "hi":
        labels = ["अब", "+1घं", "+2घं", "+3घं", "+4घं", "+5घं"]

    return {
        "location": location_name,
        "latitude": lat,
        "longitude": lon,
        "temperature_c": 29,
        "wind_kph": 11,
        "humidity": 58,
        "precipitation_probability": 18,
        "rain_mm_next_24h": 1.2,
        "condition": summary,
        "advice": advice,
        "disease_risk": fallback_risk,
        "irrigation": fallback_irrigation,
        "forecast_next_hours": [
            {"time": "", "label": labels[0], "temperature_c": 29, "precipitation_probability": 18, "rain_mm": 0.2},
            {"time": "", "label": labels[1], "temperature_c": 29, "precipitation_probability": 20, "rain_mm": 0.3},
            {"time": "", "label": labels[2], "temperature_c": 28, "precipitation_probability": 22, "rain_mm": 0.3},
            {"time": "", "label": labels[3], "temperature_c": 28, "precipitation_probability": 20, "rain_mm": 0.2},
            {"time": "", "label": labels[4], "temperature_c": 27, "precipitation_probability": 16, "rain_mm": 0.1},
            {"time": "", "label": labels[5], "temperature_c": 27, "precipitation_probability": 14, "rain_mm": 0.1},
        ],
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
            "hourly": "temperature_2m,relative_humidity_2m,precipitation_probability,precipitation",
            "forecast_days": 2,
            "timezone": "auto",
        }
    )
    url = f"https://api.open-meteo.com/v1/forecast?{params}"

    try:
        with urlopen(url, timeout=10) as response:
            payload = json.loads(response.read().decode("utf-8"))

        current = payload.get("current", {})
        hourly = payload.get("hourly", {})

        hourly_times = hourly.get("time", [])
        start_idx = _find_start_index(hourly_times, current.get("time"))

        precipitation_probabilities = hourly.get("precipitation_probability", [])
        rainfall_mm = hourly.get("precipitation", [])

        next_12h_probs = precipitation_probabilities[start_idx : start_idx + 12] or [0]
        next_24h_rain = rainfall_mm[start_idx : start_idx + 24] or [0]

        precip_prob_next_12h = float(max(next_12h_probs))
        rain_mm_next_24h = float(sum(float(v) for v in next_24h_rain))
        precip_prob_display = int(max(precipitation_probabilities[start_idx : start_idx + 6] or [0]))

        temp_c = float(current.get("temperature_2m", 0))
        humidity = float(current.get("relative_humidity_2m", 0))
        wind_kph = float(current.get("wind_speed_10m", 0))
        code = int(current.get("weather_code", 0))

        condition, advice = _pick_weather_description(code, lang)
        disease_risk = _compute_disease_risk(temp_c, humidity, precip_prob_next_12h, rain_mm_next_24h, wind_kph, lang)
        irrigation = _compute_irrigation(temp_c, humidity, precip_prob_next_12h, rain_mm_next_24h, lang)

        return {
            "location": name,
            "latitude": latitude,
            "longitude": longitude,
            "temperature_c": round(temp_c),
            "wind_kph": round(wind_kph),
            "humidity": int(humidity),
            "precipitation_probability": int(precip_prob_display),
            "rain_mm_next_24h": round(rain_mm_next_24h, 1),
            "condition": condition,
            "advice": advice,
            "disease_risk": disease_risk,
            "irrigation": irrigation,
            "forecast_next_hours": _build_hourly_forecast(hourly, start_idx, hours=8),
            "source": "open-meteo",
        }
    except Exception:
        return _build_fallback_weather(name, latitude, longitude, lang)
