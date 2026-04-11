AgroVision is a full-stack, AI-powered agricultural monitoring platform designed to help farmers detect crop diseases and manage farm health in real-time. It features a **FastAPI** backend powering a **fine-tuned MobileNetV2 CNN** loaded from the provided `.h5` model, plus a modern **React + Vite** frontend with a high-performance glassmorphism UI.
## 🚀 Features
 * **🔍 AI Disease Detection:** Upload or capture images via webcam to identify diseases across the full PlantVillage label set used by the fine-tuned model.
 * **📊 Interactive Analytics:** Real-time data visualization using Chart.js, including disease distribution and health trends.
 * **🗺️ Farm Zone Mapping:** SVG-based interactive map to monitor different sectors of a farm with color-coded health statuses.
 * **🤖 AI Chatbot:** Intelligent agricultural assistant with OpenAI integration and local rule-based fallback (50+ Q&A pairs).
 * **🌦️ Weather Integration:** Real-time weather data from Open-Meteo API with farming advice.
 * **🌐 Bilingual Support:** Seamless toggle between **English** and **Hindi** for localized accessibility.
 * **📱 Responsive Design:** Fully optimized for mobile and desktop with a sleek Dark Mode glassmorphism aesthetic.
## 🛠️ Tech Stack
| Component | Technology |
|---|---|
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS, Framer Motion, Chart.js, React Router |
| **Backend** | FastAPI (Python 3.9+), Uvicorn |
| **AI/ML** | Fine-tuned MobileNetV2, TensorFlow/Keras, Pillow, NumPy |
| **APIs** | OpenAI (optional), Open-Meteo (weather) |
| **Icons/UI** | Lucide React, Google Fonts (Inter & Outfit) |
| **Deployment** | Vercel (serverless functions) |
## 📂 Project Structure
```text
Crop_Monitoring/
├── api/
│   └── index.py             # Vercel serverless API entry point
├── backend/
│   ├── __init__.py          # Package initialization
│   ├── main.py              # FastAPI entry point & CORS config
│   ├── model.py             # CNN Predictor logic with model loading
│   ├── chatbot.py           # Rule-based Knowledge Engine
│   ├── ai_chat.py           # OpenAI-powered chat with fallback
│   ├── weather.py           # Weather service (Open-Meteo API)
│   ├── crop_model.h5        # Pre-trained MobileNetV2 model
│   ├── test_predict.py      # Model testing utilities
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── index.html           # Main HTML template
│   ├── package.json         # Frontend dependencies
│   ├── tsconfig.json        # TypeScript configuration
│   ├── vite.config.js       # Vite build configuration
│   ├── public/              # Static assets
│   └── src/
│       ├── App.jsx          # Main React app component
│       ├── main.jsx         # React entry point
│       ├── main.ts          # TypeScript declarations
│       ├── index.css        # Global styles
│       ├── style.css        # Additional styles
│       ├── assets/          # Asset files
│       ├── components/      # Reusable UI components
│       │   ├── AlertTicker.jsx/css
│       │   ├── Chatbot.jsx/css
│       │   ├── DetectionCard.jsx/css
│       │   ├── Sidebar.jsx/css
│       │   ├── StatsCard.jsx/css
│       │   └── WeatherPanel.jsx/css
│       ├── context/         # React context providers
│       │   └── LanguageContext.jsx
│       ├── pages/           # Page components
│       │   ├── Analytics.jsx/css
│       │   ├── Analyze.jsx/css
│       │   ├── Dashboard.jsx/css
│       │   └── FarmMap.jsx/css
│       └── utils/           # Utility functions
│           ├── api.js       # API client
│           └── translations.js # Localization
├── package.json             # Monorepo root configuration
├── requirements.txt         # Additional Python deps (if needed)
├── vercel.json              # Vercel deployment config
└── README.md                # This file

```
## ⚙️ Installation & Setup
### Prerequisites
- Node.js >= 22.0.0
- Python 3.9+
- npm or yarn

### 1. Clone and Setup Monorepo
```bash
# Install root dependencies
npm install

# This will install dependencies for both frontend and backend workspaces
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# For local development
uvicorn main:app --reload --port 8000
```
*The backend will be live at http://localhost:8000. Interactive API docs available at /docs.*

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not done via monorepo)
npm install

# Start development server
npm run dev
```
*Open http://localhost:5173 in your browser.*

## 🚀 Deployment
### Vercel Deployment
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
- Proper routing for API endpoints

## 🧠 AI Model Approach
AgroVision loads the provided fine-tuned `.h5` MobileNetV2 model for real-time inference:
 * **Logic:** Images are resized to 224x224, preprocessed for MobileNetV2, and classified using the trained model.
 * **Output:** Returns crop type, disease, confidence score, explanation, and treatment recommendations.
 * **Fallback:** If TensorFlow is unavailable, provides simulated responses for development.
 * **Note:** Requires TensorFlow-compatible environment for full functionality.

## 🤖 Chatbot Features
- **Primary:** OpenAI GPT integration for intelligent agricultural advice
- **Fallback:** Local rule-based system with 50+ pre-defined Q&A pairs
- **Weather-Aware:** Incorporates current weather conditions in responses
- **Bilingual:** Supports both English and Hindi queries

## 📈 Dashboard Overview
 * **Dashboard:** Overview of scan history, active alerts, and key metrics.
 * **Analyze:** Core disease detection interface with file upload and camera capture.
 * **Farm Map:** Interactive SVG map for zone-based farm monitoring.
 * **Analytics:** Detailed charts and trends for crop health analysis.

## 📝 License
Distributed under the MIT License. See LICENSE for more information.
**AgroVision** — *Empowering Agriculture through Intelligent Vision.*
