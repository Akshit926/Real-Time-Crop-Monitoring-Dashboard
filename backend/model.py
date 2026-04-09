"""
CropDiseasePredictor — Simulated CNN-based crop disease detection.

This module provides a realistic prediction engine that analyzes
uploaded crop images using color/texture heuristics. The architecture
is designed so a real trained model (.h5) can be swapped in with
minimal changes.
"""

import io
import random
import hashlib
from PIL import Image

# ── Disease Database ──────────────────────────────────────────────
# ... (keeping DISEASE_DATABASE as is) ...
DISEASE_DATABASE = {
    "Tomato": {
        "healthy": {
            "description": "The tomato plant appears healthy with no visible signs of disease.",
            "recommendations": {
                "fertilizer": "Continue with balanced NPK fertilizer (10-10-10) every 2 weeks.",
                "irrigation": "Maintain regular watering schedule — 1-2 inches per week.",
                "pest_control": "Monitor regularly. No immediate action needed."
            }
        },
        "diseases": [
            {
                "name": "Late Blight",
                "description": "Dark, water-soaked lesions on leaves and stems caused by Phytophthora infestans.",
                "recommendations": {
                    "fertilizer": "Apply copper-based fungicide (Bordeaux mixture) immediately.",
                    "irrigation": "Reduce overhead watering. Use drip irrigation to keep foliage dry.",
                    "pest_control": "Remove and destroy all infected plant parts. Do not compost."
                }
            },
            {
                "name": "Early Blight",
                "description": "Concentric ring-shaped brown spots on lower leaves caused by Alternaria solani.",
                "recommendations": {
                    "fertilizer": "Apply chlorothalonil or mancozeb fungicide every 7-10 days.",
                    "irrigation": "Water at the base of plants. Avoid wetting foliage.",
                    "pest_control": "Remove affected leaves. Mulch around plants to prevent soil splash."
                }
            },
            {
                "name": "Leaf Mold",
                "description": "Yellow spots on upper leaf surface with olive-green mold underneath.",
                "recommendations": {
                    "fertilizer": "Apply potassium-rich fertilizer to strengthen plant immunity.",
                    "irrigation": "Improve air circulation. Reduce humidity around plants.",
                    "pest_control": "Use neem oil spray. Remove severely affected leaves."
                }
            },
            {
                "name": "Septoria Leaf Spot",
                "description": "Small circular spots with dark borders and gray centers on lower leaves.",
                "recommendations": {
                    "fertilizer": "Apply fungicide containing chlorothalonil at first sign of disease.",
                    "irrigation": "Avoid overhead irrigation. Water early morning only.",
                    "pest_control": "Practice crop rotation. Remove plant debris after harvest."
                }
            }
        ]
    },
    "Potato": {
        "healthy": {
            "description": "The potato plant looks healthy with strong green foliage.",
            "recommendations": {
                "fertilizer": "Apply high-potassium fertilizer during tuber formation stage.",
                "irrigation": "Keep soil consistently moist but not waterlogged.",
                "pest_control": "Scout for Colorado potato beetles weekly."
            }
        },
        "diseases": [
            {
                "name": "Late Blight",
                "description": "Water-soaked dark patches rapidly spreading across leaves and tubers.",
                "recommendations": {
                    "fertilizer": "Apply systemic fungicide (metalaxyl) immediately.",
                    "irrigation": "Ensure good drainage. Avoid waterlogging at all costs.",
                    "pest_control": "Destroy all infected plants. Do not save tubers from infected fields."
                }
            },
            {
                "name": "Early Blight",
                "description": "Dark brown spots with concentric rings appearing on older leaves first.",
                "recommendations": {
                    "fertilizer": "Apply mancozeb-based fungicide every 7 days.",
                    "irrigation": "Use drip irrigation to minimize leaf wetness.",
                    "pest_control": "Hill potatoes properly. Remove volunteer potato plants."
                }
            }
        ]
    },
    "Corn": {
        "healthy": {
            "description": "Corn plants show vigorous growth with deep green leaves.",
            "recommendations": {
                "fertilizer": "Side-dress with nitrogen fertilizer at V6 growth stage.",
                "irrigation": "Ensure 1 inch of water per week during tasseling stage.",
                "pest_control": "Monitor for corn borers and armyworms regularly."
            }
        },
        "diseases": [
            {
                "name": "Northern Leaf Blight",
                "description": "Long, elliptical gray-green lesions on corn leaves.",
                "recommendations": {
                    "fertilizer": "Apply foliar fungicide (azoxystrobin) at first sign.",
                    "irrigation": "Maintain adequate spacing for air circulation.",
                    "pest_control": "Use resistant hybrids in next planting. Rotate crops."
                }
            },
            {
                "name": "Common Rust",
                "description": "Small, circular to elongated brown pustules on both leaf surfaces.",
                "recommendations": {
                    "fertilizer": "Apply triazole fungicide if infection is severe.",
                    "irrigation": "No specific irrigation changes needed.",
                    "pest_control": "Plant rust-resistant varieties. Monitor fields in humid weather."
                }
            },
            {
                "name": "Gray Leaf Spot",
                "description": "Rectangular lesions bounded by leaf veins, turning gray-tan.",
                "recommendations": {
                    "fertilizer": "Apply strobilurin fungicide at tasseling stage.",
                    "irrigation": "Improve field drainage to reduce humidity.",
                    "pest_control": "Tillage to bury infected crop residue. Rotate with non-host crops."
                }
            }
        ]
    },
    "Rice": {
        "healthy": {
            "description": "Rice paddy shows uniform green color with healthy tillers.",
            "recommendations": {
                "fertilizer": "Apply urea fertilizer in split doses during growth stages.",
                "irrigation": "Maintain 2-3 cm standing water during vegetative stage.",
                "pest_control": "Use light traps to monitor stem borer populations."
            }
        },
        "diseases": [
            {
                "name": "Blast Disease",
                "description": "Diamond-shaped lesions with gray centers on leaves, nodes, and panicles.",
                "recommendations": {
                    "fertilizer": "Reduce nitrogen application. Apply tricyclazole fungicide.",
                    "irrigation": "Maintain continuous flooding. Avoid water stress.",
                    "pest_control": "Use blast-resistant varieties. Remove infected straw after harvest."
                }
            },
            {
                "name": "Bacterial Leaf Blight",
                "description": "Water-soaked lesions starting from leaf tips, turning yellow-white.",
                "recommendations": {
                    "fertilizer": "Reduce nitrogen fertilizer. Apply potash to strengthen plants.",
                    "irrigation": "Drain fields periodically. Avoid excess water during tillering.",
                    "pest_control": "Use certified disease-free seeds. Apply copper-based bactericides."
                }
            }
        ]
    },
    "Wheat": {
        "healthy": {
            "description": "Wheat crop displays uniform tillering with healthy golden-green color.",
            "recommendations": {
                "fertilizer": "Apply nitrogen top-dressing at jointing stage.",
                "irrigation": "Provide critical irrigation at crown root initiation stage.",
                "pest_control": "Monitor for aphid populations during ear emergence."
            }
        },
        "diseases": [
            {
                "name": "Powdery Mildew",
                "description": "White powdery fungal growth on upper leaf surfaces and stems.",
                "recommendations": {
                    "fertilizer": "Apply sulfur-based fungicide or propiconazole.",
                    "irrigation": "Avoid excessive nitrogen. Ensure proper plant spacing.",
                    "pest_control": "Remove volunteer wheat plants. Use resistant varieties."
                }
            },
            {
                "name": "Leaf Rust",
                "description": "Orange-brown circular pustules scattered across leaf blades.",
                "recommendations": {
                    "fertilizer": "Apply propiconazole or tebuconazole fungicide.",
                    "irrigation": "No specific changes — focus on chemical control.",
                    "pest_control": "Plant rust-resistant varieties. Monitor from tillering stage."
                }
            }
        ]
    },
    "Apple": {
        "healthy": {
            "description": "Apple tree shows healthy foliage with no visible disease symptoms.",
            "recommendations": {
                "fertilizer": "Apply balanced orchard fertilizer in early spring.",
                "irrigation": "Deep water every 7-10 days during dry periods.",
                "pest_control": "Apply dormant oil spray before bud break."
            }
        },
        "diseases": [
            {
                "name": "Apple Scab",
                "description": "Olive-green to dark brown velvety spots on leaves and fruit surface.",
                "recommendations": {
                    "fertilizer": "Apply captan or myclobutanil fungicide starting at green tip stage.",
                    "irrigation": "Avoid overhead sprinklers. Keep canopy open for air flow.",
                    "pest_control": "Rake and destroy fallen leaves in autumn. Prune for air circulation."
                }
            },
            {
                "name": "Cedar Apple Rust",
                "description": "Bright orange-yellow spots on upper leaf surface with tube-like structures underneath.",
                "recommendations": {
                    "fertilizer": "Apply fungicide (myclobutanil) from pink bud to petal fall.",
                    "irrigation": "Standard irrigation — disease is weather dependent.",
                    "pest_control": "Remove nearby cedar/juniper trees if possible. Use resistant varieties."
                }
            },
            {
                "name": "Black Rot",
                "description": "Brown leaf spots with concentric rings; fruit develops dark, sunken lesions.",
                "recommendations": {
                    "fertilizer": "Apply captan fungicide during early fruit development.",
                    "irrigation": "Ensure good drainage around tree base.",
                    "pest_control": "Prune dead wood and mummified fruit. Maintain orchard sanitation."
                }
            }
        ]
    }
}


