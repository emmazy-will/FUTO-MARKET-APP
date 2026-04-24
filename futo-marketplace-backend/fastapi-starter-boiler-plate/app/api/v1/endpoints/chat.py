import json
from typing import Optional, Dict
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from app.db.database import get_db, SessionLocal
from app.models.orm_models import Conversation, Message, User, Item
from app.schemas.schemas import ConversationCreateRequest, MessageCreateRequest
from app.core.dependencies import get_current_verified_user
from app.core.security import decode_token

router = APIRouter()


def success(data=None, message=None):
    return {"success": True, "message": message, "data": data}


def format_message(msg: Message) -> dict:
    return {
        "id": msg.id,
        "conversation_id": msg.conversation_id,
        "sender_id": msg.sender_id,
        "content": msg.content,
        "message_type": msg.message_type,
        "is_read": msg.is_read,
        "delivered_at": str(msg.delivered_at) if msg.delivered_at else None,
        "created_at": str(msg.created_at) if msg.created_at else None,
    }


# ── WebSocket Connection Manager ──────────────────────────────────────────────

class ConnectionManager:
    def __init__(self):
        # user_id → WebSocket
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        self.active_connections.pop(user_id, None)

    async def send_to_user(self, user_id: int, data: dict):
        ws = self.active_connections.get(user_id)
        if ws:
            try:
                await ws.send_text(json.dumps(data))
            except Exception:
                self.disconnect(user_id)

    def is_online(self, user_id: int) -> bool:
        return user_id in self.active_connections


manager = ConnectionManager()


# ── WebSocket endpoint ────────────────────────────────────────────────────────

@router.websocket("/ws")
async def websocket_chat(websocket: WebSocket, token: str):
    """
    Connect with: ws://localhost:8000/api/v1/chat/ws?token=YOUR_ACCESS_TOKEN

    Client sends JSON:
      { "event": "message:send", "conversation_id": 1, "content": "Hello" }
      { "event": "typing:start", "conversation_id": 1 }
      { "event": "typing:stop", "conversation_id": 1 }
      { "event": "message:read", "conversation_id": 1 }

    Server pushes JSON:
      { "event": "message:new", "message": {...} }
      { "event": "typing:indicator", "user_id": 1, "conversation_id": 1 }
      { "event": "message:read", "conversation_id": 1, "reader_id": 2 }
      { "event": "message:delivered", "message_id": 1 }
    """
    # Authenticate via token query param
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        await websocket.close(code=4001)
        return

    user_id = payload.get("sub")
    await manager.connect(user_id, websocket)

    db = SessionLocal()
    try:
        while True:
            raw = await websocket.receive_text()
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                continue

            event = data.get("event")

            # ── Send a message ────────────────────────────────────────────────
            if event == "message:send":
                conversation_id = data.get("conversation_id")
                content = data.get("content", "").strip()
                message_type = data.get("message_type", "text")

                if not content or not conversation_id:
                    continue

                # Verify conversation exists and user is part of it
                conv = db.query(Conversation).filter(
                    Conversation.id == conversation_id
                ).first()
                if not conv or user_id not in [conv.buyer_id, conv.seller_id]:
                    continue

                # Save message to DB
                msg = Message(
                    conversation_id=conversation_id,
                    sender_id=user_id,
                    content=content,
                    message_type=message_type,
                    delivered_at=datetime.utcnow()
                )
                db.add(msg)
                db.commit()
                db.refresh(msg)

                # Push to recipient if online
                recipient_id = conv.seller_id if user_id == conv.buyer_id else conv.buyer_id
                await manager.send_to_user(recipient_id, {
                    "event": "message:new",
                    "message": format_message(msg)
                })

                # Confirm delivery to sender
                await manager.send_to_user(user_id, {
                    "event": "message:delivered",
                    "message_id": msg.id
                })

            # ── Typing start ──────────────────────────────────────────────────
            elif event == "typing:start":
                conversation_id = data.get("conversation_id")
                conv = db.query(Conversation).filter(
                    Conversation.id == conversation_id
                ).first()
                if conv and user_id in [conv.buyer_id, conv.seller_id]:
                    recipient_id = conv.seller_id if user_id == conv.buyer_id else conv.buyer_id
                    await manager.send_to_user(recipient_id, {
                        "event": "typing:indicator",
                        "user_id": user_id,
                        "conversation_id": conversation_id,
                        "is_typing": True
                    })

            # ── Typing stop ───────────────────────────────────────────────────
            elif event == "typing:stop":
                conversation_id = data.get("conversation_id")
                conv = db.query(Conversation).filter(
                    Conversation.id == conversation_id
                ).first()
                if conv and user_id in [conv.buyer_id, conv.seller_id]:
                    recipient_id = conv.seller_id if user_id == conv.buyer_id else conv.buyer_id
                    await manager.send_to_user(recipient_id, {
                        "event": "typing:indicator",
                        "user_id": user_id,
                        "conversation_id": conversation_id,
                        "is_typing": False
                    })

            # ── Mark messages as read ─────────────────────────────────────────
            elif event == "message:read":
                conversation_id = data.get("conversation_id")
                # Mark all unread messages in this conversation as read
                db.query(Message).filter(
                    Message.conversation_id == conversation_id,
                    Message.sender_id != user_id,
                    Message.is_read == False
                ).update({"is_read": True})
                db.commit()

                # Notify the sender their messages were read
                conv = db.query(Conversation).filter(
                    Conversation.id == conversation_id
                ).first()
                if conv:
                    sender_id = conv.seller_id if user_id == conv.buyer_id else conv.buyer_id
                    await manager.send_to_user(sender_id, {
                        "event": "message:read",
                        "conversation_id": conversation_id,
                        "reader_id": user_id
                    })

    except WebSocketDisconnect:
        manager.disconnect(user_id)
    finally:
        db.close()


