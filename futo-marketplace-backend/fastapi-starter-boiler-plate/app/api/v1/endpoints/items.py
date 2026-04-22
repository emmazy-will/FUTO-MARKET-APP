import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, desc, asc
from app.db.database import get_db
from app.models.orm_models import Item, User, ItemStatus, SubscriptionStatus
from app.schemas.schemas import CreateItemRequest, UpdateItemRequest
from app.core.dependencies import get_current_user, get_current_verified_user
from app.services.upload_service import upload_multiple_images

router = APIRouter()

FREE_TIER_LIMIT = 3  # sales before subscription required


def success(data=None, message=None):
    return {"success": True, "message": message, "data": data}


def check_seller_can_post(user: User):
    """Block listing creation if seller has hit free tier and not subscribed."""
    if user.role not in ["seller", "admin"]:
        raise HTTPException(status_code=403, detail="Only sellers can create listings")
    if user.role == "seller":
        if user.subscription_status in ["free_limit_reached", "expired"]:
            raise HTTPException(
                status_code=403,
                detail="You have reached your free tier limit. Please subscribe to continue listing."
            )


# ── Create Listing ────────────────────────────────────────────────────────────

@router.post("/", status_code=201, summary="Create a new listing")
async def create_item(
    title: str = Query(...),
    description: Optional[str] = Query(None),
    price: float = Query(...),
    category: str = Query(...),
    condition: str = Query(...),
    location: Optional[str] = Query(None),
    images: list[UploadFile] = File(default=[]),
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    check_seller_can_post(current_user)

    # Upload images to Cloudinary
    image_urls = []
    if images:
        image_urls = await upload_multiple_images(images, folder="futo-marketplace/items")

    item = Item(
        seller_id=current_user.id,
        title=title,
        description=description,
        price=price,
        category=category,
        condition=condition,
        location=location,
        images=json.dumps(image_urls) if image_urls else None,
        status=ItemStatus.active
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    return success(
        data={"item_id": item.id, "title": item.title, "images": image_urls},
        message="Listing created successfully"
    )


# ── Get All Items (Browse / Search) ──────────────────────────────────────────

@router.get("/", summary="Browse and search listings")
def get_items(
    search: Optional[str] = Query(None, description="Search by title or description"),
    category: Optional[str] = Query(None),
    condition: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    location: Optional[str] = Query(None),
    sort: Optional[str] = Query("newest", description="newest | price_asc | price_desc | most_viewed"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Item).filter(
        Item.status == ItemStatus.active,
        Item.deleted_at == None
    )

    # Search
    if search:
        query = query.filter(
            or_(
                Item.title.ilike(f"%{search}%"),
                Item.description.ilike(f"%{search}%")
            )
        )

    # Filters
    if category:
        query = query.filter(Item.category == category)
    if condition:
        query = query.filter(Item.condition == condition)
    if min_price is not None:
        query = query.filter(Item.price >= min_price)
    if max_price is not None:
        query = query.filter(Item.price <= max_price)
    if location:
        query = query.filter(Item.location.ilike(f"%{location}%"))

    # Boosted items always first
    query = query.order_by(desc(Item.is_boosted))

    # Sort
    if sort == "price_asc":
        query = query.order_by(asc(Item.price))
    elif sort == "price_desc":
        query = query.order_by(desc(Item.price))
    elif sort == "most_viewed":
        query = query.order_by(desc(Item.view_count))
    else:  # newest (default)
        query = query.order_by(desc(Item.created_at))

    total = query.count()
    items = query.offset((page - 1) * per_page).limit(per_page).all()

    return {
        "success": True,
        "message": None,
        "data": [_format_item(i) for i in items],
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "total_pages": -(-total // per_page)  # ceiling division
        }
    }


# ── Get Single Item ───────────────────────────────────────────────────────────

@router.get("/{item_id}", summary="Get a single listing by ID")
def get_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Item).filter(
        Item.id == item_id,
        Item.deleted_at == None
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Listing not found")

    # Increment view count
    item.view_count += 1
    db.commit()

    return success(data=_format_item(item, include_seller=True))


# ── Get Listings by Seller ────────────────────────────────────────────────────

@router.get("/seller/{seller_id}", summary="Get all listings by a seller")
def get_seller_items(
    seller_id: int,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    seller = db.query(User).filter(User.id == seller_id).first()
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")

    query = db.query(Item).filter(
        Item.seller_id == seller_id,
        Item.deleted_at == None
    ).order_by(desc(Item.created_at))

    total = query.count()
    items = query.offset((page - 1) * per_page).limit(per_page).all()

    return {
        "success": True,
        "message": None,
        "data": [_format_item(i) for i in items],
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "total_pages": -(-total // per_page)
        }
    }


# ── Get My Listings ───────────────────────────────────────────────────────────

@router.get("/me/listings", summary="Get my own listings")
def get_my_items(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Item).filter(
        Item.seller_id == current_user.id,
        Item.deleted_at == None
    ).order_by(desc(Item.created_at))

    total = query.count()
    items = query.offset((page - 1) * per_page).limit(per_page).all()

    return {
        "success": True,
        "message": None,
        "data": [_format_item(i) for i in items],
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "total_pages": -(-total // per_page)
        }
    }


# ── Update Listing ────────────────────────────────────────────────────────────

@router.put("/{item_id}", summary="Edit a listing (owner only)")
def update_item(
    item_id: int,
    payload: UpdateItemRequest,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    item = db.query(Item).filter(
        Item.id == item_id,
        Item.deleted_at == None
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Listing not found")
    if item.seller_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="You can only edit your own listings")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return success(data=_format_item(item), message="Listing updated successfully")


# ── Mark as Sold ──────────────────────────────────────────────────────────────

@router.put("/{item_id}/mark-sold", summary="Mark a listing as sold")
def mark_as_sold(
    item_id: int,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    item = db.query(Item).filter(Item.id == item_id, Item.deleted_at == None).first()
    if not item:
        raise HTTPException(status_code=404, detail="Listing not found")
    if item.seller_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="You can only update your own listings")

    item.status = ItemStatus.sold
    db.commit()
    return success(message="Listing marked as sold")


# ── Delete Listing (Soft Delete) ──────────────────────────────────────────────

@router.delete("/{item_id}", summary="Delete a listing (owner only)")
def delete_item(
    item_id: int,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    item = db.query(Item).filter(
        Item.id == item_id,
        Item.deleted_at == None
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Listing not found")
    if item.seller_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="You can only delete your own listings")

    from datetime import datetime
    item.deleted_at = datetime.utcnow()
    db.commit()
    return success(message="Listing deleted successfully")


# ── Report a Listing ──────────────────────────────────────────────────────────

@router.post("/{item_id}/report", summary="Report a listing")
def report_item(
    item_id: int,
    reason: str = Query(..., min_length=10),
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    from app.models.orm_models import Report
    item = db.query(Item).filter(Item.id == item_id, Item.deleted_at == None).first()
    if not item:
        raise HTTPException(status_code=404, detail="Listing not found")
    if item.seller_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot report your own listing")

    report = Report(
        reporter_id=current_user.id,
        item_id=item_id,
        reason=reason
    )
    db.add(report)
    db.commit()
    return success(message="Listing reported. Our team will review it.")


# ── Helper: format item for response ─────────────────────────────────────────

def _format_item(item: Item, include_seller: bool = False) -> dict:
    data = {
        "id": item.id,
        "seller_id": item.seller_id,
        "title": item.title,
        "description": item.description,
        "price": item.price,
        "category": item.category,
        "condition": item.condition,
        "status": item.status,
        "images": json.loads(item.images) if item.images else [],
        "location": item.location,
        "is_boosted": item.is_boosted,
        "view_count": item.view_count,
        "created_at": str(item.created_at),
    }
    if include_seller and item.seller:
        data["seller"] = {
            "id": item.seller.id,
            "name": item.seller.name,
            "username": item.seller.username,
            "profile_photo": item.seller.profile_photo,
        }
    return data