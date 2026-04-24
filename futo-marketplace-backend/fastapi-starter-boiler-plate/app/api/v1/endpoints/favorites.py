from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.orm_models import Favorite, Item, User
from app.core.dependencies import get_current_verified_user

router = APIRouter()


def success(data=None, message=None):
    return {"success": True, "message": message, "data": data}


# ── POST save a listing ───────────────────────────────────────────────────────

@router.post("/{item_id}", status_code=201, summary="Save a listing to favorites")
def add_favorite(
    item_id: int,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    # Check item exists
    item = db.query(Item).filter(Item.id == item_id, Item.deleted_at == None).first()
    if not item:
        raise HTTPException(status_code=404, detail="Listing not found")

    # Check not already favorited
    existing = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.item_id == item_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already in favorites")

    favorite = Favorite(user_id=current_user.id, item_id=item_id)
    db.add(favorite)
    db.commit()
    db.refresh(favorite)

    return success(
        data={"id": favorite.id, "item_id": item_id},
        message="Added to favorites"
    )


# ── DELETE remove from favorites ──────────────────────────────────────────────

@router.delete("/{item_id}", summary="Remove a listing from favorites")
def remove_favorite(
    item_id: int,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.item_id == item_id
    ).first()
    if not favorite:
        raise HTTPException(status_code=404, detail="Not in your favorites")

    db.delete(favorite)
    db.commit()

    return success(message="Removed from favorites")


# ── GET my favorites ──────────────────────────────────────────────────────────

@router.get("", summary="Get all my saved listings")
def get_favorites(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    query = db.query(Favorite).filter(
        Favorite.user_id == current_user.id
    ).order_by(Favorite.created_at.desc())

    total = query.count()
    favorites = query.offset((page - 1) * per_page).limit(per_page).all()

    # Attach item details to each favorite
    result = []
    for fav in favorites:
        item = db.query(Item).filter(
            Item.id == fav.item_id,
            Item.deleted_at == None
        ).first()
        result.append({
            "favorite_id": fav.id,
            "item_id": fav.item_id,
            "saved_at": str(fav.created_at),
            "item": {
                "id": item.id,
                "title": item.title,
                "price": item.price,
                "status": item.status,
                "category": item.category,
                "condition": item.condition,
            } if item else None
        })

    return {
        "success": True,
        "message": None,
        "data": result,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "total_pages": -(-total // per_page)
        }
    }