# ── REST: Get all my conversations ────────────────────────────────────────────

@router.get("/conversations", summary="Get all my conversations")
def get_conversations(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    from sqlalchemy import or_
    query = db.query(Conversation).filter(
        or_(
            Conversation.buyer_id == current_user.id,
            Conversation.seller_id == current_user.id
        )
    ).order_by(Conversation.created_at.desc())

    total = query.count()
    conversations = query.offset((page - 1) * per_page).limit(per_page).all()

    result = []
    for conv in conversations:
        # Get last message
        last_msg = db.query(Message).filter(
            Message.conversation_id == conv.id
        ).order_by(Message.created_at.desc()).first()

        # Get unread count for current user
        unread = db.query(Message).filter(
            Message.conversation_id == conv.id,
            Message.sender_id != current_user.id,
            Message.is_read == False
        ).count()

        # Get other user info
        other_id = conv.seller_id if current_user.id == conv.buyer_id else conv.buyer_id
        other_user = db.query(User).filter(User.id == other_id).first()
        item = db.query(Item).filter(Item.id == conv.item_id).first()

        result.append({
            "id": conv.id,
            "item": {"id": item.id, "title": item.title, "price": item.price} if item else None,
            "other_user": {
                "id": other_user.id,
                "name": other_user.name,
                "username": other_user.username,
                "profile_photo": other_user.profile_photo,
                "is_online": manager.is_online(other_user.id)
            } if other_user else None,
            "last_message": format_message(last_msg) if last_msg else None,
            "unread_count": unread,
            "created_at": str(conv.created_at)
        })

    return {
        "success": True,
        "data": result,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "total_pages": -(-total // per_page)
        }
    }


# ── REST: Start a conversation ────────────────────────────────────────────────

@router.post("/conversations", status_code=201, summary="Start a conversation about a listing")
def create_conversation(
    payload: ConversationCreateRequest,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    # Verify item exists
    item = db.query(Item).filter(
        Item.id == payload.item_id,
        Item.deleted_at == None
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Listing not found")

    # Cannot chat with yourself
    if item.seller_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot start a conversation about your own listing")

    # Check if conversation already exists
    existing = db.query(Conversation).filter(
        Conversation.buyer_id == current_user.id,
        Conversation.seller_id == payload.seller_id,
        Conversation.item_id == payload.item_id
    ).first()
    if existing:
        return success(data={"conversation_id": existing.id}, message="Conversation already exists")

    conv = Conversation(
        buyer_id=current_user.id,
        seller_id=payload.seller_id,
        item_id=payload.item_id
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)

    return success(data={"conversation_id": conv.id}, message="Conversation started")


# ── REST: Get messages in a conversation ──────────────────────────────────────

@router.get("/messages/{conversation_id}", summary="Get messages in a conversation")
def get_messages(
    conversation_id: int,
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if current_user.id not in [conv.buyer_id, conv.seller_id]:
        raise HTTPException(status_code=403, detail="You are not part of this conversation")

    query = db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at.asc())

    total = query.count()
    messages = query.offset((page - 1) * per_page).limit(per_page).all()

    # Mark received messages as read
    db.query(Message).filter(
        Message.conversation_id == conversation_id,
        Message.sender_id != current_user.id,
        Message.is_read == False
    ).update({"is_read": True})
    db.commit()

    return {
        "success": True,
        "data": [format_message(m) for m in messages],
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "total_pages": -(-total // per_page)
        }
    }


# ── REST: Send a message (fallback for non-WebSocket clients) ─────────────────

@router.post("/messages", status_code=201, summary="Send a message (REST fallback)")
def send_message(
    payload: MessageCreateRequest,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    conv = db.query(Conversation).filter(
        Conversation.id == payload.conversation_id
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if current_user.id not in [conv.buyer_id, conv.seller_id]:
        raise HTTPException(status_code=403, detail="You are not part of this conversation")

    msg = Message(
        conversation_id=payload.conversation_id,
        sender_id=current_user.id,
        content=payload.content,
        message_type=payload.message_type or "text",
        delivered_at=datetime.utcnow()
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    return success(data=format_message(msg), message="Message sent")