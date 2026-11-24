
import uuid
from pathlib import Path

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    UploadFile,
    File,
    Query
)
from sqlalchemy.orm import Session
from sqlalchemy import or_
from geoalchemy2.elements import WKTElement

from database.db_connection import get_db

from models import (
    CivicIssue,
    User,
    IssueUpdate,
    Department,
    Comment,
    IssueDepartmentHistory,
    AuthorityNote,
    DuplicateReview
)

from schemas.issue import (
    CivicIssueCreate,
    CivicIssueResponse,
    AdminCivicIssueResponse,
    CivicIssueUploadResponse,
    IssuePriorityUpdate,
    AuthorityNoteCreate,
    AuthorityNoteResponse,
    DuplicateReviewResponse,
    DuplicateReviewCreate,
)

from schemas.issue_update import IssueStatusUpdate, IssueUpdateResponse
from schemas.department import DepartmentAssignment, DepartmentResponse
from schemas.comment import CommentCreate, CommentResponse
from schemas.issue_department_history import DepartmentHistoryResponse

from routes.auth import get_current_user
from services.notification_service import create_notification
from services.image_hash_service import generate_image_hash
from services.duplicate_detection_service import find_duplicate_candidates


router = APIRouter(
    prefix="/api/v1/issues",
    tags=["Civic Issues"]
)


# --------------------------------------------------
# IMAGE UPLOAD CONFIGURATION
# --------------------------------------------------

UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png"
}

MAX_FILE_SIZE = 5 * 1024 * 1024


# --------------------------------------------------
# ISSUE STATUS WORKFLOW
# --------------------------------------------------

STATUS_TRANSITIONS = {
    "reported": {"in_progress"},
    "in_progress": {"resolved"},
    "resolved": set()
}

ALLOWED_STATUSES = set(STATUS_TRANSITIONS.keys())


# --------------------------------------------------
# OFFICER / ADMIN AUTHORIZATION
# --------------------------------------------------

def require_officer(current_user: User):
    if current_user.role not in ["officer", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only officers and administrators can perform this action"
        )


# --------------------------------------------------
# ISSUE ACCESS AUTHORIZATION
# --------------------------------------------------

def check_issue_access(issue: CivicIssue, current_user: User):
    if (
        current_user.role not in ["officer", "admin"]
        and issue.user_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to access this issue"
        )


# --------------------------------------------------
# CREATE CIVIC ISSUE
# --------------------------------------------------

@router.post(
    "/",
    response_model=CivicIssueResponse,
    status_code=status.HTTP_201_CREATED
)
def create_issue(
    issue_data: CivicIssueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Create new civic issue
    new_issue = CivicIssue(
        title=issue_data.title,
        description=issue_data.description,
        category=issue_data.category,
        latitude=issue_data.latitude,
        longitude=issue_data.longitude,
        address=issue_data.address,
        priority="medium",
        status="reported",
        user_id=current_user.id
    )

    if (
        issue_data.latitude is not None
        and issue_data.longitude is not None
    ):
        new_issue.location = WKTElement(
            f"POINT({issue_data.longitude} {issue_data.latitude})",
            srid=4326
        )

    try:
        db.add(new_issue)
        db.flush()

        initial_update = IssueUpdate(
            issue_id=new_issue.id,
            updated_by=current_user.id,
            old_status=None,
            new_status="reported",
            remarks="Issue submitted"
        )

        db.add(initial_update)
        db.commit()
        db.refresh(new_issue)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to submit civic issue"
        )

    return new_issue


# --------------------------------------------------
# GET MY ISSUES
# --------------------------------------------------

