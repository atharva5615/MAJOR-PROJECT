
from pathlib import Path

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from sqlalchemy.orm import Session
from sqlalchemy import text

from database.db_connection import get_db, Base, engine

# Import models to register database tables
from models import (
    User,
    Department,
    CivicIssue,
    IssueUpdate,
    Comment,
    Notification,
    AuthorityNote
)

# Import API routers
from routes.auth import router as auth_router
from routes.issues import router as issues_router
from routes.departments import router as departments_router
from routes.notifications import router as notifications_router
from routes.dashboard import router as dashboard_router
from routes.ai import router as ai_router


# Create missing database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="CivicAI Backend",
    description="AI-Powered Civic Issue Reporting Platform",
    version="1.0.0"
)


# CORS CONFIGURATION
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# UPLOAD DIRECTORY
UPLOAD_DIR = Path(__file__).resolve().parents[1] / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(directory=str(UPLOAD_DIR)),
    name="uploads"
)


# REGISTER API ROUTERS
app.include_router(auth_router)
app.include_router(issues_router)
app.include_router(departments_router)
app.include_router(notifications_router)
app.include_router(dashboard_router)
app.include_router(ai_router)


# HOME
@app.get("/")
def home():
    return {
        "project": "CivicAI",
        "message": "CivicAI Backend is running!",
        "status": "success"
    }


# API HEALTH
@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CivicAI API"
    }


# DATABASE HEALTH
@app.get("/api/v1/db-health")
def database_health(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))

        return {
            "status": "success",
            "database": "PostgreSQL",
            "message": "Database connected successfully!"
        }

    except Exception:
        db.rollback()

        return {
            "status": "error",
            "message": "Database connection failed"
        }
