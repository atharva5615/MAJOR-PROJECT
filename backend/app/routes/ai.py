
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.db_connection import get_db
from models import AIAnalysis, CivicIssue, User
from routes.auth import get_current_user
from schemas.ai import AIAnalysisResponse
from services.ai_service import analyze_complaint


router = APIRouter(
    prefix="/api/v1/ai",
    tags=["AI Analysis"]
)

UPLOAD_DIR = (Path(__file__).resolve().parents[2] / "uploads").resolve()


@router.post(
    "/analyze/{issue_id}",
    response_model=AIAnalysisResponse
)
def analyze_issue(
    issue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Find complaint
    issue = db.query(CivicIssue).filter(
        CivicIssue.id == issue_id
    ).first()

    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Civic issue not found"
        )

    # Check user permissions
    if (
        current_user.role not in ["officer", "admin"]
        and issue.user_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to analyze this issue"
        )

    # Check uploaded image
    if not issue.image_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Upload a complaint image before requesting AI analysis"
        )

    # Resolve and validate image path
    filename = Path(issue.image_url).name
    image_path = (UPLOAD_DIR / filename).resolve()

    if image_path.parent != UPLOAD_DIR:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid complaint image path"
        )

    if not image_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint image file not found"
        )

        # Connect to Member 3's AI model through the service
    try:
        result = analyze_complaint(
            image_path=str(image_path),
            description=issue.description
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI analysis service is currently unavailable"
        )

    # Save or update AI analysis in the database
    try:
        analysis = db.query(AIAnalysis).filter(
            AIAnalysis.civic_issue_id == issue_id
        ).first()

        analysis_data = {
            "available": result.available,
            "model_status": result.model_status,
            "detected_category": result.detected_category,
            "confidence": result.confidence,
            "severity": result.severity,
            "detections": [
                detection.model_dump()
                for detection in result.detections
            ],
            "classification": (
                result.classification.model_dump()
                if result.classification else None
            ),
            "severity_details": (
                result.severity_details.model_dump()
                if result.severity_details else None
            ),
            "device": result.device,
            "message": result.message,
        }

        if analysis:
            # Update existing analysis
            for key, value in analysis_data.items():
                setattr(analysis, key, value)
        else:
            # Create new analysis
            analysis = AIAnalysis(
                civic_issue_id=issue_id,
                **analysis_data
            )
            db.add(analysis)

        db.commit()

    except Exception as exc:
        db.rollback()
        print(f"AI analysis persistence error: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AI analysis completed but could not be saved"
        )

    return result

@router.get(
    "/analysis/{issue_id}",
    response_model=AIAnalysisResponse
)
def get_saved_ai_analysis(
    issue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Find complaint
    issue = db.query(CivicIssue).filter(
        CivicIssue.id == issue_id
    ).first()

    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Civic issue not found"
        )

    # Check user permissions
    if (
        current_user.role not in ["officer", "admin"]
        and issue.user_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to view this AI analysis"
        )

    # Fetch saved AI analysis
    analysis = db.query(AIAnalysis).filter(
        AIAnalysis.civic_issue_id == issue_id
    ).first()

    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AI analysis has not been performed for this issue"
        )

    # Return saved analysis without running inference again
    return AIAnalysisResponse(
        available=analysis.available,
        model_status=analysis.model_status,
        detected_category=analysis.detected_category,
        confidence=analysis.confidence,
        severity=analysis.severity,
        detections=analysis.detections or [],
        classification=analysis.classification,
        severity_details=analysis.severity_details,
        device=analysis.device,
        message=analysis.message
    )
