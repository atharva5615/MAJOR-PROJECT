# CivicAI
## AI-Powered Citizen Issue Reporting and Resolution Platform

CivicAI is an AI-powered platform for reporting civic infrastructure problems and helping municipal authorities review, manage, and prioritize complaints.

## Features

- AI-based civic issue detection from images
- GPS location tracking and interactive location selection
- Duplicate complaint detection and authority review
- Preliminary complaint severity estimation
- Municipal complaint management dashboard
- Complaint status tracking
- GIS-based complaint map for administrators

> Geographic hotspot analytics are not currently implemented. The admin map displays mapped complaints and supports filtering.

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
│   ├── start_backend.cmd
│   ├── requirements.txt
│   └── .env.example
├── ai-engine/                # AI inference code
│   ├── classification/
│   ├── inference/
│   ├── severity/
│   ├── training/
│   ├── start_ai_engine.cmd
│   ├── ai_api.py
│   └── requirements.txt
├── runs/                     # YOLO model checkpoint
└── README.md
```

## Prerequisites

Install the following before setup:

- Git
- Node.js and npm
- Python compatible with the pinned project dependencies
- PostgreSQL with the PostGIS extension
- PyTorch and Torchvision (installed separately in the AI environment)

## Setup

### 1. Clone the `develop` branch

The active project branch is `develop`. Clone that branch explicitly:

```powershell
git clone --branch develop https://github.com/SubrataGhosal/ai-civic-platform.git
cd ai-civic-platform
```

### 2. Create the PostgreSQL database

Create a PostgreSQL database named `civicai_db`. Connect to that database and enable PostGIS:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

PostGIS must be enabled before the backend creates its geospatial column and index.

### 3. Set up the backend

From the repository root:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `backend/.env` and set your local database credentials and a strong, private JWT secret:

```env
DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/civicai_db
JWT_SECRET_KEY=replace_with_a_secure_random_secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Do not commit your real `.env` file or share its secret values.

#### Initialize a fresh database

The backend currently creates missing tables from its SQLAlchemy models when it starts. Start it once to initialize a new database:

```powershell
.\start_backend.cmd
```

Wait until the application reports that startup is complete, then stop it with `Ctrl+C`.

The checked-in Alembic baseline is a no-op intended for an existing schema; later revisions assume the core tables already exist. Therefore, do **not** run `alembic upgrade head` against a completely empty database before the backend has initialized its tables.

After the first successful initialization, mark the database at the current migration head so future Alembic revisions can be applied normally:

```powershell
.\venv\Scripts\python.exe -m alembic stamp head
```

For an existing database that is already correctly tracked by Alembic, apply pending migrations from the `backend` directory with:

```powershell
alembic upgrade head
```

### 4. Set up the AI engine

Open a separate PowerShell terminal at the repository root:

```powershell
cd ai-engine
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
```

Install a compatible PyTorch and Torchvision build using the official selector for your operating system and CUDA version:

https://pytorch.org/get-started/locally/

Then install the remaining AI dependencies:

```powershell
pip install -r requirements.txt
```

#### Model checkpoints

Both model checkpoints are included in the repository and are expected at these paths:

- **YOLO11n:** `runs/detect/runs/civicai/yolo11n_11class_v1-5/weights/best.pt`
- **ResNet18:** `ai-engine/classification/runs/resnet18_v1/best_model.pth`

The YOLO checkpoint path is relative to the repository root; the ResNet18 checkpoint path is relative to the `ai-engine` directory.

### 5. Set up the frontend

Open another terminal at the repository root:

```powershell
cd frontend
npm install
npm run dev
```

Open the frontend at the URL printed by Vite (normally `http://localhost:5173`).

The frontend backend API base defaults to:

```text
http://localhost:8001/api/v1
```

To override it, create `frontend/.env` and set:

```env
VITE_API_BASE_URL=http://localhost:8001/api/v1
```

Restart the Vite development server after changing frontend environment variables.

## Run all services

Run the following three services in separate terminals. The startup scripts use the virtual environments created above, so activating them manually is not required.

**Terminal 1 — Backend** (from the repository root):

```powershell
cd backend
.\start_backend.cmd
```

Backend:
- Base: `http://127.0.0.1:8001`
- Health: `http://127.0.0.1:8001/api/v1/health`
- Database health: `http://127.0.0.1:8001/api/v1/db-health`

**Terminal 2 — AI engine** (from the repository root):

```powershell
cd ai-engine
.\start_ai_engine.cmd
```

AI engine:
- Base: `http://127.0.0.1:8000`
- Health: `http://127.0.0.1:8000/health`

**Terminal 3 — Frontend** (from the repository root):

```powershell
cd frontend
npm run dev
```

Then visit the frontend URL shown by Vite, usually `http://localhost:5173`.

The backend connects to the AI engine at `http://127.0.0.1:8000` by default. The frontend communicates with the backend at `http://localhost:8001/api/v1` by default.

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
- The admin GIS map displays complaint locations; geographic hotspot analytics are not currently implemented.
- AI predictions should not be treated as confirmed civic-issue assessments without human review.

## Academic Project

CivicAI is an academic project focused on AI-powered civic issue reporting, complaint management, and geographic visualization.
