AgroVision is a full-stack, AI-powered agricultural monitoring platform designed to help farmers detect crop diseases and manage farm health in real-time. It features a **FastAPI** backend powering a **fine-tuned MobileNetV2 CNN** loaded from the provided `.h5` model, plus a modern **React + Vite** frontend with a high-performance glassmorphism UI.
## 🚀 Features
 * **🔍 AI Disease Detection:** Upload or capture images via webcam to identify diseases across the full PlantVillage label set used by the fine-tuned model.
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
| **AI/ML** | Fine-tuned MobileNetV2, TensorFlow/Keras, Pillow, NumPy |
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
AgroVision now loads the provided fine-tuned `.h5` model directly for inference:
 * **Logic:** The backend resizes uploaded images to the model's expected input, runs the MobileNetV2 classifier, and returns the top label with softmax confidence.
 * **Output:** Each prediction includes the crop, disease, confidence, a plain-language reason, and practical treatment steps.
 * **Note:** The backend expects a TensorFlow-compatible Python environment so the `.h5` model can be loaded at runtime.
## 📈 Dashboard Overview
 * **Dashboard:** High-level overview of total scans and active alerts.
 * **Analyze:** The core utility where users interact with the CNN model via file upload or live camera.
 * **Farm Map:** A visual representation of the physical field divided into manageable zones.
 * **Analytics:** Deep-dive charts showing the "Why" and "When" of crop health fluctuations.
## 📝 License
Distributed under the MIT License. See LICENSE for more information.
**AgroVision** — *Empowering Agriculture through Intelligent Vision.*
