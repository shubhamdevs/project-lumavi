import pytest
import uuid
from app.db.models import Organization, Workspace, WorkspaceMember, Asset, GenerationJob, CreditLedger

@pytest.mark.asyncio
async def test_dashboard_summary(auth_client, db_session, mock_user_id):
    org_id = uuid.uuid4()
    ws_id = uuid.uuid4()
    
    org = Organization(id=org_id, name="Dash Org", credit_pool=150)
    db_session.add(org)
    
    ws = Workspace(id=ws_id, org_id=org_id, name="Dash WS")
    db_session.add(ws)
    
    member = WorkspaceMember(workspace_id=ws_id, user_id=mock_user_id, role="owner")
    db_session.add(member)

    asset = Asset(workspace_id=ws_id, user_id=mock_user_id, url="http://example.com/a.png", name="Asset 1")
    db_session.add(asset)
    
    await db_session.commit()

    response = await auth_client.get(f"/dashboard/{ws_id}/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["credit_balance"] == 150
    assert data["member_count"] == 1
    assert data["asset_count"] == 1
    assert len(data["recent_assets"]) == 1

@pytest.mark.asyncio
async def test_dashboard_assets_and_delete(auth_client, db_session, mock_user_id):
    org_id = uuid.uuid4()
    ws_id = uuid.uuid4()
    job_id = uuid.uuid4()
    
    db_session.add(Organization(id=org_id, name="Gallery Org"))
    db_session.add(Workspace(id=ws_id, org_id=org_id, name="Gallery WS"))
    db_session.add(WorkspaceMember(workspace_id=ws_id, user_id=mock_user_id, role="owner"))
    
    job = GenerationJob(id=job_id, workspace_id=ws_id, user_id=mock_user_id, prompt_raw="A dog")
    db_session.add(job)
    
    asset = Asset(workspace_id=ws_id, user_id=mock_user_id, url="http://example.com/b.png", job_id=job_id)
    db_session.add(asset)
    
    await db_session.commit()

    # GET /assets
    response = await auth_client.get(f"/dashboard/{ws_id}/assets")
    assert response.status_code == 200
    data = response.json()
    assert len(data["assets"]) == 1
    assert data["assets"][0]["url"] == "http://example.com/b.png"
    assert data["assets"][0]["prompt"] == "A dog"

    asset_id = data["assets"][0]["id"]

    # DELETE /assets/{id}
    del_res = await auth_client.delete(f"/dashboard/{ws_id}/assets/{asset_id}")
    assert del_res.status_code == 200
    assert del_res.json() == {"success": True}

    # Verify GET /assets excludes soft-deleted
    response2 = await auth_client.get(f"/dashboard/{ws_id}/assets")
    assert response2.status_code == 200
    assert len(response2.json()["assets"]) == 0

@pytest.mark.asyncio
async def test_dashboard_top_up_credits(auth_client, db_session, mock_user_id):
    org_id = uuid.uuid4()
    ws_id = uuid.uuid4()
    
    org = Organization(id=org_id, name="Credit Org", credit_pool=100)
    db_session.add(org)
    db_session.add(Workspace(id=ws_id, org_id=org_id, name="Credit WS"))
    db_session.add(WorkspaceMember(workspace_id=ws_id, user_id=mock_user_id, role="owner"))
    
    await db_session.commit()

    response = await auth_client.post(f"/dashboard/{ws_id}/top-up-credits")
    assert response.status_code == 200
    assert response.json()["new_balance"] == 200

    # Verify ledger
    from sqlalchemy import select
    result = await db_session.execute(select(CreditLedger).where(CreditLedger.org_id == org_id))
    ledger = result.scalar_one_or_none()
    assert ledger is not None
    assert ledger.credits_amount == 100
    assert ledger.action_type == "top_up"
