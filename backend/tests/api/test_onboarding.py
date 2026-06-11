import pytest
from app.db.models import Organization, Workspace, WorkspaceMember, BrandGuidelines

@pytest.mark.asyncio
async def test_onboarding_workspace_none(auth_client):
    # A user without a workspace should return None
    response = await auth_client.get("/onboarding/workspace")
    assert response.status_code == 200
    assert response.json() == {"workspace_id": None}

@pytest.mark.asyncio
async def test_onboarding_complete(auth_client, db_session, mock_user_id):
    # Complete onboarding
    payload = {
        "org": {"name": "Test Org", "industry": "Tech", "useCase": "Marketing"},
        "workspace": {"name": "Main Workspace", "description": "Test setup"},
        "brand": {"colors": {"primary": "#ff0000"}},
        "invites": ["team@example.com"]
    }

    response = await auth_client.post("/onboarding/complete", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    workspace_id = data["workspace_id"]
    assert workspace_id is not None

    # Verify the Database State
    ws = await db_session.get(Workspace, workspace_id)
    assert ws is not None
    assert ws.name == "Main Workspace"

    org = await db_session.get(Organization, ws.org_id)
    assert org is not None
    assert org.name == "Test Org"
    assert org.credit_pool == 100

    from sqlalchemy import select
    # Check the user was made a member
    result = await db_session.execute(
        select(WorkspaceMember).where(
            WorkspaceMember.workspace_id == ws.id,
            WorkspaceMember.user_id == mock_user_id
        )
    )
    member = result.scalar_one_or_none()
    assert member is not None
    assert member.role == "owner"

    # Check brand guidelines
    result = await db_session.execute(
        select(BrandGuidelines).where(BrandGuidelines.workspace_id == ws.id)
    )
    brand = result.scalar_one_or_none()
    assert brand is not None
    assert brand.colors["primary"] == "#ff0000"

@pytest.mark.asyncio
async def test_onboarding_workspace_exists(auth_client, db_session, mock_user_id):
    # Setup some workspace
    import uuid
    org_id = uuid.uuid4()
    ws_id = uuid.uuid4()
    
    org = Organization(id=org_id, name="Test")
    db_session.add(org)
    
    ws = Workspace(id=ws_id, org_id=org_id, name="Test WS")
    db_session.add(ws)
    
    member = WorkspaceMember(workspace_id=ws_id, user_id=mock_user_id, role="owner")
    db_session.add(member)
    
    await db_session.commit()

    response = auth_client.get("/onboarding/workspace")
    assert response.status_code == 200
    assert response.json() == {"workspace_id": str(ws_id)}