@router.get(
    "/my-issues",
    response_model=list[CivicIssueResponse]
)
def get_my_issues(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(CivicIssue).filter(
        CivicIssue.user_id == current_user.id
    ).order_by(
        CivicIssue.created_at.desc()
    ).all()


# --------------------------------------------------
# GET ALL CIVIC ISSUES (OFFICER / ADMIN)
# --------------------------------------------------

@router.get(
    "/",
    response_model=list[AdminCivicIssueResponse]
)
def get_all_issues(
    issue_status: str | None = Query(
        default=None,
        alias="status"
    ),
    category: str | None = Query(default=None),
    search: str | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_officer(current_user)

    query = db.query(CivicIssue)

    if issue_status:
        issue_status = issue_status.strip().lower()

        if issue_status not in ALLOWED_STATUSES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid issue status"
            )

        query = query.filter(
            CivicIssue.status == issue_status
        )

    if category and category.strip():
        query = query.filter(
            CivicIssue.category.ilike(
                f"%{category.strip()}%"
            )
        )

    if search and search.strip():
        search_term = f"%{search.strip()}%"

        query = query.filter(
            (CivicIssue.title.ilike(search_term))
            |
            (CivicIssue.description.ilike(search_term))
        )

    # Fetch the requested complaint page.
    issues = query.order_by(
        CivicIssue.created_at.desc()
    ).offset(skip).limit(limit).all()

    issue_ids = [issue.id for issue in issues]

    # Prepare an empty duplicate-review list for each complaint.
    reviews_by_issue = {
        issue_id: [] for issue_id in issue_ids
    }

    if issue_ids:
        # Fetch relevant reviews in one database query.
        reviews = db.query(DuplicateReview).filter(
            or_(
                DuplicateReview.original_issue_id.in_(issue_ids),
                DuplicateReview.duplicate_issue_id.in_(issue_ids)
            )
        ).order_by(
            DuplicateReview.created_at.desc(),
            DuplicateReview.id.desc()
        ).all()

        # Keep only the latest review for each complaint pair.
        seen_pairs = set()

        for review in reviews:
            pair_key = tuple(sorted((
                review.original_issue_id,
                review.duplicate_issue_id
            )))

            if pair_key in seen_pairs:
                continue

            seen_pairs.add(pair_key)

            # Attach the relationship to the original complaint.
            if review.original_issue_id in reviews_by_issue:
                reviews_by_issue[
                    review.original_issue_id
                ].append({
                    "related_issue_id": review.duplicate_issue_id,
                    "decision": review.decision,
                    "reviewed_at": review.created_at
                })

            # Attach the same relationship to the other complaint.
            if review.duplicate_issue_id in reviews_by_issue:
                reviews_by_issue[
                    review.duplicate_issue_id
                ].append({
                    "related_issue_id": review.original_issue_id,
                    "decision": review.decision,
                    "reviewed_at": review.created_at
                })

    # Construct the Admin-specific response.
    results = []

    for issue in issues:
        issue_data = CivicIssueResponse.model_validate(
            issue
        ).model_dump()

        issue_data["duplicate_reviews"] = reviews_by_issue[issue.id]

        results.append(
            AdminCivicIssueResponse.model_validate(issue_data)
        )

    return results


# --------------------------------------------------
# ADD COMMENT TO ISSUE
# --------------------------------------------------

@router.post(
    "/{issue_id}/comments",
    response_model=CommentResponse,
    status_code=status.HTTP_201_CREATED
)
def add_issue_comment(
    issue_id: int,
    comment_data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    issue = db.query(CivicIssue).filter(
        CivicIssue.id == issue_id
    ).first()

    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Civic issue not found"
        )

    check_issue_access(issue, current_user)

    message = comment_data.message.strip()

    if not message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Comment cannot be empty"
        )

    new_comment = Comment(
        issue_id=issue.id,
        user_id=current_user.id,
        message=message
    )

    try:
        db.add(new_comment)

        if current_user.id != issue.user_id:
            create_notification(
                db=db,
                user_id=issue.user_id,
                issue_id=issue.id,
                title="New Complaint Comment",
                message=(
                    f"A new comment was added to your complaint: "
                    f"{issue.title}"
                ),
                notification_type="new_comment"
            )

        db.commit()
        db.refresh(new_comment)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to add comment"
        )

    return new_comment


# --------------------------------------------------
# GET ALL COMMENTS FOR AN ISSUE
# --------------------------------------------------

@router.get(
    "/{issue_id}/comments",
    response_model=list[CommentResponse]
)
def get_issue_comments(
    issue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    issue = db.query(CivicIssue).filter(
        CivicIssue.id == issue_id
    ).first()

    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Civic issue not found"
        )

    check_issue_access(issue, current_user)

    return db.query(Comment).filter(
        Comment.issue_id == issue_id
    ).order_by(
        Comment.created_at.asc()
    ).all()


# --------------------------------------------------
# PRIVATE AUTHORITY NOTES
# --------------------------------------------------

@router.post(
    "/{issue_id}/authority-notes",
    response_model=AuthorityNoteResponse,
    status_code=status.HTTP_201_CREATED
)
def add_authority_note(
    issue_id: int,
    note_data: AuthorityNoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_officer(current_user)

    issue = db.query(CivicIssue).filter(
        CivicIssue.id == issue_id
    ).first()

    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Civic issue not found"
        )

    new_note = AuthorityNote(
        issue_id=issue.id,
        officer_id=current_user.id,
        message=note_data.message
    )

    try:
        db.add(new_note)
        db.commit()
        db.refresh(new_note)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to save authority note"
        )

    return new_note


