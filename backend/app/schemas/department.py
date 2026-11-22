
from pydantic import (
    BaseModel,
    Field,
    ConfigDict,
    EmailStr,
    field_validator,
    model_validator
)


class DepartmentCreate(BaseModel):

    name: str = Field(
        min_length=2,
        max_length=150
    )

    description: str | None = Field(
        default=None,
        max_length=2000
    )

    contact_email: EmailStr | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value):
        value = value.strip()

        if len(value) < 2:
            raise ValueError(
                "Department name must contain at least 2 characters"
            )

        return value

    @field_validator("description")
    @classmethod
    def validate_description(cls, value):
        if value is None:
            return None

        value = value.strip()
        return value if value else None


class DepartmentUpdate(BaseModel):

    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=150
    )

    description: str | None = Field(
        default=None,
        max_length=2000
    )

    contact_email: EmailStr | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value):
        if value is None:
            return None

        value = value.strip()

        if len(value) < 2:
            raise ValueError(
                "Department name must contain at least 2 characters"
            )

        return value

    @field_validator("description")
    @classmethod
    def validate_description(cls, value):
        if value is None:
            return None

        value = value.strip()
        return value if value else None

    @model_validator(mode="after")
    def validate_update_fields(self):
        if not self.model_fields_set:
            raise ValueError(
                "At least one department field must be provided"
            )

        return self


class DepartmentResponse(BaseModel):

    id: int
    name: str
    description: str | None
    contact_email: str | None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class DepartmentAssignment(BaseModel):

    department_id: int = Field(gt=0)
