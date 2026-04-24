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
    

# ── Items schemas ─────────────────────────────────────────────────────────────

from app.models.orm_models import ItemCategory, ItemCondition, ItemStatus

class CreateItemRequest(BaseModel):
    title: str = Field(min_length=3, max_length=255, example="Dell Latitude Laptop")
    description: Optional[str] = Field(None, example="Good condition, 8GB RAM")
    price: float = Field(gt=0, example=45000.00)
    category: ItemCategory = Field(example="electronics")
    condition: ItemCondition = Field(example="fairly_used")
    location: Optional[str] = Field(None, example="Hostel A, Block 3")


class UpdateItemRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    category: Optional[ItemCategory] = None
    condition: Optional[ItemCondition] = None
    location: Optional[str] = None
    status: Optional[ItemStatus] = None


class ItemSellerResponse(BaseModel):
    id: int
    name: str
    username: Optional[str]
    profile_photo: Optional[str]
    rating_avg: Optional[float] = None

    class Config:
        from_attributes = True


class ItemResponse(BaseModel):
    id: int
    seller_id: int
    title: str
    description: Optional[str]
    price: float
    category: str
    condition: str
    status: str
    images: Optional[str]       # JSON string of URLs
    location: Optional[str]
    is_boosted: bool
    view_count: int
    created_at: Optional[datetime]
    seller: Optional[ItemSellerResponse] = None

    class Config:
        from_attributes = True
        
    
    # ── Order schemas ─────────────────────────────────────────────────────────────
from app.models.orm_models import OrderStatus

class OrderCreateRequest(BaseModel):
    item_id: int = Field(example=1)
    note: Optional[str] = Field(None, example="Please hold for me, I'll pick up tomorrow")


class DisputeRequest(BaseModel):
    reason: str = Field(min_length=10, example="Seller is not responding after accepting the order")


class OrderResponse(BaseModel):
    id: int
    buyer_id: int
    seller_id: int
    item_id: int
    status: OrderStatus
    note: Optional[str]
    created_at: Optional[datetime]
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True
        
        
        
        
# ── Favorites schemas ─────────────────────────────────────────────────────────

class FavoriteResponse(BaseModel):
    id: int
    user_id: int
    item_id: int
    created_at: Optional[datetime]

    class Config:
        from_attributes = True
        
    
    
# ── Chat schemas ──────────────────────────────────────────────────────────────

class ConversationCreateRequest(BaseModel):
    item_id: int = Field(example=1)
    seller_id: int = Field(example=2)


class MessageCreateRequest(BaseModel):
    conversation_id: int = Field(example=1)
    content: str = Field(min_length=1, example="Is this still available?")
    message_type: Optional[str] = Field(default="text", example="text")
    
    

# ── Ratings ───────────────────────────────────────────────────────────────────

class RatingCreateRequest(BaseModel):
    order_id: int = Field(example=1)
    score: int = Field(ge=1, le=5, example=5)
    comment: Optional[str] = Field(None, example="Great seller, fast response!")


# ── Subscriptions ─────────────────────────────────────────────────────────────

class SubscribeRequest(BaseModel):
    plan: str = Field(example="basic")  # basic | premium


# ── Admin ─────────────────────────────────────────────────────────────────────

class BanUserRequest(BaseModel):
    reason: str = Field(min_length=5, example="Repeated fraudulent listings")


class AssignRoleRequest(BaseModel):
    role: str = Field(example="moderator")  # buyer | seller | moderator | admin


class ResolveDisputeRequest(BaseModel):
    resolution: str = Field(min_length=10, example="Refund issued to buyer. Seller warned.")