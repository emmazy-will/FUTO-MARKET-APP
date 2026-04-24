from fastapi import APIRouter
router = APIRouter()
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.db.database import get_db
from app.models.orm_models import (
    Order, Item, User, Notification, Report,
    OrderStatus, ItemStatus, SubscriptionStatus, UserRole
)
from app.schemas.schemas import OrderCreateRequest, DisputeRequest
from app.core.dependencies import get_current_user, get_current_verified_user

router = APIRouter()


# ── Helpers ───────────────────────────────────────────────────────────────────

def success(data=None, message=None):
    return {"success": True, "message": message, "data": data}


def format_order(order: Order) -> dict:
    return {
        "id": order.id,
        "item_id": order.item_id,
        "buyer_id": order.buyer_id,
        "seller_id": order.seller_id,
        "status": order.status,
        "note": order.note,
        "created_at": str(order.created_at) if order.created_at else None,
        "completed_at": str(order.completed_at) if order.completed_at else None,
    }


def notify(db: Session, user_id: int, type: str, message: str):
    """Create an in-app notification for a user."""
    notification = Notification(
        user_id=user_id,
        type=type,
        message=message
    )
    db.add(notification)


def check_subscription_gate(seller: User, db: Session):
    # Use explicit DB-level increment to ensure SQLAlchemy tracks the change
    current_count = seller.completed_sales_count or 0
    db.query(User).filter(User.id == seller.id).update(
        {"completed_sales_count": current_count + 1}
    )
    db.flush()  # flush so we can read the updated value in the same transaction
    db.refresh(seller)  # refresh the seller object to get the new count

    if (
        seller.subscription_status == SubscriptionStatus.free
        and seller.completed_sales_count >= 3
    ):
        seller.subscription_status = SubscriptionStatus.free_limit_reached
        notify(
            db,
            seller.id,
            "subscription_required",
            "You have completed 3 sales on your free tier. Subscribe to keep listing items."
        )


# ── POST create order (buyer) ─────────────────────────────────────────────────

