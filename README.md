# 🌿 AgroVision — AI-Powered Crop Monitoring Dashboard

AgroVision is a full-stack, AI-powered agricultural monitoring platform designed to help farmers detect crop diseases and manage farm health in real-time. It features a **FastAPI** backend powering a **fine-tuned MobileNetV2 CNN** loaded from the provided `.h5` model, plus a modern **React + Vite** frontend with a high-performance glassmorphism UI.

---

## 🚀 Features

- **🔍 AI Disease Detection:** Upload or capture images via webcam to identify diseases across the full PlantVillage label set used by the fine-tuned model.
- **📊 Interactive Analytics:** Real-time data visualization using Chart.js, including disease distribution and health trends.
- **🗺️ Farm Zone Mapping:** SVG-based interactive map to monitor different sectors of a farm with color-coded health statuses.
- **🤖 AI Chatbot:** Google AI Studio (Gemini) powered assistant with Groq/local fallback.
- **🌦️ Weather Integration:** Real-time weather data from Open-Meteo API with farming advice.
- **📓 Field Journal:** Log and track daily field observations with status, weather, tags, and notes.
- **🌿 Disease & Pest Library:** Searchable encyclopedia of 10+ crop diseases with symptoms, causes, treatment, and prevention.
- **✅ Farm Task Manager:** Schedule, prioritize, and track field activities (irrigation, spraying, scouting, etc.).
- **🌐 Bilingual Support:** Seamless toggle between **English** and **Hindi** for localized accessibility.
- **📱 Responsive Design:** Fully optimized for mobile and desktop with a sleek Dark Mode glassmorphism aesthetic.

---

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| **Frontend** | React 19, Vite, JavaScript, Chart.js, React Router |
| **Backend** | FastAPI (Python 3.9+), Uvicorn |
| **AI/ML** | Fine-tuned MobileNetV2, TensorFlow/Keras, Pillow, NumPy |
| **APIs** | Google AI Studio (Gemini, optional), Groq (optional), Open-Meteo (weather) |
| **Icons/UI** | Lucide React, Google Fonts (Inter & Outfit) |
| **Deployment** | Vercel (serverless functions) |

---

## 📂 Project Structure

```text
Crop_Monitoring/
├── api/
│   └── index.py               # Vercel serverless API entry point
├── backend/
│   ├── __init__.py            # Package initialization
│   ├── main.py                # FastAPI entry point & all API routes
│   ├── model.py               # CNN Predictor logic with model loading
│   ├── chatbot.py             # Rule-based Knowledge Engine
│   ├── ai_chat.py             # Groq-powered chat with fallback
│   ├── weather.py             # Weather service (Open-Meteo API)
│   ├── crop_model.h5          # Pre-trained MobileNetV2 model
│   ├── test_predict.py        # Model testing utilities
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── index.html             # Main HTML template
│   ├── package.json           # Frontend dependencies
│   ├── vite.config.js         # Vite build & proxy configuration
│   └── src/
│       ├── App.jsx            # Main React app component & routes
│       ├── main.jsx           # React entry point
│       ├── index.css          # Global design system & styles
│       ├── components/        # Reusable UI components
│       │   ├── AlertTicker.jsx/css
│       │   ├── Chatbot.jsx/css
│       │   ├── DetectionCard.jsx/css
│       │   ├── Sidebar.jsx/css
│       │   ├── StatsCard.jsx/css
│       │   └── WeatherPanel.jsx/css
│       ├── context/           # React context providers
│       │   └── LanguageContext.jsx
│       ├── pages/             # Page components
│       │   ├── Analytics.jsx/css
│       │   ├── Analyze.jsx/css
│       │   ├── Dashboard.jsx/css
│       │   ├── DiseaseLibrary.jsx/css   # NEW
│       │   ├── FarmMap.jsx/css
│       │   ├── FieldJournal.jsx/css     # NEW
│       │   └── TaskManager.jsx/css      # NEW
│       └── utils/             # Utility functions
│           ├── api.js         # API client (all endpoints)
│           └── translations.js # EN + HI localization
├── package.json               # Monorepo root configuration
├── requirements.txt           # Python deps
├── vercel.json                # Vercel deployment config
└── README.md                  # This file
```

