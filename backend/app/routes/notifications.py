
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.db_connection import get_db
from models import Notification, User
from schemas.notification import NotificationResponse
from routes.auth import get_current_user


router = APIRouter(
    prefix="/api/v1/notifications",
    tags=["Notifications"]
)


# GET ALL MY NOTIFICATIONS

@router.get("/", response_model=list[NotificationResponse])
def get_my_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(
        Notification.created_at.desc()
    ).all()


# GET UNREAD NOTIFICATION COUNT

@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read.is_(False)
    ).count()

    return {"unread_count": count}


# MARK ONE NOTIFICATION AS READ

@router.put("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    notification.is_read = True
    db.commit()
    db.refresh(notification)

    return notification


# MARK ALL NOTIFICATIONS AS READ

@router.put("/read-all")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read.is_(False)
    ).update(
        {Notification.is_read: True},
        synchronize_session=False
    )

    db.commit()

    return {
        "message": "All notifications marked as read"
    }