@router.get(
    "/{issue_id}/authority-notes",
    response_model=list[AuthorityNoteResponse]
)
def get_authority_notes(
    issue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_officer(current_user)

    issue = db.query(CivicIssue).filter(
        CivicIssue.id == issue_id
    ).first()

    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Civic issue not found"
        )

    return db.query(AuthorityNote).filter(
        AuthorityNote.issue_id == issue_id
    ).order_by(
        AuthorityNote.created_at.asc(),
        AuthorityNote.id.asc()
    ).all()



# --------------------------------------------------
# ASSIGN ISSUE TO DEPARTMENT
# --------------------------------------------------

@router.put(
    "/{issue_id}/assign-department",
    response_model=CivicIssueResponse
)
def assign_issue_department(
    issue_id: int,
    assignment_data: DepartmentAssignment,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_officer(current_user)

    issue = db.query(CivicIssue).filter(
        CivicIssue.id == issue_id
    ).first()

    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Civic issue not found"
        )

    department = db.query(Department).filter(
        Department.id == assignment_data.department_id
    ).first()

    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found"
        )

    if not department.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot assign an issue to an inactive department"
        )

    if issue.department_id == department.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Issue is already assigned to this department"
        )

    try:
        old_department_id = issue.department_id

        issue.department_id = department.id

        assignment_history = IssueDepartmentHistory(
            issue_id=issue.id,
            old_department_id=old_department_id,
            new_department_id=department.id,
            assigned_by=current_user.id
        )

        db.add(assignment_history)

        create_notification(
            db=db,
            user_id=issue.user_id,
            issue_id=issue.id,
            title="Department Assigned",
            message=f"Your complaint has been assigned to {department.name}.",
            notification_type="department_assignment"
        )

        db.commit()
        db.refresh(issue)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to assign issue to department"
        )

    return issue

# --------------------------------------------------
# UPDATE ISSUE PRIORITY
# --------------------------------------------------

ALLOWED_PRIORITIES = {
    "critical",
    "high",
    "medium",
    "low"
}


@router.put(
    "/{issue_id}/priority",
    response_model=CivicIssueResponse
)
def update_issue_priority(
    issue_id: int,
    update_data: IssuePriorityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_officer(current_user)

    new_priority = update_data.priority

    if new_priority not in ALLOWED_PRIORITIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid priority"
        )

    issue = db.query(CivicIssue).filter(
        CivicIssue.id == issue_id
    ).with_for_update().first()

    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Civic issue not found"
        )

    if issue.priority == new_priority:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Issue already has this priority"
        )

    try:
        old_priority = issue.priority
        issue.priority = new_priority

        create_notification(
            db=db,
            user_id=issue.user_id,
            issue_id=issue.id,
            title="Complaint Priority Updated",
            message=(
                f"Your complaint priority has changed "
                f"from {old_priority} to {new_priority}."
            ),
            notification_type="priority_update"
        )

        db.commit()
        db.refresh(issue)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to update issue priority"
        )

    return issue


# --------------------------------------------------
# GET DEPARTMENT ASSIGNED TO AN ISSUE
# --------------------------------------------------

@router.get(
    "/{issue_id}/department",
    response_model=DepartmentResponse
)
def get_issue_department(
    issue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    issue = db.query(CivicIssue).filter(
        CivicIssue.id == issue_id
    ).first()

    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Civic issue not found"
        )

    check_issue_access(issue, current_user)

    if issue.department_id is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No department has been assigned to this issue"
        )

    department = db.query(Department).filter(
        Department.id == issue.department_id
    ).first()

    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assigned department not found"
        )

    return department


# --------------------------------------------------
# GET ISSUE DEPARTMENT ASSIGNMENT HISTORY
# --------------------------------------------------

@router.get(
    "/{issue_id}/department-history",
    response_model=list[DepartmentHistoryResponse]
)
def get_issue_department_history(
    issue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    issue = db.query(CivicIssue).filter(
        CivicIssue.id == issue_id
    ).first()

    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Civic issue not found"
        )

    check_issue_access(issue, current_user)

    history_records = db.query(
        IssueDepartmentHistory
    ).filter(
        IssueDepartmentHistory.issue_id == issue_id
    ).order_by(
        IssueDepartmentHistory.created_at.asc(),
        IssueDepartmentHistory.id.asc()
    ).all()

    response = []

    for record in history_records:
        response.append(
            {
                "id": record.id,
                "issue_id": record.issue_id,
                "old_department_id": record.old_department_id,
                "old_department_name": (
                    record.old_department.name
                    if record.old_department
                    else None
                ),
                "new_department_id": record.new_department_id,
                "new_department_name": record.new_department.name,
                "assigned_by": record.assigned_by,
                "officer_name": record.officer.full_name,
                "created_at": record.created_at
            }
        )

    return response


