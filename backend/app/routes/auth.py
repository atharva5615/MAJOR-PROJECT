
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)
from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials
)
from sqlalchemy.orm import Session
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError

from database.db_connection import get_db
from models import User
from schemas.auth import (
    UserRegister,
    UserLogin,
    UserResponse,
    TokenResponse
)
from core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token
)


# Authentication router
router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"]
)


# Return 401 when the bearer token is missing
security = HTTPBearer(auto_error=False)


# Get currently logged-in user
def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token",
        headers={"WWW-Authenticate": "Bearer"}
    )

    if credentials is None:
        raise credentials_exception

    token = credentials.credentials

    payload = decode_access_token(token)

    if not payload:
        raise credentials_exception

    user_id = payload.get("sub")

    if not user_id:
        raise credentials_exception

    try:
        user_id = int(user_id)
    except (ValueError, TypeError):
        raise credentials_exception

    if user_id <= 0:
        raise credentials_exception

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user or not user.is_active:
        raise credentials_exception

    return user


# ==========================================
# 1. USER REGISTRATION
# ==========================================

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def register_user(
    user_data: UserRegister,
    db: Session = Depends(get_db)
):
    email = str(user_data.email).strip().lower()

    phone = (
        user_data.phone.strip()
        if user_data.phone
        else None
    )

    # Check existing email (case-insensitive)
    existing_user = db.query(User).filter(
        func.lower(User.email) == email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered"
        )

    # Check existing phone
    if phone:
        existing_phone = db.query(User).filter(
            User.phone == phone
        ).first()

        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Phone number is already registered"
            )

    new_user = User(
        full_name=user_data.full_name.strip(),
        email=email,
        phone=phone,
        password_hash=hash_password(user_data.password),
        role="citizen"
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email or phone number is already registered"
        )

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to register user"
        )

    return new_user


# ==========================================
# 2. USER LOGIN
# ==========================================

@router.post(
    "/login",
    response_model=TokenResponse
)
def login_user(
    login_data: UserLogin,
    db: Session = Depends(get_db)
):
    email = str(login_data.email).strip().lower()

    user = db.query(User).filter(
        func.lower(User.email) == email
    ).first()

    # Use the same error for unknown email and wrong password
    if not user or not verify_password(
        login_data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is inactive"
        )

    access_token = create_access_token(
        data={"sub": str(user.id)}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# ==========================================
# 3. GET LOGGED-IN USER PROFILE
# ==========================================

@router.get(
    "/me",
    response_model=UserResponse
)
def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    return current_user