---

## ⚙️ Installation & Setup

### Option A — Docker (Recommended for teams)

Use Docker so everyone runs the same environment and dependencies.

```bash
docker compose up --build
```

This starts:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

To stop:

```bash
docker compose down
```

---

### Option B — Local Setup (No Docker)

#### Prerequisites
- Node.js >= 18.0.0
- Python 3.9+ (Python 3.11 recommended)
- npm

#### 1. Install root & frontend dependencies

```bash
# At project root
npm install
```

#### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt

# Start the API server
uvicorn main:app --reload --port 8000
```

The backend will be live at **http://localhost:8000**. Interactive API docs at **/docs**.

#### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

### Enable AI Chat (Optional)

Create a `.env` file at the repository root:

```env
# Preferred: Google AI Studio (Gemini)
GOOGLE_API_KEY=your_google_ai_studio_api_key_here
GOOGLE_MODEL=gemini-2.0-flash

# Optional fallback: Groq
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

Provider order is: `Google AI Studio -> Groq/OpenAI-compatible -> local rule-based chatbot`.

---

## 🚀 Deployment (Vercel)

The project is configured for seamless deployment on Vercel:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

The `vercel.json` configuration handles:
- Frontend build and static file serving
- Python serverless functions for the API
- Proper routing for all API endpoints

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `GET` | `/health` | Model status |
| `POST` | `/predict` | AI disease prediction (image upload) |
| `POST` | `/chat` | Agricultural chatbot |
| `GET` | `/weather` | Live weather & farming advice |
| `GET` | `/zones` | Farm zone data |
| `GET` | `/journal` | Get all journal entries |
| `POST` | `/journal` | Add a new journal entry |
| `DELETE` | `/journal/{id}` | Delete a journal entry |
| `GET` | `/tasks` | Get all farm tasks |
| `POST` | `/tasks` | Create a new task |
| `PATCH` | `/tasks/{id}/status` | Update task status |
| `DELETE` | `/tasks/{id}` | Delete a task |

---

## 🧠 AI Model

AgroVision loads the provided fine-tuned `.h5` MobileNetV2 model for real-time inference:
- **Logic:** Images are resized to 224×224, preprocessed for MobileNetV2, and classified using the trained model.
- **Output:** Returns crop type, disease, confidence score, explanation, and treatment recommendations.
- **Fallback:** If TensorFlow is unavailable, provides simulated responses for development.
- **Note:** Requires TensorFlow-compatible environment for full functionality.

---

## 🤖 Chatbot Features

- **Primary:** Google AI Studio (Gemini) integration for intelligent agricultural advice
- **Fallback 1:** Groq/OpenAI-compatible provider (if configured)
- **Fallback 2:** Local rule-based system with 50+ pre-defined Q&A pairs
- **Weather-Aware:** Incorporates current weather conditions in responses
- **Bilingual:** Supports both English and Hindi queries
- **Project-only guard:** Out-of-scope prompts are politely declined

---

## 📈 Pages Overview

| Page | Route | Description |
|---|---|---|
| Dashboard | `/` | Overview of scan history, alerts, weather, and metrics |
| Analyze | `/analyze` | AI disease detection via image upload or webcam |
| Farm Map | `/farm-map` | Interactive SVG map for zone-based monitoring |
| Analytics | `/analytics` | Charts and trends for crop health data |
| Field Journal | `/journal` | Log and track daily field observations |
| Disease Library | `/library` | Encyclopedia of crop diseases with treatments |
| Farm Tasks | `/tasks` | Schedule and track field activities |

---

## 📝 License

Distributed under the MIT License. See LICENSE for more information.

**AgroVision** — *Empowering Agriculture through Intelligent Vision.*
