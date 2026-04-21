from sqlalchemy import (
    Boolean, Column, ForeignKey, Integer,
    String, Text, DateTime, Enum, Float
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
import enum


# ── Enums ────────────────────────────────────────────────────────────────────

class UserRole(str, enum.Enum):
    buyer = "buyer"
    seller = "seller"
    moderator = "moderator"
    admin = "admin"


class SubscriptionStatus(str, enum.Enum):
    free = "free"
    active = "active"
    expired = "expired"
    free_limit_reached = "free_limit_reached"


class ItemCondition(str, enum.Enum):
    new = "new"
    used = "used"
    fairly_used = "fairly_used"


class ItemStatus(str, enum.Enum):
    active = "active"
    sold = "sold"
    deactivated = "deactivated"


class ItemCategory(str, enum.Enum):
    books = "books"
    electronics = "electronics"
    clothing = "clothing"
    food = "food"
    furniture = "furniture"
    services = "services"
    tickets = "tickets"
    other = "other"


class OrderStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    completed = "completed"
    cancelled = "cancelled"
    disputed = "disputed"


# ── Users ────────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    username = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255), nullable=True)  # nullable for Google auth
    role = Column(Enum(UserRole), default=UserRole.buyer, nullable=False)
    is_verified = Column(Boolean, default=False)
    is_banned = Column(Boolean, default=False)
    account_hash = Column(String(255))
    email_otp = Column(Integer, nullable=True)
    matric_number = Column(String(50), unique=True, nullable=True, index=True)
    profile_photo = Column(Text, nullable=True)
    bio = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)
    subscription_status = Column(
        Enum(SubscriptionStatus),
        default=SubscriptionStatus.free,
        nullable=False
    )
    completed_sales_count = Column(Integer, default=0)
    google_auth = Column(Boolean, default=False)
    refresh_token = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    items = relationship("Item", back_populates="seller", foreign_keys="Item.seller_id")
    orders_as_buyer = relationship("Order", back_populates="buyer", foreign_keys="Order.buyer_id")
    orders_as_seller = relationship("Order", back_populates="seller", foreign_keys="Order.seller_id")
    favorites = relationship("Favorite", back_populates="user")
    ratings_given = relationship("Rating", back_populates="rater", foreign_keys="Rating.rater_id")
    ratings_received = relationship("Rating", back_populates="ratee", foreign_keys="Rating.ratee_id")
    notifications = relationship("Notification", back_populates="user")
    subscriptions = relationship("Subscription", back_populates="seller")


# ── Items ─────────────────────────────────────────────────────────────────────

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    category = Column(Enum(ItemCategory), nullable=False)
    condition = Column(Enum(ItemCondition), nullable=False)
    status = Column(Enum(ItemStatus), default=ItemStatus.active)
    images = Column(Text, nullable=True)          # JSON string of image URLs
    location = Column(String(255), nullable=True)
    is_boosted = Column(Boolean, default=False)
    view_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    seller = relationship("User", back_populates="items", foreign_keys=[seller_id])
    orders = relationship("Order", back_populates="item")
    favorites = relationship("Favorite", back_populates="item")
    reports = relationship("Report", back_populates="item")


# ── Orders ────────────────────────────────────────────────────────────────────

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    status = Column(Enum(OrderStatus), default=OrderStatus.pending)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    buyer = relationship("User", back_populates="orders_as_buyer", foreign_keys=[buyer_id])
    seller = relationship("User", back_populates="orders_as_seller", foreign_keys=[seller_id])
    item = relationship("Item", back_populates="orders")
    rating = relationship("Rating", back_populates="order", uselist=False)


# ── Favorites ─────────────────────────────────────────────────────────────────

class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="favorites")
    item = relationship("Item", back_populates="favorites")


# ── Conversations ─────────────────────────────────────────────────────────────

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    messages = relationship("Message", back_populates="conversation")


# ── Messages ──────────────────────────────────────────────────────────────────

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    message_type = Column(String(50), default="text")   # text | image
    is_read = Column(Boolean, default=False)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")


# ── Ratings ───────────────────────────────────────────────────────────────────

class Rating(Base):
    __tablename__ = "ratings"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, unique=True)
    rater_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    ratee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    score = Column(Integer, nullable=False)             # 1–5
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    order = relationship("Order", back_populates="rating")
    rater = relationship("User", back_populates="ratings_given", foreign_keys=[rater_id])
    ratee = relationship("User", back_populates="ratings_received", foreign_keys=[ratee_id])


# ── Subscriptions ─────────────────────────────────────────────────────────────

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plan = Column(String(50), nullable=False)           # basic | premium
    status = Column(String(50), default="active")
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)
    paystack_ref = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    seller = relationship("User", back_populates="subscriptions")


# ── Notifications ─────────────────────────────────────────────────────────────

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="notifications")


# ── Reports ───────────────────────────────────────────────────────────────────

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=True)
    reported_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    reason = Column(Text, nullable=False)
    status = Column(String(50), default="pending")      # pending | reviewed | dismissed
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    item = relationship("Item", back_populates="reports")