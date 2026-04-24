import hmac
import hashlib
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.orm_models import Subscription, User, Notification, SubscriptionStatus
from app.schemas.schemas import SubscribeRequest
from app.core.dependencies import get_current_verified_user
from app.core.config import settings

router = APIRouter()

def success(data=None, message=None):
    return {"success": True, "message": message, "data": data}

def notify(db, user_id, type, message):
    db.add(Notification(user_id=user_id, type=type, message=message))


@router.get("/status", summary="Get my subscription status")
def get_status(
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    sub = db.query(Subscription).filter(
        Subscription.seller_id == current_user.id,
        Subscription.status == "active"
    ).order_by(Subscription.created_at.desc()).first()

    return success(data={
        "subscription_status": current_user.subscription_status,
        "completed_sales_count": current_user.completed_sales_count,
        "free_sales_remaining": max(0, 3 - current_user.completed_sales_count)
            if current_user.subscription_status == SubscriptionStatus.free else 0,
        "active_subscription": {
            "plan": sub.plan,
            "expires_at": str(sub.expires_at),
            "paystack_ref": sub.paystack_ref
        } if sub else None
    })


@router.post("/subscribe", summary="Initiate subscription (returns Paystack payment link)")
def subscribe(
    payload: SubscribeRequest,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ["seller", "admin"]:
        raise HTTPException(status_code=403, detail="Only sellers can subscribe")

    plans = {
        "basic": {"amount": 200000, "label": "Basic Monthly"},      # ₦2,000 in kobo
        "premium": {"amount": 500000, "label": "Premium Monthly"},  # ₦5,000 in kobo
    }
    if payload.plan not in plans:
        raise HTTPException(status_code=400, detail="Invalid plan. Choose 'basic' or 'premium'")

    plan_info = plans[payload.plan]

    # In a real integration you'd call Paystack API here to create a payment link
    # For now return the details Emmazy needs to initialise Paystack inline on frontend
    return success(
        data={
            "plan": payload.plan,
            "amount": plan_info["amount"],
            "label": plan_info["label"],
            "email": current_user.email,
            "seller_id": current_user.id,
            "paystack_public_key": settings.PAYSTACK_PUBLIC_KEY,
            "callback_note": "After payment, Paystack will call POST /api/v1/subscription/webhook automatically"
        },
        message="Proceed to payment"
    )


@router.post("/webhook", summary="Paystack webhook — called automatically after payment")
async def paystack_webhook(request: Request, db: Session = Depends(get_db)):
    # Verify the request is from Paystack
    body = await request.body()
    paystack_sig = request.headers.get("x-paystack-signature", "")
    expected_sig = hmac.new(
        settings.PAYSTACK_SECRET_KEY.encode(),
        body,
        hashlib.sha512
    ).hexdigest()

    if paystack_sig != expected_sig:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    import json
    data = json.loads(body)

    if data.get("event") != "charge.success":
        return {"status": "ignored"}

    payment_data = data.get("data", {})
    ref = payment_data.get("reference")
    email = payment_data.get("customer", {}).get("email")
    amount = payment_data.get("amount", 0)

    # Determine plan from amount
    plan = "basic" if amount <= 200000 else "premium"
    duration_days = 30

    user = db.query(User).filter(User.email == email).first()
    if not user:
        return {"status": "user not found"}

    # Create subscription record
    sub = Subscription(
        seller_id=user.id,
        plan=plan,
        status="active",
        started_at=datetime.utcnow(),
        expires_at=datetime.utcnow() + timedelta(days=duration_days),
        paystack_ref=ref
    )
    db.add(sub)

    # Update user subscription status
    db.query(User).filter(User.id == user.id).update({
        "subscription_status": SubscriptionStatus.active
    })

    notify(db, user.id, "subscription_activated",
        f"Your {plan.capitalize()} subscription is now active. Happy selling!")

    db.commit()
    return {"status": "success"}


@router.get("/history", summary="Get my subscription payment history")
def get_history(
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    subs = db.query(Subscription).filter(
        Subscription.seller_id == current_user.id
    ).order_by(Subscription.created_at.desc()).all()

    return success(data=[
        {
            "id": s.id,
            "plan": s.plan,
            "status": s.status,
            "started_at": str(s.started_at),
            "expires_at": str(s.expires_at),
            "paystack_ref": s.paystack_ref
        } for s in subs
    ])