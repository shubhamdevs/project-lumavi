from fastapi import APIRouter, Request, HTTPException, Header
from svix.webhooks import Webhook, WebhookVerificationError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db import connection
from app.config import get_settings
from app.db.models import User

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/clerk")
async def clerk_webhook(
    request: Request,
    svix_id: str = Header(None, alias="svix-id"),
    svix_timestamp: str = Header(None, alias="svix-timestamp"),
    svix_signature: str = Header(None, alias="svix-signature"),
):
    settings = get_settings()
    body = await request.body()

    try:
        wh = Webhook(settings.clerk_webhook_secret)
        event = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        })
    except WebhookVerificationError:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    if event.get("type") == "user.created":
        data = event["data"]
        email = (data.get("email_addresses") or [{}])[0].get("email_address", "")
        first = data.get("first_name") or ""
        last = data.get("last_name") or ""
        full_name = f"{first} {last}".strip() or None
        avatar_url = data.get("image_url")
        clerk_id = data["id"]

        async with connection.AsyncSessionLocal() as db:
            existing = await db.get(User, clerk_id)
            if not existing:
                db.add(User(id=clerk_id, email=email, full_name=full_name, avatar_url=avatar_url))
                await db.commit()

    return {"received": True}
