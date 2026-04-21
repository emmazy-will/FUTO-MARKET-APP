from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, items, orders, favorites,
    chat, ratings, notifications,
    subscriptions, admin
)

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["Auth"])
router.include_router(items.router, prefix="/items", tags=["Items"])
router.include_router(orders.router, prefix="/orders", tags=["Orders"])
router.include_router(favorites.router, prefix="/favorites", tags=["Favorites"])
router.include_router(chat.router, prefix="/chat", tags=["Chat"])
router.include_router(ratings.router, prefix="/ratings", tags=["Ratings"])
router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
router.include_router(subscriptions.router, prefix="/subscription", tags=["Subscriptions"])
router.include_router(admin.router, prefix="/admin", tags=["Admin"])