# --------------------------------------------------
# UPDATE ISSUE STATUS
# --------------------------------------------------

@router.put(
    "/{issue_id}/status",
    response_model=CivicIssueResponse
)
def update_issue_status(
    issue_id: int,
    update_data: IssueStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_officer(current_user)

    new_status = update_data.status.strip().lower()

    if new_status not in ALLOWED_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Allowed statuses: {sorted(ALLOWED_STATUSES)}"
        )

    issue = db.query(CivicIssue).filter(
        CivicIssue.id == issue_id
    ).with_for_update().first()

    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )

    old_status = issue.status

    if old_status == new_status:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Issue already has this status"
        )

    allowed_next_statuses = STATUS_TRANSITIONS.get(
        old_status,
        set()
    )

    if new_status not in allowed_next_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Invalid status transition from {old_status} "
                f"to {new_status}. "
                f"Allowed next statuses: "
                f"{sorted(allowed_next_statuses)}"
            )
        )

    try:
        issue.status = new_status

        history_entry = IssueUpdate(
            issue_id=issue.id,
            updated_by=current_user.id,
            old_status=old_status,
            new_status=new_status,
            remarks=update_data.remarks
        )

        db.add(history_entry)

        create_notification(
            db=db,
            user_id=issue.user_id,
            issue_id=issue.id,
            title="Complaint Status Updated",
            message=(
                f"Your complaint status has been changed "
                f"from {old_status} to {new_status}."
            ),
            notification_type="status_update"
        )

        db.commit()
        db.refresh(issue)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to update issue status"
        )

    return issue


# --------------------------------------------------
# GET ISSUE STATUS HISTORY
# --------------------------------------------------

@router.get(
    "/{issue_id}/status-history",
    response_model=list[IssueUpdateResponse]
)
def get_issue_status_history(
    issue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    issue = db.query(CivicIssue).filter(
        CivicIssue.id == issue_id
    ).first()

    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )

    check_issue_access(issue, current_user)

    return db.query(IssueUpdate).filter(
        IssueUpdate.issue_id == issue_id
    ).order_by(
        IssueUpdate.created_at.asc()
    ).all()


# --------------------------------------------------
# GET SINGLE ISSUE
# --------------------------------------------------

@router.get(
    "/{issue_id}",
    response_model=CivicIssueResponse
)
def get_issue(
    issue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    issue = db.query(CivicIssue).filter(
        CivicIssue.id == issue_id
    ).first()

    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )

    check_issue_access(issue, current_user)

    return issue


# --------------------------------------------------
# FIND POSSIBLE DUPLICATE ISSUES
# --------------------------------------------------

@router.get(
    "/{issue_id}/duplicates"
)
def get_issue_duplicates(
    issue_id: int,
    radius_metres: float = Query(default=50, gt=0),
    max_hamming_distance: int = Query(default=10, ge=0, le=64),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    issue = db.query(CivicIssue).filter(
        CivicIssue.id == issue_id
    ).first()

    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )

    check_issue_access(issue, current_user)

    if not issue.image_hash:
        return {
            "issue_id": issue.id,
            "message": "No image hash available for this issue",
            "duplicate_candidates": []
        }

    if not issue.location:
        return {
            "issue_id": issue.id,
            "message": "No GPS location available for this issue",
            "duplicate_candidates": []
        }

    try:
        candidates = find_duplicate_candidates(
            db=db,
            issue=issue,
            radius_metres=radius_metres,
            max_hamming_distance=max_hamming_distance
        )

        return {
            "issue_id": issue.id,
            "radius_metres": radius_metres,
            "max_hamming_distance": max_hamming_distance,
            "duplicate_count": len(candidates),
            "duplicate_candidates": candidates
        }

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to find duplicate issues"
        )

# --------------------------------------------------
# DUPLICATE REVIEW - SAVE AUTHORITY DECISION
# --------------------------------------------------

