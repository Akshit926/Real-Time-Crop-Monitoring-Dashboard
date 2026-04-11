"""Profit estimation helpers for AgroVision."""

CROP_DATA = [
    {"crop": "Wheat", "cost_per_acre": 15000, "yield_per_acre": 20, "price": 2000},
    {"crop": "Rice", "cost_per_acre": 18000, "yield_per_acre": 25, "price": 1800},
    {"crop": "Maize", "cost_per_acre": 12000, "yield_per_acre": 30, "price": 1500},
]


def get_crop_data(crop_name: str) -> dict:
    for crop in CROP_DATA:
        if crop["crop"].lower() == crop_name.strip().lower():
            return crop
    raise ValueError(f"Unknown crop: {crop_name}")


def calculate_profit(crop_name: str, area: float) -> dict:
    if area <= 0:
        raise ValueError("Area must be greater than 0.")

    crop = get_crop_data(crop_name)
    total_cost = crop["cost_per_acre"] * area
    revenue = crop["yield_per_acre"] * area * crop["price"]
    profit = revenue - total_cost

    return {
        "crop": crop["crop"],
        "area": area,
        "total_cost": total_cost,
        "revenue": revenue,
        "profit": profit,
    }


def get_crop_options() -> list[dict]:
    return CROP_DATA
