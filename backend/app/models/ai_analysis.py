from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
    JSON,
)
from sqlalchemy.sql import func

from database.db_connection import Base


class AIAnalysis(Base):
    __tablename__ = "issue_ai_analyses"

    id = Column(Integer, primary_key=True, index=True)

    civic_issue_id = Column(
        Integer,
        ForeignKey("civic_issues.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    available = Column(Boolean, nullable=False, default=False)
    model_status = Column(String(50), nullable=True)

    detected_category = Column(String(100), nullable=True)
    confidence = Column(Float, nullable=True)

    severity = Column(String(30), nullable=True)

    # YOLO11 object detection results
    detections = Column(JSON, nullable=True)

    # ResNet18 image classification result
    classification = Column(JSON, nullable=True)

    # Detailed preliminary severity information
    severity_details = Column(JSON, nullable=True)

    device = Column(String(50), nullable=True)
    message = Column(Text, nullable=True)

    analyzed_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )