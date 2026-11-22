
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
    Float,
    Index
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from geoalchemy2 import Geography

from database.db_connection import Base


class CivicIssue(Base):
    __tablename__ = "civic_issues"

    __table_args__ = (
        Index(
            "idx_civic_issues_location",
            "location",
            postgresql_using="gist"
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    # Complaint identification
    complaint_code = Column(String(50), nullable=True)

    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)

    category = Column(String(100), nullable=False)
    priority = Column(String(30), default="medium", nullable=False)
    status = Column(String(30), default="reported", nullable=False)

    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    address = Column(String(500), nullable=True)
    image_url = Column(String(500), nullable=True)

    # Member 4: duplicate detection fields
    image_hash = Column(String(16), nullable=True)

    # Member 4: GIS geographic location
    location = Column(
        Geography(
            geometry_type="POINT",
            srid=4326,
            spatial_index=False
        ),
        nullable=True
    )

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    department_id = Column(
        Integer,
        ForeignKey("departments.id"),
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    user = relationship("User")
    department = relationship("Department")
