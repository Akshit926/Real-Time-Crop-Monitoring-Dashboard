"""
AgriBot — Rule-based agricultural chatbot with Hindi support.

Provides farmer-friendly responses to common crop-related queries
using keyword pattern matching against a curated knowledge base.
"""

import re
import random

# ── Knowledge Base ────────────────────────────────────────────────

KNOWLEDGE_BASE = {
    "en": [
        {
            "keywords": ["yellow", "leaves", "turning", "yellowing"],
            "responses": [
                "Yellow leaves can be caused by several things:\n\n🔸 **Nitrogen deficiency** — Apply urea or ammonium sulfate fertilizer\n🔸 **Overwatering** — Let the soil dry out between waterings\n🔸 **Iron deficiency** — Use chelated iron fertilizer\n🔸 **Natural aging** — Lower leaves yellowing is normal\n\nCheck if the yellowing is on new or old leaves to narrow down the cause.",
                "Yellowing leaves often indicate nutrient deficiency. Try these steps:\n\n1. Check soil moisture — overwatering causes root rot\n2. Apply balanced NPK fertilizer\n3. Test your soil pH (ideal: 6.0-7.0)\n4. Look for pests underneath the leaves"
            ]
        },
        {
            "keywords": ["leaf spot", "spots", "brown spots", "dark spots"],
            "responses": [
                "Leaf spots are usually caused by fungal infections. Here's what to do:\n\n🔸 **Remove affected leaves** immediately\n🔸 **Apply fungicide** — copper-based sprays work well\n🔸 **Improve air circulation** around plants\n🔸 **Avoid overhead watering** — water at the base\n🔸 **Space plants properly** to reduce humidity",
                "Brown or dark spots on leaves could be:\n\n• **Septoria leaf spot** — circular with gray centers\n• **Early Blight** — brown rings in concentric pattern\n• **Bacterial spot** — dark, water-soaked edges\n\nTreat with neem oil spray or a copper fungicide. Remove badly affected leaves."
            ]
        },
        {
            "keywords": ["wilting", "wilt", "drooping", "droopy"],
            "responses": [
                "Wilting plants might be experiencing:\n\n🔸 **Underwatering** — Check soil moisture 2 inches deep\n🔸 **Root rot** — from overwatering (soil smells sour)\n🔸 **Fusarium wilt** — fungal disease, leaves yellow then wilt\n🔸 **Heat stress** — provide shade during peak afternoon hours\n\nWater deeply in the morning and mulch around the base to retain moisture."
            ]
        },
        {
            "keywords": ["pest", "insects", "bugs", "aphid", "caterpillar", "worm"],
            "responses": [
                "For pest control, try these eco-friendly methods:\n\n🔸 **Neem oil spray** — mix 2ml per liter of water, spray every 7 days\n🔸 **Garlic-chili spray** — natural insect repellent\n🔸 **Sticky yellow traps** — catch flying insects\n🔸 **Companion planting** — marigolds repel many pests\n🔸 **Hand-picking** — remove large insects manually\n\nAvoid chemical pesticides near harvest time!",
                "Common pest management tips:\n\n1. **Aphids** → Spray with soapy water (5ml dish soap per liter)\n2. **Caterpillars** → Use Bacillus thuringiensis (BT) spray\n3. **Whiteflies** → Yellow sticky traps + neem oil\n4. **Mites** → Increase humidity, spray with water\n\nAlways spray in the early morning or evening, not in direct sunlight."
            ]
        },
        {
            "keywords": ["fertilizer", "nutrient", "feed", "npk", "manure"],
            "responses": [
                "Fertilizer guide for common crops:\n\n🌿 **Vegetables** — Balanced NPK (10-10-10) every 2-3 weeks\n🍅 **Tomatoes** — High potassium during fruiting (5-10-15)\n🌾 **Rice/Wheat** — Nitrogen-heavy (urea) during vegetative growth\n🍎 **Fruit trees** — Organic compost + bone meal in spring\n\n**Tip:** Always water well before and after applying fertilizer to avoid root burn.",
                "Here's a simple fertilizer schedule:\n\n📅 **Start of season** — Apply compost or well-rotted manure\n📅 **Vegetative growth** — Nitrogen-rich fertilizer every 2 weeks\n📅 **Flowering stage** — Switch to phosphorus-rich fertilizer\n📅 **Fruiting stage** — Use potassium-rich fertilizer\n\nOrganic options: Vermicompost, cow dung manure, bone meal, seaweed extract."
            ]
        },
        {
            "keywords": ["water", "irrigation", "watering", "moisture", "dry"],
            "responses": [
                "Irrigation best practices:\n\n🔸 **Morning watering** is best — reduces fungal disease risk\n🔸 **Drip irrigation** saves 30-50% water vs flood irrigation\n🔸 **Mulching** reduces water evaporation by 25%\n🔸 **Check soil moisture** — insert finger 2 inches deep\n🔸 **Most crops need** 1-2 inches of water per week\n\n**Tip:** Overwatering is more harmful than underwatering for most crops!"
            ]
        },
        {
            "keywords": ["soil", "ph", "earth", "ground", "compost"],
            "responses": [
                "Soil health tips:\n\n🔸 **Test your soil pH** — most crops prefer 6.0-7.0\n🔸 **Add organic matter** — compost improves structure and nutrients\n🔸 **Crop rotation** — prevents nutrient depletion and disease buildup\n🔸 **Cover crops** — plant legumes to fix nitrogen naturally\n🔸 **Avoid compaction** — don't walk on wet soil\n\nHealthy soil = healthy crops! Invest in a soil test kit for ₹200-500."
            ]
        },
        {
            "keywords": ["fungus", "fungal", "mold", "mildew", "powdery", "downy"],
            "responses": [
                "Fighting fungal diseases:\n\n🔸 **Powdery Mildew** — white powder on leaves\n  → Spray baking soda solution (1 tsp per liter)\n🔸 **Downy Mildew** — yellow patches with fuzzy growth underneath\n  → Apply copper-based fungicide\n🔸 **Root Rot** — mushy stems at soil level\n  → Improve drainage, reduce watering\n\n**Prevention:** Space plants well, avoid evening watering, ensure good air flow."
            ]
        },
        {
            "keywords": ["blight", "late blight", "early blight"],
            "responses": [
                "Blight management guide:\n\n🔸 **Early Blight** (Alternaria):\n  • Brown spots with concentric rings\n  • Starts on lower/older leaves\n  • Treat with chlorothalonil or mancozeb\n\n🔸 **Late Blight** (Phytophthora):\n  • Dark, water-soaked patches spreading fast\n  • Can destroy entire crop in days\n  • Apply metalaxyl + mancozeb immediately\n\n**Critical:** Remove and burn all infected plant material. Do NOT compost!"
            ]
        },
        {
            "keywords": ["harvest", "pick", "ripe", "ready"],
            "responses": [
                "Harvesting tips:\n\n🍅 **Tomatoes** — Pick when fully colored, firm but slightly soft\n🌽 **Corn** — Silk turns brown, kernels release milky juice\n🥔 **Potatoes** — Harvest 2-3 weeks after foliage dies back\n🌾 **Rice** — When 80-85% of grains are golden\n🍎 **Apples** — When they twist off easily and seeds are dark brown\n\n**Tip:** Harvest in the morning for best quality and shelf life."
            ]
        },
        {
            "keywords": ["seed", "sow", "plant", "germinate", "seedling"],
            "responses": [
                "Seed starting guide:\n\n🔸 **Seed depth** — plant 2x the seed's diameter deep\n🔸 **Temperature** — most seeds germinate at 20-30°C\n🔸 **Moisture** — keep soil moist but not soggy\n🔸 **Light** — most seeds don't need light to germinate\n🔸 **Transplant** — when seedlings have 2-4 true leaves\n\nSoak large seeds overnight before planting for faster germination."
            ]
        },
        {
            "keywords": ["weather", "rain", "climate", "season", "temperature"],
            "responses": [
                "Weather management tips:\n\n☀️ **Hot weather** — Mulch heavily, provide shade cloth, water morning\n🌧️ **Rainy season** — Improve drainage, raise beds, apply preventive fungicide\n❄️ **Cold weather** — Cover plants with row cover, mulch roots\n💨 **Strong winds** — Stake tall plants, use windbreaks\n\n**Tip:** Keep a weather journal to track patterns and plan your planting calendar."
            ]
        },
        {
            "keywords": ["organic", "natural", "chemical-free", "bio"],
            "responses": [
                "Organic farming essentials:\n\n🌿 **Pest control** — Neem oil, garlic spray, companion planting\n🌿 **Fertilizer** — Vermicompost, cow dung, green manure, bone meal\n🌿 **Disease prevention** — Crop rotation, resistant varieties\n🌿 **Weed control** — Mulching, hand weeding, cover crops\n\n**Benefits:** Better soil health, safer produce, premium market prices!"
            ]
        },
        {
            "keywords": ["hello", "hi", "hey", "help", "start"],
            "responses": [
                "Welcome to AgroVision! 🌱 I'm your farming assistant.\n\nI can help you with:\n🔸 Crop disease identification\n🔸 Fertilizer recommendations\n🔸 Irrigation and watering tips\n🔸 Pest control solutions\n🔸 Soil health advice\n🔸 Harvest timing\n\nJust ask me anything about your crops! For example:\n• \"Why are my leaves turning yellow?\"\n• \"How to treat leaf spot?\"\n• \"Best fertilizer for tomatoes?\"",
            ]
        },
        {
            "keywords": ["thank", "thanks", "great", "helpful"],
            "responses": [
                "You're welcome! 🌾 Happy to help. Feel free to ask more questions anytime.\n\nRemember: Regular monitoring is the key to healthy crops! Upload an image in the Analyze section for instant disease detection.",
                "Glad I could help! 😊 Good luck with your farming. If you notice any new issues, upload a crop image for quick diagnosis."
            ]
        }
    ],
    "hi": [
        {
            "keywords": ["yellow", "पीला", "पीली", "पत्तियां", "leaves", "yellowing"],
            "responses": [
                "पीली पत्तियों के कई कारण हो सकते हैं:\n\n🔸 **नाइट्रोजन की कमी** — यूरिया या अमोनियम सल्फेट डालें\n🔸 **ज़्यादा पानी** — मिट्टी को सूखने दें\n🔸 **आयरन की कमी** — आयरन खाद का उपयोग करें\n🔸 **प्राकृतिक उम्र** — नीचे की पत्तियों का पीला होना सामान्य है\n\nजांचें कि पीलापन नई या पुरानी पत्तियों पर है।"
            ]
        },
        {
            "keywords": ["leaf spot", "spots", "धब्बे", "भूरे", "काले"],
            "responses": [
                "पत्तियों पर धब्बे आमतौर पर फफूंद संक्रमण से होते हैं:\n\n🔸 **प्रभावित पत्तियां हटाएं**\n🔸 **फफूंदनाशक** — तांबा आधारित स्प्रे करें\n🔸 **हवा का प्रवाह** बढ़ाएं\n🔸 **ऊपर से पानी न दें** — जड़ में पानी दें\n🔸 **पौधों की दूरी** बनाए रखें"
            ]
        },
        {
            "keywords": ["pest", "कीट", "कीड़े", "insects", "bugs"],
            "responses": [
                "जैविक कीट नियंत्रण:\n\n🔸 **नीम का तेल** — 2ml प्रति लीटर पानी में मिलाकर स्प्रे करें\n🔸 **लहसुन-मिर्च स्प्रे** — प्राकृतिक कीट निवारक\n🔸 **पीले चिपचिपे जाल** — उड़ने वाले कीड़ों के लिए\n🔸 **गेंदे के फूल** लगाएं — कई कीटों को दूर रखते हैं\n\nरसायन कीटनाशक फसल कटाई के पास इस्तेमाल न करें!"
            ]
        },
        {
            "keywords": ["fertilizer", "खाद", "उर्वरक", "nutrient"],
            "responses": [
                "खाद गाइड:\n\n🌿 **सब्जियां** — संतुलित NPK (10-10-10) हर 2-3 हफ्ते\n🍅 **टमाटर** — फलने पर पोटाश ज़्यादा (5-10-15)\n🌾 **धान/गेहूं** — बढ़त के समय यूरिया\n\n**सुझाव:** खाद डालने से पहले और बाद में अच्छे से पानी दें।\nजैविक विकल्प: वर्मी कम्पोस्ट, गोबर की खाद, हड्डी का चूरा"
            ]
        },
        {
            "keywords": ["water", "पानी", "सिंचाई", "irrigation"],
            "responses": [
                "सिंचाई के सुझाव:\n\n🔸 **सुबह पानी दें** — फफूंद रोग का खतरा कम\n🔸 **टपक सिंचाई** — 30-50% पानी बचाता है\n🔸 **मल्चिंग** — पानी का वाष्पीकरण 25% कम करती है\n🔸 **मिट्टी जांचें** — 2 इंच गहराई पर\n\n**याद रखें:** ज़्यादा पानी कम पानी से ज़्यादा नुकसानदायक है!"
            ]
        },
        {
            "keywords": ["hello", "hi", "नमस्ते", "help", "मदद"],
            "responses": [
                "AgroVision में आपका स्वागत है! 🌱 मैं आपका कृषि सहायक हूं।\n\nमैं मदद कर सकता हूं:\n🔸 फसल रोग पहचान\n🔸 खाद सलाह\n🔸 सिंचाई सुझाव\n🔸 कीट नियंत्रण\n🔸 मिट्टी स्वास्थ्य\n\nकुछ भी पूछें! जैसे:\n• \"पत्तियां पीली क्यों हो रही हैं?\"\n• \"कीट नियंत्रण कैसे करें?\""
            ]
        },
        {
            "keywords": ["thank", "thanks", "धन्यवाद", "शुक्रिया"],
            "responses": [
                "आपकी सेवा में! 🌾 कभी भी सवाल पूछें।\n\nयाद रखें: नियमित निगरानी स्वस्थ फसल की कुंजी है! त्वरित रोग पहचान के लिए फसल की तस्वीर अपलोड करें।"
            ]
        }
    ]
}

