
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, text

from database.db_connection import get_db
from models import CivicIssue, Department, User
from routes.auth import get_current_user
from schemas.dashboard import (
    DashboardOverview,
    DashboardGeospatialResponse,
)


router = APIRouter(
    prefix="/api/v1/dashboard",
    tags=["Dashboard"]
)


# --------------------------------------------------
# DASHBOARD ACCESS AUTHORIZATION
# --------------------------------------------------

def require_dashboard_access(current_user: User):
    if current_user.role not in ["admin", "officer"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins and officers can access dashboard analytics"
        )


# --------------------------------------------------
# DASHBOARD OVERVIEW
# --------------------------------------------------

@router.get(
    "/overview",
    response_model=DashboardOverview
)
def get_dashboard_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_dashboard_access(current_user)

    # --------------------------------------------------
    # TOTAL COMPLAINTS
    # --------------------------------------------------

    total_issues = db.query(
        func.count(CivicIssue.id)
    ).scalar() or 0

    # --------------------------------------------------
    # STATUS-WISE COMPLAINTS
    # --------------------------------------------------

    status_results = db.query(
        CivicIssue.status,
        func.count(CivicIssue.id).label("count")
    ).group_by(
        CivicIssue.status
    ).order_by(
        CivicIssue.status
    ).all()

    status_breakdown = [
        {
            "status": result.status,
            "count": result.count
        }
        for result in status_results
    ]

    # --------------------------------------------------
    # CATEGORY-WISE COMPLAINTS
    # --------------------------------------------------

    category_results = db.query(
        CivicIssue.category,
        func.count(CivicIssue.id).label("count")
    ).group_by(
        CivicIssue.category
    ).order_by(
        func.count(CivicIssue.id).desc()
    ).all()

    category_breakdown = [
        {
            "category": result.category,
            "count": result.count
        }
        for result in category_results
    ]

    # --------------------------------------------------
    # DEPARTMENT-WISE COMPLAINTS
    # --------------------------------------------------

    department_results = db.query(
        func.coalesce(
            Department.name,
            "Unassigned"
        ).label("department"),
        func.count(CivicIssue.id).label("count")
    ).outerjoin(
        Department,
        CivicIssue.department_id == Department.id
    ).group_by(
        Department.name
    ).order_by(
        func.count(CivicIssue.id).desc()
    ).all()

    department_breakdown = [
        {
            "department": result.department,
            "count": result.count
        }
        for result in department_results
    ]

    # --------------------------------------------------
    # MONTHLY COMPLAINT TREND
    # LAST 12 MONTHS, INCLUDING ZERO-COUNT MONTHS
    # --------------------------------------------------

    monthly_results = db.query(
        func.to_char(
            func.date_trunc("month", CivicIssue.created_at),
            "YYYY-MM"
        ).label("month"),
        func.count(CivicIssue.id).label("count")
    ).filter(
        CivicIssue.created_at >= (
            func.date_trunc("month", func.now())
            - text("INTERVAL '11 months'")
        )
    ).group_by(
        func.date_trunc("month", CivicIssue.created_at)
    ).order_by(
        func.date_trunc("month", CivicIssue.created_at)
    ).all()

    monthly_counts = {
        result.month: result.count
        for result in monthly_results
    }

    current_month = datetime.now().replace(
        day=1,
        hour=0,
        minute=0,
        second=0,
        microsecond=0
    )

    monthly_trend = []

    for month_offset in range(11, -1, -1):
        year = current_month.year
        month = current_month.month - month_offset

        while month <= 0:
            month += 12
            year -= 1

        month_key = f"{year}-{month:02d}"

        monthly_trend.append({
            "month": month_key,
            "count": monthly_counts.get(month_key, 0)
        })

    # --------------------------------------------------
    # FINAL DASHBOARD RESPONSE
    # --------------------------------------------------

    return {
        "total_issues": total_issues,
        "status_breakdown": status_breakdown,
        "category_breakdown": category_breakdown,
        "department_breakdown": department_breakdown,
        "monthly_trend": monthly_trend
    }

# --------------------------------------------------
# GEOSPATIAL COMPLAINT DATA
# --------------------------------------------------

@router.get(
    "/geospatial",
    response_model=DashboardGeospatialResponse
)
def get_dashboard_geospatial(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_dashboard_access(current_user)

    total_issues = db.query(
        func.count(CivicIssue.id)
    ).scalar() or 0

    mapped_issues = db.query(
        CivicIssue.id,
        CivicIssue.title,
        CivicIssue.category,
        CivicIssue.priority,
        CivicIssue.status,
        CivicIssue.latitude,
        CivicIssue.longitude,
        CivicIssue.address,
        CivicIssue.image_url,
    ).filter(
        CivicIssue.latitude.isnot(None),
        CivicIssue.longitude.isnot(None),
        CivicIssue.latitude.between(-90, 90),
        CivicIssue.longitude.between(-180, 180),
    ).order_by(
        CivicIssue.created_at.desc()
    ).all()

    points = [
        {
            "id": issue.id,
            "title": issue.title,
            "category": issue.category,
            "priority": issue.priority,
            "status": issue.status,
            "latitude": issue.latitude,
            "longitude": issue.longitude,
            "address": issue.address,
            "image_url": issue.image_url,
        }
        for issue in mapped_issues
    ]

    mapped_count = len(points)

    return {
        "total_issues": total_issues,
        "mapped_issues": mapped_count,
        "unmapped_issues": total_issues - mapped_count,
        "points": points,
    }
