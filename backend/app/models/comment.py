
from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database.db_connection import Base


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)

    issue_id = Column(
        Integer, ForeignKey("civic_issues.id"), nullable=False
    )
    user_id = Column(
        Integer, ForeignKey("users.id"), nullable=False
    )

    message = Column(Text, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    issue = relationship("CivicIssue")
    user = relationship("User")