# ── Default response when no match found ──────────────────────────
DEFAULT_RESPONSES = {
    "en": [
        "I'm not sure about that, but here are some general tips:\n\n🔸 Monitor your crops daily for any changes\n🔸 Upload a crop image in the Analyze section for instant diagnosis\n🔸 Keep soil healthy with regular composting\n🔸 Water in the morning, not evening\n\nTry asking about specific topics like 'pest control', 'fertilizer', or 'yellow leaves'.",
        "I don't have specific information on that. Here are some things I can help with:\n\n• Crop disease identification\n• Fertilizer and nutrient advice\n• Irrigation best practices\n• Pest management\n• Soil health\n\nAsk me about any of these topics!"
    ],
    "hi": [
        "इस बारे में मेरे पास जानकारी नहीं है। कुछ सामान्य सुझाव:\n\n🔸 फसलों की रोज़ जांच करें\n🔸 रोग पहचान के लिए तस्वीर अपलोड करें\n🔸 मिट्टी में जैविक खाद डालते रहें\n\n'कीट नियंत्रण', 'खाद', या 'पीली पत्तियां' जैसे विषय पूछें।"
    ]
}

PROJECT_SUMMARY = {
    "en": (
        "AgroVision is a real-time crop monitoring platform. It combines a React + Vite frontend with a FastAPI backend "
        "to analyze crop leaf images, detect diseases, and provide treatment guidance. The project includes a farm zone map, "
        "analytics dashboards, weather-aware recommendations, and a bilingual assistant (English/Hindi) for field support."
    ),
    "hi": (
        "AgroVision एक रियल-टाइम फसल मॉनिटरिंग प्लेटफॉर्म है। इसमें React + Vite frontend और FastAPI backend मिलकर "
        "फसल पत्तियों की तस्वीरों का विश्लेषण करते हैं, रोग पहचानते हैं और उपचार सलाह देते हैं। इसमें farm zone map, "
        "analytics dashboard, मौसम-आधारित सुझाव और English/Hindi द्विभाषी सहायक शामिल हैं।"
    ),
}

