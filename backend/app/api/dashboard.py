import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.auth import get_current_user_id
from app.db.connection import get_db
from app.db.models import WorkspaceMember, Workspace, Organization, BrandGuidelines, Asset, CreditLedger

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/{workspace_id}/summary")
async def get_dashboard_summary(
    workspace_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    ws_uuid = uuid.UUID(workspace_id)

    member_result = await db.execute(
        select(WorkspaceMember).where(
            WorkspaceMember.user_id == user_id,
            WorkspaceMember.workspace_id == ws_uuid,
            WorkspaceMember.status == "active",
        )
    )
    if not member_result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Not a workspace member")

    ws_result = await db.execute(
        select(Workspace, Organization)
        .join(Organization, Workspace.org_id == Organization.id)
        .where(Workspace.id == ws_uuid)
    )
    ws_row = ws_result.first()
    if not ws_row:
        raise HTTPException(status_code=404, detail="Workspace not found")
    workspace, org = ws_row

    brand_result = await db.execute(
        select(BrandGuidelines.completeness).where(BrandGuidelines.workspace_id == ws_uuid)
    )
    completeness = brand_result.scalar_one_or_none() or 0

    member_count_result = await db.execute(
        select(func.count()).where(WorkspaceMember.workspace_id == ws_uuid, WorkspaceMember.status == "active")
    )
    member_count = member_count_result.scalar_one()

    asset_count_result = await db.execute(
        select(func.count()).where(Asset.workspace_id == ws_uuid, Asset.deleted_at.is_(None))
    )
    asset_count = asset_count_result.scalar_one()

    recent_assets_result = await db.execute(
        select(Asset)
        .where(Asset.workspace_id == ws_uuid, Asset.deleted_at.is_(None))
        .order_by(Asset.created_at.desc())
        .limit(6)
    )
    recent_assets = recent_assets_result.scalars().all()

    return {
        "workspace": {"id": str(workspace.id), "name": workspace.name},
        "organization": {"id": str(org.id), "name": org.name, "plan_tier": org.plan_tier},
        "credit_balance": org.credit_pool,
        "brand_completeness": completeness,
        "member_count": member_count,
        "asset_count": asset_count,
        "recent_assets": [
            {
                "id": str(a.id),
                "type": a.type,
                "name": a.name,
                "url": a.url,
                "thumbnail_url": a.thumbnail_url,
                "created_at": a.created_at.isoformat(),
            }
            for a in recent_assets
        ],
    }


@router.post("/{workspace_id}/top-up-credits")
async def top_up_credits(
    workspace_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    ws_uuid = uuid.UUID(workspace_id)
    member_result = await db.execute(
        select(WorkspaceMember).where(
            WorkspaceMember.user_id == user_id,
            WorkspaceMember.workspace_id == ws_uuid,
            WorkspaceMember.status == "active",
        )
    )
    if not member_result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Not a workspace member")

    ws = await db.get(Workspace, ws_uuid)
    org = await db.get(Organization, ws.org_id)
    org.credit_pool += 100
    db.add(CreditLedger(
        org_id=org.id,
        workspace_id=ws_uuid,
        user_id=user_id,
        action_type="top_up",
        credits_amount=100,
        balance_after=org.credit_pool,
    ))
    await db.commit()
    return {"success": True, "new_balance": org.credit_pool}