@router.post(
    "/{original_issue_id}/duplicates/{duplicate_issue_id}/review",
    response_model=DuplicateReviewResponse,
    status_code=status.HTTP_201_CREATED
)
def save_duplicate_review(
    original_issue_id: int,
    duplicate_issue_id: int,
    review_data: DuplicateReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_officer(current_user)

    if original_issue_id == duplicate_issue_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An issue cannot be reviewed as its own duplicate"
        )

    original_issue = db.query(CivicIssue).filter(
        CivicIssue.id == original_issue_id
    ).first()

    if not original_issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Original issue not found"
        )

    duplicate_issue = db.query(CivicIssue).filter(
        CivicIssue.id == duplicate_issue_id
    ).first()

    if not duplicate_issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Duplicate issue not found"
        )

    review = DuplicateReview(
        original_issue_id=original_issue_id,
        duplicate_issue_id=duplicate_issue_id,
        reviewed_by=current_user.id,
        decision=review_data.decision,
        authority_note=review_data.authority_note
    )

    try:
        db.add(review)
        db.commit()
        db.refresh(review)

        return review

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to save duplicate review"
        )


# --------------------------------------------------
# DUPLICATE REVIEW - GET REVIEW HISTORY
# --------------------------------------------------

@router.get(
    "/{original_issue_id}/duplicate-reviews",
    response_model=list[DuplicateReviewResponse]
)
def get_duplicate_reviews(
    original_issue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_officer(current_user)

    original_issue = db.query(CivicIssue).filter(
        CivicIssue.id == original_issue_id
    ).first()

    if not original_issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Original issue not found"
        )

    reviews = db.query(DuplicateReview).filter(
        DuplicateReview.original_issue_id == original_issue_id
    ).order_by(
        DuplicateReview.created_at.desc()
    ).all()

    return reviews




# --------------------------------------------------
# UPLOAD ISSUE IMAGE
# --------------------------------------------------

@router.post(
    "/{issue_id}/image",
    response_model=CivicIssueUploadResponse,
)
async def upload_issue_image(
    issue_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    issue = db.query(CivicIssue).filter(
        CivicIssue.id == issue_id,
        CivicIssue.user_id == current_user.id
    ).first()

    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )

    extension = ALLOWED_TYPES.get(file.content_type)

    if not extension:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPG and PNG images are allowed"
        )

    new_file_path = None

    try:
        contents = await file.read(MAX_FILE_SIZE + 1)

        if not contents:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Empty file"
            )

        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Image must be 5 MB or smaller"
            )

        is_jpeg = contents.startswith(b"\xff\xd8\xff")
        is_png = contents.startswith(b"\x89PNG\r\n\x1a\n")

        if not (
            (extension == ".jpg" and is_jpeg)
            or (extension == ".png" and is_png)
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid image file"
            )

        filename = f"{uuid.uuid4().hex}{extension}"
        new_file_path = UPLOAD_DIR / filename

        old_image_path = None

        if issue.image_url:
            old_filename = Path(issue.image_url).name
            candidate = (UPLOAD_DIR / old_filename).resolve()

            if candidate.parent == UPLOAD_DIR.resolve():
                old_image_path = candidate

        new_file_path.write_bytes(contents)


        # Generate perceptual image hash
        image_hash = generate_image_hash(str(new_file_path))

        # Update image URL and image hash
        issue.image_url = f"/uploads/{filename}"
        issue.image_hash = image_hash

        # Update PostGIS location if GPS coordinates exist
        if (
            issue.latitude is not None
            and issue.longitude is not None
        ):
            issue.location = WKTElement(
                f"POINT({issue.longitude} {issue.latitude})",
                srid=4326
            )

        try:
            db.commit()
            db.refresh(issue)

        except Exception:
            db.rollback()
            new_file_path.unlink(missing_ok=True)

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Unable to save uploaded image and hash"
            )

        if (
            old_image_path
            and old_image_path != new_file_path
            and old_image_path.is_file()
        ):
            old_image_path.unlink(missing_ok=True)

        #automatically detect possible duplicate complaints

        duplicate_candidates = []

        try:

            duplicate_candidates = find_duplicate_candidates(
                db=db,
                issue=issue,
                radius_metres=50,
                max_hamming_distance=10
            )


        except Exception:
            duplicate_candidates = []

        return CivicIssueUploadResponse(
            **CivicIssueResponse.model_validate(issue).model_dump(),
            duplicate_count=len(duplicate_candidates),
            duplicate_candidates=duplicate_candidates
        )


    except HTTPException:
        raise

    except Exception:
        db.rollback()

        if new_file_path and new_file_path.exists():
            new_file_path.unlink(missing_ok=True)

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to upload image or generate image hash"
        )

    finally:
        await file.close()
