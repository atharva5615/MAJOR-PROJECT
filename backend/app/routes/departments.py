
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database.db_connection import get_db
from models import User, Department, CivicIssue

from schemas.department import (
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentResponse
)
from schemas.issue import CivicIssueResponse

from routes.auth import get_current_user


router = APIRouter(
    prefix="/api/v1/departments",
    tags=["Department Management"]
)


# --------------------------------------------------
# ADMIN AUTHORIZATION
# --------------------------------------------------

def require_admin(
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can manage departments"
        )

    return current_user


# --------------------------------------------------
# 1. CREATE DEPARTMENT
# --------------------------------------------------

@router.post(
    "/",
    response_model=DepartmentResponse,
    status_code=status.HTTP_201_CREATED
)
def create_department(
    department_data: DepartmentCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    new_department = Department(
        name=department_data.name.strip(),
        description=department_data.description,
        contact_email=(
            str(department_data.contact_email)
            if department_data.contact_email
            else None
        )
    )

    try:
        db.add(new_department)
        db.commit()
        db.refresh(new_department)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A department with this name already exists"
        )

    return new_department


# --------------------------------------------------
# 2. GET ALL DEPARTMENTS
# --------------------------------------------------

@router.get(
    "/",
    response_model=list[DepartmentResponse]
)
def get_departments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Department).order_by(
        Department.id.asc()
    ).all()


# --------------------------------------------------
# 3. GET DEPARTMENT BY ID
# --------------------------------------------------

@router.get(
    "/{department_id}",
    response_model=DepartmentResponse
)
def get_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    department = db.query(Department).filter(
        Department.id == department_id
    ).first()

    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found"
        )

    return department


# --------------------------------------------------
# 4. GET ISSUES ASSIGNED TO A DEPARTMENT
# --------------------------------------------------

@router.get(
    "/{department_id}/issues",
    response_model=list[CivicIssueResponse]
)
def get_department_issues(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    department = db.query(Department).filter(
        Department.id == department_id
    ).first()

    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found"
        )

    issues = db.query(CivicIssue).filter(
        CivicIssue.department_id == department_id
    ).order_by(
        CivicIssue.created_at.desc()
    ).all()

    return issues


# --------------------------------------------------
# 5. UPDATE DEPARTMENT
# --------------------------------------------------

@router.put(
    "/{department_id}",
    response_model=DepartmentResponse
)
def update_department(
    department_id: int,
    department_data: DepartmentUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    department = db.query(Department).filter(
        Department.id == department_id
    ).first()

    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found"
        )

    update_data = department_data.model_dump(
        exclude_unset=True
    )

    if (
        "name" in update_data
        and update_data["name"] is not None
    ):
        update_data["name"] = update_data["name"].strip()

    if "contact_email" in update_data:
        email = update_data["contact_email"]
        update_data["contact_email"] = (
            str(email) if email else None
        )

    for field, value in update_data.items():
        setattr(department, field, value)

    try:
        db.commit()
        db.refresh(department)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A department with this name already exists"
        )

    return department


# --------------------------------------------------
# 6. DEACTIVATE DEPARTMENT
# --------------------------------------------------

@router.delete(
    "/{department_id}",
    response_model=DepartmentResponse
)
def deactivate_department(
    department_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    department = db.query(Department).filter(
        Department.id == department_id
    ).first()

    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found"
        )

    if not department.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Department is already inactive"
        )

    department.is_active = False

    db.commit()
    db.refresh(department)

    return department
