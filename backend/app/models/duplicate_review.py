
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Index
from sqlalchemy.sql import func

from database.db_connection import Base


class DuplicateReview(Base):
    __tablename__ = "duplicate_reviews"

    id = Column(Integer, primary_key=True, index=True)

    original_issue_id = Column(
        Integer,
        ForeignKey("civic_issues.id", ondelete="CASCADE"),
        nullable=False
    )

    duplicate_issue_id = Column(
        Integer,
        ForeignKey("civic_issues.id", ondelete="CASCADE"),
        nullable=False
    )

    reviewed_by = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    decision = Column(String(20), nullable=False)
    authority_note = Column(Text, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    __table_args__ = (
        Index("ix_duplicate_reviews_original_issue_id", "original_issue_id"),
        Index("ix_duplicate_reviews_duplicate_issue_id", "duplicate_issue_id"),
    )
