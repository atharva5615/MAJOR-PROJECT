
import os
from pathlib import Path
from datetime import datetime, timedelta, timezone

import jwt
from dotenv import load_dotenv
from pwdlib import PasswordHash


# Load environment variables from backend/.env
ENV_PATH = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(ENV_PATH)


# JWT configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

try:
    ACCESS_TOKEN_EXPIRE_MINUTES = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
    )
except ValueError as exc:
    raise ValueError(
        "ACCESS_TOKEN_EXPIRE_MINUTES must be a valid integer"
    ) from exc


if not JWT_SECRET_KEY:
    raise ValueError("JWT_SECRET_KEY is missing from backend/.env")

if JWT_ALGORITHM not in ["HS256", "HS384", "HS512"]:
    raise ValueError("Unsupported JWT algorithm")

if ACCESS_TOKEN_EXPIRE_MINUTES <= 0:
    raise ValueError(
        "ACCESS_TOKEN_EXPIRE_MINUTES must be greater than zero"
    )


# Password hashing
password_hasher = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:
    return password_hasher.verify(
        plain_password,
        hashed_password
    )


# Create JWT access token
def create_access_token(data: dict) -> str:
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM
    )


# Verify JWT access token
def decode_access_token(token: str):
    if not isinstance(token, str) or not token.strip():
        return None

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM],
            options={"require": ["exp"]}
        )

        return payload

    except jwt.InvalidTokenError:
        return None
