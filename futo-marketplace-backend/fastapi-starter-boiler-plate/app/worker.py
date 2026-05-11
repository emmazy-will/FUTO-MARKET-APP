from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "futo_marketplace",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Africa/Lagos",
    enable_utc=True,
)


# ── Tasks ─────────────────────────────────────────────────────────────────────

@celery_app.task
def send_verification_email_task(email: str, name: str, otp: int):
    """Send email verification OTP — runs in background."""
    from app.services.email_service import send_otp_email
    send_otp_email(email, name, otp)


@celery_app.task
def send_order_notification_email_task(email: str, name: str, event: str, item_title: str):
    """Send order status email — runs in background."""
    from app.services.email_service import send_order_email
    send_order_email(email, name, event, item_title)


@celery_app.task
def send_subscription_expiry_warning_task(email: str, name: str, days_left: int):
    """Send subscription expiry warning."""
    from app.services.email_service import send_subscription_warning_email
    send_subscription_warning_email(email, name, days_left)


@celery_app.task
def check_expired_subscriptions_task():
    """Daily job — deactivate expired subscriptions."""
    from datetime import datetime
    from app.db.database import SessionLocal
    from app.models.orm_models import Subscription, User, SubscriptionStatus, Notification

    db = SessionLocal()
    try:
        expired = db.query(Subscription).filter(
            Subscription.status == "active",
            Subscription.expires_at < datetime.utcnow()
        ).all()

        for sub in expired:
            sub.status = "expired"
            db.query(User).filter(User.id == sub.seller_id).update({
                "subscription_status": SubscriptionStatus.expired
            })
            db.add(Notification(
                user_id=sub.seller_id,
                type="subscription_expired",
                message="Your subscription has expired. Renew to continue listing items."
            ))

        db.commit()
    finally:
        db.close()


# ── Scheduled tasks (Celery Beat) ─────────────────────────────────────────────

from celery.schedules import crontab

celery_app.conf.beat_schedule = {
    "check-expired-subscriptions-daily": {
        "task": "app.worker.check_expired_subscriptions_task",
        "schedule": crontab(hour=0, minute=0),  # Run at midnight daily
    },
}