OUT_OF_SCOPE_RESPONSES = {
    "en": "I can only answer AgroVision project and crop-monitoring related questions. Try asking about disease analysis, farm zones, weather insights, or project summary.",
    "hi": "मैं केवल AgroVision प्रोजेक्ट और फसल मॉनिटरिंग से जुड़े सवालों का जवाब दे सकता हूं। आप रोग विश्लेषण, फार्म ज़ोन, मौसम जानकारी या प्रोजेक्ट सारांश पूछ सकते हैं।",
}


class AgriChatbot:
    """
    Rule-based chatbot for agricultural advice.
    
    Matches user queries against keyword patterns in the knowledge base
    and returns farmer-friendly responses in English or Hindi.
    """

    def __init__(self):
        self.knowledge_base = KNOWLEDGE_BASE
        self.default_responses = DEFAULT_RESPONSES

    def _find_best_match(self, message: str, lang: str) -> str | None:
        """Find the best matching response using keyword scoring."""
        message_lower = message.lower()
        kb = self.knowledge_base.get(lang, self.knowledge_base["en"])

        best_score = 0
        best_responses = None

        for entry in kb:
            score = sum(1 for kw in entry["keywords"] if kw.lower() in message_lower)
            if score > best_score:
                best_score = score
                best_responses = entry["responses"]

        if best_score > 0 and best_responses:
            return random.choice(best_responses)
        return None

    def get_project_summary(self, lang: str = "en") -> str:
        return PROJECT_SUMMARY.get(lang, PROJECT_SUMMARY["en"])

    def get_out_of_scope_response(self, lang: str = "en") -> str:
        return OUT_OF_SCOPE_RESPONSES.get(lang, OUT_OF_SCOPE_RESPONSES["en"])

    def get_response(self, message: str, lang: str = "en") -> str:
        """
        Generate a response to a user message.
        
        Args:
            message: User's question/message.
            lang: Language code ('en' or 'hi').
            
        Returns:
            Chatbot response string.
        """
        if not message or not message.strip():
            if lang == "hi":
                return "कृपया अपना सवाल लिखें। मैं आपकी मदद करने के लिए यहां हूं! 🌱"
            return "Please type your question. I'm here to help! 🌱"

        response = self._find_best_match(message, lang)
        if response:
            return response

        # Try English knowledge base as fallback for Hindi queries
        if lang == "hi":
            response = self._find_best_match(message, "en")
            if response:
                return response

        return random.choice(self.default_responses.get(lang, self.default_responses["en"]))


# Singleton instance
chatbot = AgriChatbot()
