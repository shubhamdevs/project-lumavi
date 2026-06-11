import pytest
from app.db.models import User
from sqlalchemy import select

@pytest.mark.asyncio
async def test_clerk_webhook_user_created(client, db_session, monkeypatch):
    # Mock the svix verify function to avoid signature errors
    from svix.webhooks import Webhook
    import uuid
    uid = str(uuid.uuid4())
    def mock_verify(*args, **kwargs):
        return {
            "type": "user.created",
            "data": {
                "id": uid,
                "email_addresses": [{"email_address": f"test_{uid}@example.com"}],
                "first_name": "Test",
                "last_name": "User",
                "image_url": "https://example.com/avatar.png"
            }
        }
    monkeypatch.setattr(Webhook, "verify", mock_verify)

    response = await client.post(
        "/webhooks/clerk",
        json={"data": {}},
        headers={
            "svix-id": "mock_id",
            "svix-timestamp": "mock_timestamp",
            "svix-signature": "mock_sig"
        }
    )
    
    assert response.status_code == 200
    assert response.json() == {"received": True}

    # Verify user was inserted
    user = await db_session.get(User, uid)
    assert user is not None
    assert user.email == f"test_{uid}@example.com"
    assert user.full_name == "Test User"
    assert user.avatar_url == "https://example.com/avatar.png"

@pytest.mark.asyncio
async def test_clerk_webhook_invalid_signature(client):
    response = client.post(
        "/webhooks/clerk",
        json={"data": {}},
    )
    # The signature should fail since we didn't provide headers or mock
    assert response.status_code == 400
    assert response.json() == {"detail": "Invalid webhook signature"}
