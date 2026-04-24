from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.models.orm_models import (
    User, Item, Order, Report, Subscription,
    OrderStatus, ItemStatus, SubscriptionStatus
)
from app.schemas.schemas import BanUserRequest, AssignRoleRequest, ResolveDisputeRequest
from app.core.dependencies import require_admin, require_admin_or_moderator

router = APIRouter()

def success(data=None, message=None):
    return {"success": True, "message": message, "data": data}


# ── Stats overview ────────────────────────────────────────────────────────────

@router.get("/stats", summary="Platform overview stats (admin only)")
def get_stats(
    db: Session = Depends(get_db),
    _=Depends(require_admin)
):
    return success(data={
        "total_users": db.query(User).count(),
        "total_sellers": db.query(User).filter(User.role == "seller").count(),
        "total_buyers": db.query(User).filter(User.role == "buyer").count(),
        "total_listings": db.query(Item).filter(Item.deleted_at == None).count(),
        "active_listings": db.query(Item).filter(Item.status == ItemStatus.active, Item.deleted_at == None).count(),
        "total_orders": db.query(Order).count(),
        "completed_orders": db.query(Order).filter(Order.status == OrderStatus.completed).count(),
        "active_subscriptions": db.query(Subscription).filter(Subscription.status == "active").count(),
        "pending_reports": db.query(Report).filter(Report.status == "pending").count(),
        "disputed_orders": db.query(Order).filter(Order.status == OrderStatus.disputed).count(),
    })


# ── Users ─────────────────────────────────────────────────────────────────────

@router.get("/users", summary="List all users (admin only)")
def get_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    role: str = Query(None),
    search: str = Query(None),
    db: Session = Depends(get_db),
    _=Depends(require_admin)
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if search:
        query = query.filter(
            User.name.ilike(f"%{search}%") | User.email.ilike(f"%{search}%")
        )
    total = query.count()
    users = query.offset((page - 1) * per_page).limit(per_page).all()

    return {
        "success": True,
        "data": [
            {
                "id": u.id, "name": u.name, "email": u.email,
                "role": u.role, "is_verified": u.is_verified,
                "is_banned": u.is_banned,
                "subscription_status": u.subscription_status,
                "completed_sales_count": u.completed_sales_count,
                "created_at": str(u.created_at)
            } for u in users
        ],
        "pagination": {"page": page, "per_page": per_page, "total": total, "total_pages": -(-total // per_page)}
    }


@router.put("/users/{user_id}/verify", summary="Verify a user (admin only)")
def verify_user(user_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_verified = True
    db.commit()
    return success(message=f"User {user.name} verified")


@router.put("/users/{user_id}/ban", summary="Ban a user (admin only)")
def ban_user(
    user_id: int,
    payload: BanUserRequest,
    db: Session = Depends(get_db),
    _=Depends(require_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_banned = True
    db.commit()
    return success(message=f"User {user.name} banned. Reason: {payload.reason}")


@router.put("/users/{user_id}/unban", summary="Unban a user (admin only)")
def unban_user(user_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_banned = False
    db.commit()
    return success(message=f"User {user.name} unbanned")


@router.put("/users/{user_id}/role", summary="Assign a role to a user (admin only)")
def assign_role(
    user_id: int,
    payload: AssignRoleRequest,
    db: Session = Depends(get_db),
    _=Depends(require_admin)
):
    valid_roles = ["buyer", "seller", "moderator", "admin"]
    if payload.role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Choose from: {valid_roles}")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = payload.role
    db.commit()
    return success(message=f"Role updated to {payload.role}")


# ── Listings ──────────────────────────────────────────────────────────────────

@router.get("/listings/flagged", summary="Get flagged/reported listings (admin + moderator)")
def get_flagged(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _=Depends(require_admin_or_moderator)
):
    query = db.query(Report).filter(
        Report.item_id != None,
        Report.status == "pending"
    ).order_by(Report.created_at.desc())
    total = query.count()
    reports = query.offset((page - 1) * per_page).limit(per_page).all()

    return {
        "success": True,
        "data": [
            {
                "report_id": r.id,
                "item_id": r.item_id,
                "reporter_id": r.reporter_id,
                "reason": r.reason,
                "status": r.status,
                "created_at": str(r.created_at)
            } for r in reports
        ],
        "pagination": {"page": page, "per_page": per_page, "total": total, "total_pages": -(-total // per_page)}
    }


@router.delete("/listings/{item_id}", summary="Remove a listing (admin only)")
def remove_listing(
    item_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin)
):
    from datetime import datetime
    item = db.query(Item).filter(Item.id == item_id, Item.deleted_at == None).first()
    if not item:
        raise HTTPException(status_code=404, detail="Listing not found")
    item.deleted_at = datetime.utcnow()
    db.commit()
    return success(message="Listing removed")


# ── Disputes ──────────────────────────────────────────────────────────────────

@router.get("/disputes", summary="Get all disputed orders (admin only)")
def get_disputes(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _=Depends(require_admin)
):
    query = db.query(Order).filter(
        Order.status == OrderStatus.disputed
    ).order_by(Order.created_at.desc())
    total = query.count()
    orders = query.offset((page - 1) * per_page).limit(per_page).all()

    return {
        "success": True,
        "data": [
            {
                "id": o.id, "buyer_id": o.buyer_id, "seller_id": o.seller_id,
                "item_id": o.item_id, "status": o.status,
                "created_at": str(o.created_at)
            } for o in orders
        ],
        "pagination": {"page": page, "per_page": per_page, "total": total, "total_pages": -(-total // per_page)}
    }


@router.put("/disputes/{order_id}/resolve", summary="Resolve a dispute (admin only)")
def resolve_dispute(
    order_id: int,
    payload: ResolveDisputeRequest,
    db: Session = Depends(get_db),
    _=Depends(require_admin)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status != OrderStatus.disputed:
        raise HTTPException(status_code=400, detail="Order is not in disputed status")

    # Mark as completed after resolution
    order.status = OrderStatus.completed
    from datetime import datetime
    order.completed_at = datetime.utcnow()

    # Mark any matching reports as reviewed
    db.query(Report).filter(
        Report.item_id == order.item_id,
        Report.status == "pending"
    ).update({"status": "reviewed"})

    db.commit()
    return success(message=f"Dispute resolved. Resolution: {payload.resolution}")