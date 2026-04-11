# 🌿 AgroVision — AI-Powered Crop Monitoring Dashboard

### 🚀 Innovate Maharashtra: Gemini & Gen AI Hackathon 2026 Submission

---

## 🧠 Executive Summary

AgroVision is a **full-stack AI-powered agricultural platform** designed to help farmers detect crop diseases, monitor farm health, and receive intelligent advisory in real-time.

By combining **Computer Vision (CNN) + Generative AI (Gemini)**, AgroVision acts as a **digital agronomist**, delivering scalable and multilingual farming intelligence across Maharashtra.

---

## 🎯 Problem Statement

Farmers in Maharashtra face major challenges:

* 🌾 25–30% crop loss due to undetected diseases
* 🌦️ Unpredictable climate conditions
* 👨‍🌾 Limited expert access in rural regions
* 🗣️ Lack of vernacular (Hindi/Marathi) tools

👉 AgroVision solves this using **AI-driven disease detection + smart advisory system**.

---

## 🤖 AI Component (Technical Compliance)

AgroVision integrates multiple Google AI technologies:

* **Gemini 2.0 Flash API** → AI chatbot & reasoning
* **Google Vision API** → Image preprocessing & OCR
* **Vertex AI** → Model deployment & inference
* **MobileNetV2 CNN** → Disease detection model
* **Google AI SDK** → Backend integration

---

## 🏗️ Architecture Overview

```
User (Web App)
      ↓
React Frontend (Vite)
      ↓
FastAPI Backend (Cloud Run)
      ↓
Vertex AI + Gemini API
      ↓
Response (Prediction + Advice)
```

---

## ⚙️ Features

### 🔍 AI Disease Detection

* Upload or capture crop images
* CNN model predicts disease
* Outputs:

  * Disease name
  * Confidence score
  * Treatment suggestions

---

### 🤖 AI Chatbot (Gemini Powered)

* Multilingual (English + Hindi + Marathi-ready)
* Context-aware farming advice
* Weather-integrated responses

---

### 📊 Analytics Dashboard

* Disease trends
* Farm insights
* Chart.js visualizations

---

### 🌦️ Weather Integration

* Real-time data from Open-Meteo API
* Smart recommendations (e.g., irrigation/spraying alerts)

---

### 📓 Field Journal

* Track observations
* Add notes, weather, tags
* Useful for subsidies

---

### 🌿 Disease Library

* Searchable disease database
* Symptoms, causes, treatment

---

### ✅ Task Manager

* Schedule farm activities
* Track progress

---

## 🛠️ Tech Stack

| Layer      | Technology                     |
| ---------- | ------------------------------ |
| Frontend   | React 19, Vite, Chart.js       |
| Backend    | FastAPI, Python                |
| AI Model   | MobileNetV2 (TensorFlow/Keras) |
| AI APIs    | Gemini, Google Vision          |
| Deployment | Cloud Run / Vercel             |
| Database   | Cloud SQL                      |

---

## 📂 Project Structure

```
Crop_Monitoring/
├── backend/
├── frontend/
├── api/
├── README.md
```

---

## ⚙️ Installation & Setup

### Option A — Docker

```bash
docker compose up --build
```

Frontend: http://localhost:5173
Backend: http://localhost:8000

---

### Option B — Local Setup

#### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Environment Variables

Create `.env`:

```
GOOGLE_API_KEY=your_key
GOOGLE_MODEL=gemini-2.0-flash
```

---

## 🚀 Deployment (GCP - Required)

```bash
gcloud run deploy agrovision \
--source . \
--region asia-south1 \
--allow-unauthenticated
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description       |
| ------ | -------- | ----------------- |
| GET    | /health  | Health check      |
| POST   | /predict | Disease detection |
| POST   | /chat    | AI chatbot        |
| GET    | /weather | Weather           |
| GET    | /journal | Logs              |
| POST   | /tasks   | Task manager      |

---

## 📊 Evaluation Criteria Alignment

| Criteria        | Implementation           |
| --------------- | ------------------------ |
| Innovation      | Gemini + CNN integration |
| Technical Depth | Multi-AI architecture    |
| Scalability     | Cloud Run deployment     |
| Impact          | Farmer-centric solution  |

---

## 🌍 Smart Governance Impact

* Maharashtra-ready system
* Vernacular AI support
* Scalable to millions of farmers
* Future integration with government systems

---

## 🔐 Security

* API keys secured
* No hardcoded credentials
* Production-ready backend

---

## 🛣️ Future Scope

* 📱 Mobile App
* 🗣️ Voice-based AI (Marathi)
* 📡 Satellite crop monitoring
* 🤖 AI Agents (Google ADK)

---

## 🔗 GitHub Repository

https://github.com/Akshit926/Real-Time-Crop-Monitoring-Dashboard

---

## 🏁 Final Pitch

**“AgroVision transforms smartphones into intelligent farming assistants, enabling data-driven agriculture across Maharashtra using AI.”**

---

## 📝 License

MIT License

---
