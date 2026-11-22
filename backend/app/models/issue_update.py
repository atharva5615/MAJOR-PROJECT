
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database.db_connection import Base


class IssueUpdate(Base):
    __tablename__ = "issue_updates"

    id = Column(Integer, primary_key=True, index=True)

    issue_id = Column(
        Integer, ForeignKey("civic_issues.id"), nullable=False
    )
    updated_by = Column(
        Integer, ForeignKey("users.id"), nullable=False
    )

    old_status = Column(String(30), nullable=True)
    new_status = Column(String(30), nullable=False)
    remarks = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    issue = relationship("CivicIssue")
    user = relationship("User")
