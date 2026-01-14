# Pose2Fit - AI-Powered Virtual Try-On & Body Analysis

Pose2Fit is a state-of-the-art web application that combines advanced computer vision with AI to provide accurate body measurements and a revolutionary virtual try-on experience.

## 🚀 Features

- 📏 **AI Body Analysis**: Get precise measurements (Shoulder, Chest, Waist, Hip, Height, Inseam) from simple photos.
- 👔 **Size Recommendations**: Intelligent size suggestions across various garment categories based on your unique body profile.
- 🎭 **Virtual Try-On Studio**: Experience clothing simulation powered by n8n workflows.
- 📊 **Real-time Visualization**: See AI pose detection in action with skeleton overlays.
- 🌓 **Modern UI**: Sleek, responsive design with dark mode support.
- 💾 **Data Privacy**: Secure handling of user data and demo requests.

## 🛠 Tech Stack

### Frontend
- **Framework**: React with Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **API Client**: Axios

### Backend
- **Framework**: FastAPI (Python)
- **Computer Vision**: MediaPipe, OpenCV
- **Database**: MongoDB (for demo requests and analytics)
- **Workflow**: n8n integration for virtual try-on simulation

## 📦 Installation & Setup

### 1. Prerequisites
- Python 3.8+
- Node.js & npm
- MongoDB (running instance)

### 2. Backend Setup
```bash
cd backend
python -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate
pip install -r requirements.txt
cp .env.example .env     # Update your MongoDB URI in .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The application will be available at `http://localhost:5173`.

## ⚙️ Configuration

### n8n Integration
The Virtual Try-On Studio is pre-configured with the production webhook:
- **Webhook URL**: `https://n8n.intelligens.app/webhook/avatar_url`
- **Payload**: Sends binary image as `multipart/form-data` (field: `image`) and `outfit` name (field: `outfit`).
- **Response**: Expects either a direct URL string or a JSON object containing a URL field (e.g., `output_image`, `image_url`, or `url`).

To change the webhook, update the `N8N_WEBHOOK_URL` constant in `frontend/src/components/VirtualTryOnStudio.tsx`.

### MongoDB
Update the `.env` file in the `backend` directory with your MongoDB credentials. The application stores demo requests in the `form data` collection.

## 📝 Photo Guidelines
For best accuracy:
- Wear fitted clothing.
- Stand 2-3 meters from the camera.
- Ensure good, even lighting.
- Use a plain background.
- Ensure your full body is visible (head to feet).

## 📄 License
MIT License
