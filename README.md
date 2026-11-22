# CivicAI
## AI-Powered Citizen Issue Reporting and Resolution Platform

CivicAI is an AI-powered platform for reporting civic infrastructure problems and helping municipal authorities review, manage, and prioritize complaints.

## Features
- AI-based civic issue detection from images
- GPS location tracking
- Duplicate complaint detection
- Preliminary complaint severity estimation
- Municipal complaint management dashboard
- Complaint status tracking
- Geographic hotspot analytics

## Technology Stack
**Frontend:** React, Vite, Tailwind CSS, React Router, Leaflet / React Leaflet, Axios, Recharts
**Backend:** Python, FastAPI, SQLAlchemy, PostgreSQL, Alembic, GeoAlchemy2
**AI/ML:** YOLO11n (11-class object detection), ResNet18 (6-class image classification), PyTorch, Torchvision, OpenCV, Pillow, Scikit-learn

## Repository Structure
```text
ai-civic-platform/
├── frontend/                 # React/Vite application
├── backend/                  # FastAPI application and database migrations
│   ├── app/
│   ├── migrations/
│   ├── uploads/              # Local complaint-image storage (ignored by Git)
│   ├── requirements.txt
│   └── .env.example
├── ai-engine/                # AI inference code
│   ├── classification/
│   ├── inference/
│   ├── severity/
│   ├── training/
│   ├── ai_api.py
│   └── requirements.txt
├── runs/                     # YOLO model checkpoint (included)
└── README.md
```


## Prerequisites
Install these before setup:
- Git
- Node.js and npm
- Python (use a version compatible with the project's dependencies)
- PostgreSQL and PostGIS
- PyTorch and Torchvision (installed separately for the AI environment)

## Setup

### 1. Clone the repository
```bash
git clone https://github.com/SubrataGhosal/ai-civic-platform.git
cd ai-civic-platform
```

### 2. Create the PostgreSQL database
Create a database named `civicai_db` in PostgreSQL. Ensure PostGIS is installed and available if required by the GIS migrations.

### 3. Set up the backend
From the repository root:
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```
Edit `backend/.env` and set your local database credentials and a secure JWT secret:
```env
DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/civicai_db
JWT_SECRET_KEY=replace_with_a_secure_random_secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```
Run database migrations from the `backend` directory:
```powershell
alembic upgrade head
```
Start the backend from `backend/app`:
```powershell
cd app
uvicorn main:app --reload --port 8000
```
Backend endpoints:
- Base: `http://localhost:8000`
- Health: `http://localhost:8000/api/v1/health`
- Database health: `http://localhost:8000/api/v1/db-health`

### 4. Set up the AI engine
Open a separate terminal at the repository root:
```powershell
cd ai-engine
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```
Install compatible PyTorch and Torchvision separately using the official selector: https://pytorch.org/get-started/locally/

#### Model checkpoints
Both checkpoints are included in the repository and must remain at these paths:

- **YOLO11n:** `runs/detect/runs/civicai/yolo11n_11class_v1-5/weights/best.pt`
- **ResNet18:** `ai-engine/classification/runs/resnet18_v1/best_model.pth`

Start the AI inference API from the `ai-engine` directory:
```powershell
uvicorn ai_api:app --host 127.0.0.1 --port 8001
```
AI service endpoints:
- Base: `http://127.0.0.1:8001`
- Health: `http://127.0.0.1:8001/health`

### 5. Set up the frontend
Open another terminal at the repository root:
```powershell
cd frontend
npm install
npm run dev
```
Open the frontend at the URL printed by Vite (normally `http://localhost:5173`).

The frontend API base defaults to:
`http://localhost:8000/api/v1`

To override it, configure `VITE_API_BASE_URL` in a frontend environment file, for example:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Run all services
Run these three services in separate terminals:

**Terminal 1 — Backend** (from repository root):
```powershell
cd backend
.\venv\Scripts\Activate.ps1
cd app
uvicorn main:app --reload --port 8000
```

**Terminal 2 — AI Engine** (from repository root):
```powershell
cd ai-engine
.\venv\Scripts\Activate.ps1
uvicorn ai_api:app --host 127.0.0.1 --port 8001
```

**Terminal 3 — Frontend** (from repository root):
```powershell
cd frontend
npm run dev
```

Then visit the frontend URL shown by Vite, usually `http://localhost:5173`.

## AI Modules
- **YOLO11n object detection:** 11 detection classes; produces bounding boxes and confidence scores.
- **ResNet18 image classification:** 6 image-level classes; does not produce bounding boxes.
- **Hybrid inference:** returns the separate outputs from both models.
- **Severity estimation:** preliminary triage heuristic based on detections; not an engineering safety assessment.

## Experimental Evaluation Results
### YOLO11n — held-out test set
| Metric | Result |
|---|---:|
| Precision | 58.55% |
| Recall | 55.53% |
| mAP@50 | 57.44% |
| mAP@50-95 | 35.38% |

### ResNet18 — held-out test set
| Metric | Result |
|---|---:|
| Accuracy | 95.07% |
| Macro F1 | 0.89 |
| Weighted F1 | 0.94 |

These are experimental results and may not reflect performance on real-world images.

## Limitations
- YOLO currently supports 11 detection classes.
- ResNet18 currently supports 6 image-level classification classes.
- The models perform different tasks and may disagree.
- Severity estimation is preliminary and requires human review.
- Dataset size, class imbalance, and annotation quality affect generalization.
- AI predictions should not be treated as confirmed civic-issue assessments without human review.

## Academic Project
CivicAI is an academic project focused on AI-powered civic issue reporting, complaint management, and geographic analysis.
