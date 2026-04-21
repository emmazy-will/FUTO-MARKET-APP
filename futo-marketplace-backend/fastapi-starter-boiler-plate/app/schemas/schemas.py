from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.models.orm_models import UserRole, SubscriptionStatus


# ── Shared response wrapper ───────────────────────────────────────────────────

class Response(BaseModel):
    success: bool
    message: Optional[str] = None
    data: Optional[dict] = None


# ── Auth schemas ──────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr = Field(example="chukwuemeka@futo.edu.ng")
    name: str = Field(example="Chukwuemeka Obi")
    username: str = Field(example="chukzy")
    password: str = Field(min_length=6, example="strongPass123")
    role: UserRole = Field(default=UserRole.buyer, example="buyer")
    matric_number: Optional[str] = Field(None, example="2021/123456")


class LoginRequest(BaseModel):
    email: EmailStr = Field(example="chukwuemeka@futo.edu.ng")
    password: str = Field(example="strongPass123")


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: int
    new_password: str = Field(min_length=6)


class VerifyEmailRequest(BaseModel):
    email: EmailStr
    otp: int


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6)


# ── User schemas ──────────────────────────────────────────────────────────────

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    username: Optional[str]
    role: UserRole
    is_verified: bool
    matric_number: Optional[str]
    profile_photo: Optional[str]
    bio: Optional[str]
    location: Optional[str]
    subscription_status: SubscriptionStatus
    completed_sales_count: int
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    username: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    matric_number: Optional[str] = None


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse