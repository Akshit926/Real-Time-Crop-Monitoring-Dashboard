AgroVision is a full-stack, AI-powered agricultural monitoring platform designed to help farmers detect crop diseases and manage farm health in real-time. It features a **FastAPI** backend powering a **MobileNetV2 CNN** (simulated) and a modern **React + Vite** frontend with a high-performance glassmorphism UI.
## 🚀 Features
 * **🔍 AI Disease Detection:** Upload or capture images via webcam to identify diseases across 6 major crops (Tomato, Potato, Corn, Rice, Wheat, Apple).
 * **📊 Interactive Analytics:** Real-time data visualization using Chart.js, including disease distribution and health trends.
 * **🗺️ Farm Zone Mapping:** SVG-based interactive map to monitor different sectors of a farm with color-coded health statuses.
 * **🤖 Local AI Chatbot:** A rule-based agricultural knowledge engine supporting 50+ Q&A pairs (No API keys required).
 * **🌐 Bilingual Support:** Seamless toggle between **English** and **Hindi** for localized accessibility.
 * **📱 Responsive Design:** Fully optimized for mobile and desktop with a sleek Dark Mode glassmorphism aesthetic.
## 🛠️ Tech Stack
| Component | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion, Chart.js |
| **Backend** | FastAPI (Python 3.9+), Uvicorn |
| **AI/ML** | MobileNetV2 (CNN Architecture), Pillow, NumPy |
| **Icons/UI** | Lucide React, Google Fonts (Inter & Outfit) |
## 📂 Project Structure
```text
AgroVision/
├── backend/
│   ├── main.py              # FastAPI entry point & CORS config
│   ├── model.py             # Simulated CNN Predictor logic
│   ├── chatbot.py           # Rule-based Knowledge Engine
│   └── requirements.txt     # Python dependencies
└── frontend/
    ├── src/
    │   ├── components/      # Reusable UI (Sidebar, Chatbot, Stats)
    │   ├── pages/           # Dashboard, Analyze, FarmMap, Analytics
    │   ├── context/         # Language & Global State
    │   └── utils/           # API wrappers & Translations
    └── vite.config.js       # Proxy configuration

```
## ⚙️ Installation & Setup
### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --port 8000

```
*The backend will be live at http://localhost:8000. You can view the Interactive API docs at /docs.*
### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev

```
*Open http://localhost:5173 in your browser.*
## 🧠 AI Model Approach
To ensure immediate "plug-and-play" capability without requiring 1GB+ dataset downloads or high-end GPUs, AgroVision utilizes a **Simulated Prediction Engine**:
 * **Logic:** The CropDiseasePredictor class processes real image uploads but uses texture/color analysis to return varied, realistic disease classifications.
 * **Extensibility:** The architecture is built to be "Production-Ready." You can replace the simulation with a trained .h5 or .pt model in model.py with a single-line change.
## 📈 Dashboard Overview
 * **Dashboard:** High-level overview of total scans and active alerts.
 * **Analyze:** The core utility where users interact with the CNN model via file upload or live camera.
 * **Farm Map:** A visual representation of the physical field divided into manageable zones.
 * **Analytics:** Deep-dive charts showing the "Why" and "When" of crop health fluctuations.
## 📝 License
Distributed under the MIT License. See LICENSE for more information.
**AgroVision** — *Empowering Agriculture through Intelligent Vision.*
