
import re

from pydantic import (
    BaseModel,
    EmailStr,
    Field,
    ConfigDict,
    field_validator
)


# Registration request
class UserRegister(BaseModel):

    full_name: str = Field(
        min_length=2,
        max_length=150
    )

    email: EmailStr

    phone: str | None = Field(
        default=None,
        max_length=20
    )

    password: str = Field(
        min_length=8,
        max_length=128
    )

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, value):
        value = value.strip()

        if len(value) < 2:
            raise ValueError(
                "Full name must contain at least 2 characters"
            )

        if not any(char.isalpha() for char in value):
            raise ValueError(
                "Full name must contain letters"
            )

        return value

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value):
        if value is None:
            return value

        value = value.strip()

        if not value:
            return None

        if not re.fullmatch(r"\+?[0-9]{7,15}", value):
            raise ValueError(
                "Phone number must contain 7 to 15 digits "
                "and may start with +"
            )

        return value


# Login request
class UserLogin(BaseModel):

    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=128
    )


# User information response
class UserResponse(BaseModel):

    id: int
    full_name: str
    email: EmailStr
    phone: str | None
    role: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


# JWT response
class TokenResponse(BaseModel):

    access_token: str
    token_type: str = "bearer"
