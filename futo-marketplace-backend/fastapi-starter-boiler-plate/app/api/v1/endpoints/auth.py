from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.orm_models import User, UserRole
from app.schemas.schemas import (
    RegisterRequest, LoginRequest, ForgotPasswordRequest,
    ResetPasswordRequest, VerifyEmailRequest, RefreshTokenRequest,
    UserResponse, UpdateProfileRequest
)
from app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token
)
from app.core.dependencies import get_current_user, get_current_verified_user
import random
import hashlib
import time
import string
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()


# ── Helpers ───────────────────────────────────────────────────────────────────

def generate_unique_id():
    chars = string.ascii_uppercase + string.digits
    return ''.join(random.choice(chars) for _ in range(6)) + str(int(time.time()))


def generate_otp():
    return random.randint(100000, 999999)


def success(data=None, message=None, status_code=200):
    return {"success": True, "message": message, "data": data}


# ── Register ──────────────────────────────────────────────────────────────────

@router.post("/register", status_code=201, summary="Register a new user")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    # Check email
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Check username
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    # Check matric number
    if payload.matric_number:
        if db.query(User).filter(User.matric_number == payload.matric_number).first():
            raise HTTPException(status_code=400, detail="Matric number already registered")

    otp = generate_otp()
    account_hash = hashlib.md5(payload.email.encode()).hexdigest()

    user = User(
        email=payload.email,
        name=payload.name,
        username=payload.username,
        hashed_password=hash_password(payload.password),
        role=payload.role,
        matric_number=payload.matric_number,
        email_otp=otp,
        account_hash=account_hash,
        is_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # TODO: Send verification email with OTP (Step — email service)
    # For now, return OTP in response (development only)

    return success(
        data={"user_id": user.id, "otp": otp},  # remove otp in production
        message="Registration successful. Please verify your email.",
        status_code=201
    )


# ── Verify Email ──────────────────────────────────────────────────────────────

@router.post("/verify-email", summary="Verify email with OTP")
def verify_email(payload: VerifyEmailRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Email already verified")
    if user.email_otp != payload.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    user.is_verified = True
    user.email_otp = None
    db.commit()

    return success(message="Email verified successfully")


# ── Resend OTP ────────────────────────────────────────────────────────────────

@router.post("/resend-otp", summary="Resend email verification OTP")
def resend_otp(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Email already verified")

    otp = generate_otp()
    user.email_otp = otp
    db.commit()

    # TODO: send email
    return success(data={"otp": otp}, message="OTP resent")  # remove otp in production


# ── Login ─────────────────────────────────────────────────────────────────────

@router.post("/login", summary="Login and get tokens")
# We changed 'payload: LoginRequest' to the OAuth2 form below
def login(payload: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Swagger's popup sends the email into the 'username' field
    user = db.query(User).filter(User.email == payload.username).first()
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    if user.is_banned:
        raise HTTPException(status_code=403, detail="Account has been banned")
    
    # We use payload.password from the form
    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    # Your token logic remains the same
    access_token = create_access_token({"sub": user.id})
    refresh_token = create_refresh_token({"sub": user.id})

    # Save refresh token to user record
    user.refresh_token = refresh_token
    db.commit()

    return success(
        data={
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "username": user.username,
                "role": user.role,
                "is_verified": user.is_verified,
                "subscription_status": user.subscription_status,
                "profile_photo": user.profile_photo,
            }
        },
        message="Login successful"
    )
    
    
    
    
# ── Refresh Token ─────────────────────────────────────────────────────────────

@router.post("/refresh", summary="Get new access token using refresh token")
def refresh_token(payload: RefreshTokenRequest, db: Session = Depends(get_db)):
    token_data = decode_token(payload.refresh_token)
    if not token_data or token_data.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    user = db.query(User).filter(User.id == token_data.get("sub")).first()
    if not user or user.refresh_token != payload.refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token mismatch")

    new_access_token = create_access_token({"sub": user.id})
    return success(
        data={"access_token": new_access_token, "token_type": "bearer"},
        message="Token refreshed"
    )


# ── Logout ────────────────────────────────────────────────────────────────────

@router.post("/logout", summary="Logout and invalidate refresh token")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.refresh_token = None
    db.commit()
    return success(message="Logged out successfully")


# ── Get Current User ──────────────────────────────────────────────────────────

@router.get("/me", summary="Get current authenticated user")
def get_me(current_user: User = Depends(get_current_user)):
    return success(data={
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "username": current_user.username,
        "role": current_user.role,
        "is_verified": current_user.is_verified,
        "matric_number": current_user.matric_number,
        "profile_photo": current_user.profile_photo,
        "bio": current_user.bio,
        "location": current_user.location,
        "subscription_status": current_user.subscription_status,
        "completed_sales_count": current_user.completed_sales_count,
        "created_at": str(current_user.created_at),
    })


# ── Update Profile ────────────────────────────────────────────────────────────

@router.put("/me", summary="Update profile")
def update_profile(
    payload: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if payload.username and payload.username != current_user.username:
        if db.query(User).filter(User.username == payload.username).first():
            raise HTTPException(status_code=400, detail="Username already taken")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)
    return success(message="Profile updated successfully")


# ── Forgot Password ───────────────────────────────────────────────────────────

@router.post("/forgot-password", summary="Request password reset OTP")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Email not found")

    otp = generate_otp()
    user.email_otp = otp
    db.commit()

    # TODO: send reset email
    return success(data={"otp": otp}, message="Reset OTP sent to email")  # remove otp in production


# ── Reset Password ────────────────────────────────────────────────────────────

@router.post("/reset-password", summary="Reset password using OTP")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.email_otp != payload.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    user.hashed_password = hash_password(payload.new_password)
    user.email_otp = None
    db.commit()

    return success(message="Password reset successful")