class CropDiseasePredictor:
    """
    Simulated CNN predictor for crop disease detection.
    
    Refactored to use native Python for statistics to avoid numpy dependencies.
    """

    def __init__(self, model_path: str = None):
        self.model = None
        self.img_size = (224, 224)
        self.crops = list(DISEASE_DATABASE.keys())

    def preprocess_image(self, image_bytes: bytes) -> Image.Image:
        """Preprocess uploaded image for analysis."""
        image = Image.open(io.BytesIO(image_bytes))
        image = image.convert("RGB")
        image = image.resize(self.img_size, Image.LANCZOS)
        return image

    def _analyze_image_features(self, image: Image.Image) -> dict:
        """Extract basic image features using native Python."""
        pixels = list(image.getdata())
        n = len(pixels)
        
        # Calculate means
        r_sum = g_sum = b_sum = 0
        for r, g, b in pixels:
            r_sum += r
            g_sum += g
            b_sum += b
            
        r_mean = r_sum / (n * 255.0)
        g_mean = g_sum / (n * 255.0)
        b_mean = b_sum / (n * 255.0)
        
        brightness = (r_mean + g_mean + b_mean) / 3.0
        
        # Calculate variance (simplified)
        var_sum = 0
        for r, g, b in pixels:
            lum = (r + g + b) / (3.0 * 255.0)
            var_sum += (lum - brightness) ** 2
        texture_var = var_sum / n

        # Hash for deterministic randomness
        img_hash = hashlib.md5(image.tobytes()[:1000]).hexdigest()
        seed = int(img_hash[:8], 16)

        return {
            "r_mean": r_mean,
            "g_mean": g_mean,
            "b_mean": b_mean,
            "brightness": brightness,
            "texture_var": texture_var,
            "seed": seed
        }

    def predict(self, image_bytes: bytes) -> dict:
        """Run prediction on uploaded image."""
        try:
            image = self.preprocess_image(image_bytes)
            features = self._analyze_image_features(image)
        except Exception as e:
            # Fallback for corrupted images
            seed = int(hashlib.md5(image_bytes[:100]).hexdigest()[:8], 16)
            features = {
                "r_mean": 0.5, "g_mean": 0.5, "b_mean": 0.5,
                "brightness": 0.5, "texture_var": 0.1, "seed": seed
            }

        rng = random.Random(features["seed"])

        # Select crop based on color distribution
        total_color = features["r_mean"] + features["g_mean"] + features["b_mean"] + 1e-6
        green_ratio = features["g_mean"] / total_color
        
        if green_ratio > 0.38:
            crop_idx = rng.choice([0, 2, 3, 4])  # Tomato, Corn, Rice, Wheat
        else:
            crop_idx = rng.choice([0, 1, 5])  # Tomato, Potato, Apple

        crop = self.crops[crop_idx]
        crop_data = DISEASE_DATABASE[crop]

        # Determine healthy vs diseased
        brown_indicator = features["r_mean"] - features["g_mean"]
        disease_score = (features["texture_var"] * 5) + max(0, brown_indicator * 2)

        is_healthy = disease_score < 0.35 and rng.random() > 0.4

        if is_healthy:
            confidence = round(rng.uniform(85.0, 98.5), 1)
            return {
                "crop": crop,
                "status": "Healthy",
                "disease": "None",
                "confidence": confidence,
                "description": crop_data["healthy"]["description"],
                "recommendations": crop_data["healthy"]["recommendations"]
            }
        else:
            disease = rng.choice(crop_data["diseases"])
            confidence = round(rng.uniform(72.0, 96.8), 1)
            return {
                "crop": crop,
                "status": "Diseased",
                "disease": disease["name"],
                "confidence": confidence,
                "description": disease["description"],
                "recommendations": disease["recommendations"]
            }


# Singleton instance
predictor = CropDiseasePredictor()
