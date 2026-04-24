from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.orm_models import Rating, Order, User, OrderStatus
from app.schemas.schemas import RatingCreateRequest
from app.core.dependencies import get_current_verified_user

router = APIRouter()

def success(data=None, message=None):
    return {"success": True, "message": message, "data": data}


@router.post("/{user_id}", status_code=201, summary="Rate a seller after a completed order")
def rate_seller(
    user_id: int,
    payload: RatingCreateRequest,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    # Get the order
    order = db.query(Order).filter(Order.id == payload.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Must be the buyer
    if order.buyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the buyer can rate this order")

    # Order must be completed
    if order.status != OrderStatus.completed:
        raise HTTPException(status_code=400, detail="You can only rate after order is completed")

    # Cannot rate yourself
    if order.seller_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot rate yourself")

    # Check not already rated
    existing = db.query(Rating).filter(Rating.order_id == payload.order_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already rated this order")

    rating = Rating(
        order_id=payload.order_id,
        rater_id=current_user.id,
        ratee_id=order.seller_id,
        score=payload.score,
        comment=payload.comment
    )
    db.add(rating)
    db.commit()
    db.refresh(rating)

    return success(
        data={"id": rating.id, "score": rating.score, "comment": rating.comment},
        message="Rating submitted"
    )


@router.get("/{user_id}", summary="Get all ratings for a seller")
def get_ratings(
    user_id: int,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    seller = db.query(User).filter(User.id == user_id).first()
    if not seller:
        raise HTTPException(status_code=404, detail="User not found")

    query = db.query(Rating).filter(
        Rating.ratee_id == user_id
    ).order_by(Rating.created_at.desc())

    total = query.count()
    ratings = query.offset((page - 1) * per_page).limit(per_page).all()

    # Calculate average
    all_scores = db.query(Rating.score).filter(Rating.ratee_id == user_id).all()
    avg = round(sum(s[0] for s in all_scores) / len(all_scores), 1) if all_scores else 0

    return {
        "success": True,
        "data": {
            "average_score": avg,
            "total_ratings": total,
            "ratings": [
                {
                    "id": r.id,
                    "score": r.score,
                    "comment": r.comment,
                    "rater_id": r.rater_id,
                    "created_at": str(r.created_at)
                } for r in ratings
            ]
        },
        "pagination": {
            "page": page, "per_page": per_page,
            "total": total, "total_pages": -(-total // per_page)
        }
    }