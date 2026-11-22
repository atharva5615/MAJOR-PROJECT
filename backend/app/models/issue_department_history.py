
from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from database.db_connection import Base


class IssueDepartmentHistory(Base):
    __tablename__ = "issue_department_history"

    id = Column(Integer, primary_key=True, index=True)

    issue_id = Column(
        Integer,
        ForeignKey("civic_issues.id"),
        nullable=False,
        index=True
    )

    old_department_id = Column(
        Integer,
        ForeignKey("departments.id"),
        nullable=True
    )

    new_department_id = Column(
        Integer,
        ForeignKey("departments.id"),
        nullable=False
    )

    assigned_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    issue = relationship("CivicIssue")
    old_department = relationship(
        "Department",
        foreign_keys=[old_department_id]
    )
    new_department = relationship(
        "Department",
        foreign_keys=[new_department_id]
    )
    officer = relationship("User", foreign_keys=[assigned_by])
