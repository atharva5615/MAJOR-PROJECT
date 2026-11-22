
from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, Index
from sqlalchemy.sql import func

from database.db_connection import Base


class AuthorityNote(Base):
    __tablename__ = "authority_notes"

    __table_args__ = (
        Index("ix_authority_notes_issue_id", "issue_id"),
    )

    id = Column(Integer, primary_key=True, index=True)

    issue_id = Column(
        Integer,
        ForeignKey("civic_issues.id"),
        nullable=False
    )

    officer_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    message = Column(Text, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
