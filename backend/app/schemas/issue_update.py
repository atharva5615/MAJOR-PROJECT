
from datetime import datetime

from pydantic import (
    BaseModel,
    Field,
    ConfigDict,
    field_validator
)


# Request schema for updating complaint status
class IssueStatusUpdate(BaseModel):

    status: str = Field(
        min_length=3,
        max_length=30
    )

    remarks: str | None = Field(
        default=None,
        max_length=1000
    )

    @field_validator("status")
    @classmethod
    def validate_status(cls, value):
        value = value.strip().lower()

        if len(value) < 3:
            raise ValueError(
                "Status must contain at least 3 characters"
            )

        return value

    @field_validator("remarks")
    @classmethod
    def validate_remarks(cls, value):
        if value is None:
            return None

        value = value.strip()

        return value if value else None


# Response schema for issue status history
class IssueUpdateResponse(BaseModel):

    id: int
    issue_id: int
    updated_by: int
    old_status: str | None
    new_status: str
    remarks: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
