
from datetime import datetime

from pydantic import (
    BaseModel,
    Field,
    ConfigDict,
    field_validator
)


class CivicIssueCreate(BaseModel):

    title: str = Field(
        min_length=5,
        max_length=200
    )

    description: str = Field(
        min_length=10,
        max_length=10000
    )

    category: str = Field(
        min_length=2,
        max_length=100
    )

    latitude: float | None = Field(
        default=None,
        ge=-90,
        le=90
    )

    longitude: float | None = Field(
        default=None,
        ge=-180,
        le=180
    )

    address: str | None = Field(
        default=None,
        max_length=500
    )

    @field_validator("title", "description", "category")
    @classmethod
    def validate_required_text(cls, value):
        value = value.strip()

        if not value:
            raise ValueError(
                "This field cannot be empty"
            )

        return value

    @field_validator("address")
    @classmethod
    def validate_address(cls, value):
        if value is None:
            return None

        value = value.strip()

        return value if value else None

class IssuePriorityUpdate(BaseModel):

    priority: str = Field(
        min_length=3,
        max_length=30
    )

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, value):
        value = value.strip().lower()

        allowed_priorities = {
            "critical",
            "high",
            "medium",
            "low"
        }

        if value not in allowed_priorities:
            raise ValueError(
                "Priority must be critical, high, medium or low"
            )

        return value


class CivicIssueResponse(BaseModel):

    id: int
    title: str
    description: str
    category: str
    priority: str
    status: str

    latitude: float | None
    longitude: float | None
    address: str | None
    image_url: str | None

    user_id: int
    department_id: int | None

    created_at: datetime
    updated_at: datetime | None

    model_config = ConfigDict(from_attributes=True)

class AdminDuplicateReviewSummary(BaseModel):
    related_issue_id: int
    decision: str
    reviewed_at: datetime


class AdminCivicIssueResponse(CivicIssueResponse):
    duplicate_reviews: list[AdminDuplicateReviewSummary] = Field(
        default_factory=list
    )

class DuplicateCandidateResponse(BaseModel):
    issue_id: int
    gps_distance_metres: float
    hamming_distance: int
    image_similarity_percentage: float


class CivicIssueUploadResponse(CivicIssueResponse):
    duplicate_count: int = 0
    duplicate_candidates: list[DuplicateCandidateResponse] = Field(
        default_factory=list
    )

class AuthorityNoteCreate(BaseModel):

    message: str = Field(
        min_length=1,
        max_length=2000
    )

    @field_validator("message")
    @classmethod
    def validate_message(cls, value):
        value = value.strip()

        if not value:
            raise ValueError(
                "Authority note cannot be empty"
            )

        return value


class AuthorityNoteResponse(BaseModel):

    id: int
    issue_id: int
    officer_id: int
    message: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


from typing import Literal


class DuplicateReviewCreate(BaseModel):
    decision: Literal["confirmed", "rejected"]
    authority_note: str | None = Field(
        default=None,
        max_length=2000
    )

    @field_validator("authority_note")
    @classmethod
    def validate_authority_note(cls, value):
        if value is None:
            return None

        value = value.strip()
        return value if value else None


class DuplicateReviewResponse(BaseModel):
    id: int
    original_issue_id: int
    duplicate_issue_id: int
    reviewed_by: int
    decision: str
    authority_note: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
