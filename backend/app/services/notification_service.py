
from sqlalchemy.orm import Session

from models import Notification


def create_notification(
    db: Session,
    user_id: int,
    issue_id: int | None,
    title: str,
    message: str,
    notification_type: str
):
    """
    Create a notification for a user.

    The caller is responsible for committing or rolling back
    the database transaction.
    """

    if user_id <= 0:
        raise ValueError("Invalid notification user ID")

    if not title or not title.strip():
        raise ValueError("Notification title cannot be empty")

    if not message or not message.strip():
        raise ValueError("Notification message cannot be empty")

    if not notification_type or not notification_type.strip():
        raise ValueError("Notification type cannot be empty")

    notification = Notification(
        user_id=user_id,
        issue_id=issue_id,
        title=title.strip(),
        message=message.strip(),
        notification_type=notification_type.strip()
    )

    db.add(notification)

    return notification