@router.post("", status_code=201, summary="Create an order (buyer only)")
def create_order(
    payload: OrderCreateRequest,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    # Only buyers can place orders
    if current_user.role == UserRole.seller:
        raise HTTPException(status_code=403, detail="Sellers cannot place orders. Switch to a buyer account.")

    # Get the item
    item = db.query(Item).filter(
        Item.id == payload.item_id,
        Item.deleted_at == None
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Listing not found")

    # Cannot buy own listing
    if item.seller_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot order your own listing")

    # Item must be active
    if item.status != ItemStatus.active:
        raise HTTPException(status_code=400, detail=f"This listing is no longer available (status: {item.status})")

    # Check if buyer already has a pending/accepted order for this item
    existing = db.query(Order).filter(
        Order.buyer_id == current_user.id,
        Order.item_id == payload.item_id,
        Order.status.in_([OrderStatus.pending, OrderStatus.accepted])
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You already have an active order for this listing")

    order = Order(
        buyer_id=current_user.id,
        seller_id=item.seller_id,
        item_id=payload.item_id,
        note=payload.note,
        status=OrderStatus.pending
    )
    db.add(order)

    # Notify seller
    notify(
        db,
        item.seller_id,
        "new_order",
        f"You have a new order for '{item.title}'. Please accept or decline."
    )

    db.commit()
    db.refresh(order)

    return success(data=format_order(order), message="Order placed successfully")


# ── GET my orders ─────────────────────────────────────────────────────────────

@router.get("", summary="Get my orders (buyer sees orders placed, seller sees orders received)")
def get_my_orders(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: Optional[OrderStatus] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Buyers see orders they placed, sellers see orders they received
    query = db.query(Order).filter(
        or_(
            Order.buyer_id == current_user.id,
            Order.seller_id == current_user.id
        )
    )

    if status:
        query = query.filter(Order.status == status)

    query = query.order_by(Order.created_at.desc())

    total = query.count()
    orders = query.offset((page - 1) * per_page).limit(per_page).all()

    return {
        "success": True,
        "message": None,
        "data": [format_order(o) for o in orders],
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "total_pages": -(-total // per_page)
        }
    }


# ── GET single order ──────────────────────────────────────────────────────────

@router.get("/{order_id}", summary="Get a single order by ID")
def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Only buyer, seller, or admin can view
    if current_user.id not in [order.buyer_id, order.seller_id] and current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="You do not have access to this order")

    # Attach item and user info
    item = db.query(Item).filter(Item.id == order.item_id).first()
    buyer = db.query(User).filter(User.id == order.buyer_id).first()
    seller = db.query(User).filter(User.id == order.seller_id).first()

    data = format_order(order)
    data["item"] = {"id": item.id, "title": item.title, "price": item.price} if item else None
    data["buyer"] = {"id": buyer.id, "name": buyer.name, "username": buyer.username} if buyer else None
    data["seller"] = {"id": seller.id, "name": seller.name, "username": seller.username} if seller else None

    return success(data=data)


# ── PUT accept order (seller) ─────────────────────────────────────────────────

@router.put("/{order_id}/accept", summary="Accept an order (seller only)")
def accept_order(
    order_id: int,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the seller can accept this order")
    if order.status != OrderStatus.pending:
        raise HTTPException(status_code=400, detail=f"Order cannot be accepted — current status: {order.status}")

    order.status = OrderStatus.accepted

    # Notify buyer
    notify(
        db,
        order.buyer_id,
        "order_accepted",
        "Your order has been accepted by the seller. Arrange pickup or delivery."
    )

    db.commit()
    return success(data=format_order(order), message="Order accepted")


# ── PUT complete order (buyer confirms receipt) ───────────────────────────────

@router.put("/{order_id}/complete", summary="Confirm receipt and complete order (buyer only)")
def complete_order(
    order_id: int,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.buyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the buyer can confirm receipt")
    if order.status != OrderStatus.accepted:
        raise HTTPException(status_code=400, detail=f"Order cannot be completed — current status: {order.status}")

    order.status = OrderStatus.completed
    order.completed_at = datetime.utcnow()

    # Mark item as sold
    item = db.query(Item).filter(Item.id == order.item_id).first()
    if item:
        item.status = ItemStatus.sold

    # Increment seller sales count + check subscription gate
    seller = db.query(User).filter(User.id == order.seller_id).first()
    if seller:
        check_subscription_gate(seller, db)

    # Notify seller
    notify(
        db,
        order.seller_id,
        "order_completed",
        f"Order completed! The buyer has confirmed receipt. You can now receive a rating."
    )

    # Notify buyer — unlock rating
    notify(
        db,
        order.buyer_id,
        "rate_seller",
        "Your order is complete. Would you like to rate the seller?"
    )

    db.flush()
    db.commit()
    db.refresh(order)
    return success(data=format_order(order), message="Order completed. You can now rate the seller.")

# ── PUT cancel order ──────────────────────────────────────────────────────────

@router.put("/{order_id}/cancel", summary="Cancel an order (buyer or seller)")
def cancel_order(
    order_id: int,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Only buyer or seller can cancel
    if current_user.id not in [order.buyer_id, order.seller_id]:
        raise HTTPException(status_code=403, detail="You are not part of this order")

    # Can only cancel if pending or accepted
    if order.status not in [OrderStatus.pending, OrderStatus.accepted]:
        raise HTTPException(status_code=400, detail=f"Order cannot be cancelled — current status: {order.status}")

    order.status = OrderStatus.cancelled

    # Notify the other party
    other_user_id = order.seller_id if current_user.id == order.buyer_id else order.buyer_id
    canceller = "buyer" if current_user.id == order.buyer_id else "seller"

    notify(
        db,
        other_user_id,
        "order_cancelled",
        f"The {canceller} has cancelled the order."
    )

    db.commit()
    return success(data=format_order(order), message="Order cancelled")


# ── POST raise dispute ────────────────────────────────────────────────────────

@router.post("/{order_id}/dispute", summary="Raise a dispute on an order")
def raise_dispute(
    order_id: int,
    payload: DisputeRequest,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Only buyer or seller of this order
    if current_user.id not in [order.buyer_id, order.seller_id]:
        raise HTTPException(status_code=403, detail="You are not part of this order")

    # Can only dispute accepted orders
    if order.status != OrderStatus.accepted:
        raise HTTPException(status_code=400, detail="You can only dispute an accepted order")

    order.status = OrderStatus.disputed

    # Create a report for admin review
    report = Report(
        reporter_id=current_user.id,
        item_id=order.item_id,
        reason=f"ORDER DISPUTE (Order #{order.id}): {payload.reason}"
    )
    db.add(report)

    # Notify admin (user_id=1 assumed as admin — update if needed)
    notify(
        db,
        order.buyer_id if current_user.id == order.seller_id else order.seller_id,
        "order_disputed",
        "A dispute has been raised on your order. Our team will review and contact both parties."
    )

    db.commit()
    return success(data=format_order(order), message="Dispute raised. Our team will review and contact both parties.")