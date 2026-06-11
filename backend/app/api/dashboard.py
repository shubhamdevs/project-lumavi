import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.auth import get_current_user_id
from app.db.connection import get_db
from app.db.models import WorkspaceMember, Workspace, Organization, BrandGuidelines, Asset, CreditLedger, GenerationJob

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/{workspace_id}/summary")
async def get_dashboard_summary(
    workspace_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    ws_uuid = uuid.UUID(workspace_id)

    # Subqueries to fetch associated data in one single database roundtrip
    brand_sub = select(BrandGuidelines.completeness).where(BrandGuidelines.workspace_id == ws_uuid).limit(1).scalar_subquery()
    member_count_sub = select(func.count()).where(WorkspaceMember.workspace_id == ws_uuid, WorkspaceMember.status == "active").scalar_subquery()
    asset_count_sub = select(func.count()).where(Asset.workspace_id == ws_uuid, Asset.deleted_at.is_(None)).scalar_subquery()
    is_member_sub = select(1).where(WorkspaceMember.workspace_id == ws_uuid, WorkspaceMember.user_id == user_id, WorkspaceMember.status == "active").exists()

    # Main query returning workspace, organization and computed aggregates
    query = (
        select(
            Workspace,
            Organization,
            brand_sub.label("brand_completeness"),
            member_count_sub.label("member_count"),
            asset_count_sub.label("asset_count"),
            is_member_sub.label("is_member")
        )
        .join(Organization, Workspace.org_id == Organization.id)
        .where(Workspace.id == ws_uuid)
    )

    result = await db.execute(query)
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Workspace not found")

    workspace, org, completeness, member_count, asset_count, is_member = row

    if not is_member:
        raise HTTPException(status_code=403, detail="Not a workspace member")

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
        "brand_completeness": completeness or 0,
        "member_count": member_count or 0,
        "asset_count": asset_count or 0,
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


@router.get("/{workspace_id}/assets")
async def get_workspace_assets(
    workspace_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    ws_uuid = uuid.UUID(workspace_id)
    # Check if the user is a member of the workspace
    member_result = await db.execute(
        select(WorkspaceMember).where(
            WorkspaceMember.user_id == user_id,
            WorkspaceMember.workspace_id == ws_uuid,
            WorkspaceMember.status == "active",
        )
    )
    if not member_result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Not a workspace member")

    # Fetch assets along with their corresponding generation job if any
    query = (
        select(Asset, GenerationJob)
        .outerjoin(GenerationJob, Asset.job_id == GenerationJob.id)
        .where(Asset.workspace_id == ws_uuid, Asset.deleted_at.is_(None))
        .order_by(Asset.created_at.desc())
    )
    
    result = await db.execute(query)
    rows = result.all()

    return {
        "assets": [
            {
                "id": str(asset.id),
                "type": asset.type,
                "name": asset.name,
                "url": asset.url,
                "thumbnail_url": asset.thumbnail_url,
                "created_at": asset.created_at.isoformat(),
                "prompt": job.prompt_raw if job else (asset.name or ""),
                "model_used": job.model_used if job else None,
                "metadata": job.job_metadata if job else None,
            }
            for asset, job in rows
        ]
    }

