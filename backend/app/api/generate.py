import uuid
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.auth import get_current_user_id
from app.db.connection import get_db
from app.db.models import WorkspaceMember, BrandGuidelines, GenerationJob, Organization, Workspace
from app.services.tasks import enqueue_image_job

router = APIRouter(prefix="/generate", tags=["generate"])

CREDIT_COST = {"standard": 3, "high": 6}
VARIATION_COST = 1


async def _resolve_workspace(user_id: str, workspace_id: str, db: AsyncSession):
    result = await db.execute(
        select(WorkspaceMember, Workspace, Organization)
        .join(Workspace, WorkspaceMember.workspace_id == Workspace.id)
        .join(Organization, Workspace.org_id == Organization.id)
        .where(
            WorkspaceMember.user_id == user_id,
            WorkspaceMember.workspace_id == uuid.UUID(workspace_id),
            WorkspaceMember.status == "active",
        )
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=403, detail="Not a workspace member")
    return row


class ImageJobPayload(BaseModel):
    workspace_id: str
    prompt: str
    aspect_ratio: str = "1:1"
    quality: str = "standard"


@router.post("/image")
async def submit_image_job(
    payload: ImageJobPayload,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    member, workspace, org = await _resolve_workspace(user_id, payload.workspace_id, db)
    cost = CREDIT_COST.get(payload.quality, 3)

    if org.credit_pool < cost:
        raise HTTPException(status_code=402, detail="Insufficient credits")

    brand_result = await db.execute(
        select(BrandGuidelines).where(BrandGuidelines.workspace_id == uuid.UUID(payload.workspace_id))
    )
    brand = brand_result.scalar_one_or_none()
    brand_dict = {}
    if brand:
        brand_dict = {
            "colors": brand.colors, "tone": brand.tone,
            "photography_style": brand.photography_style,
            "lighting": brand.lighting, "composition": brand.composition,
            "brand_is_not": brand.brand_is_not,
        }

    job = GenerationJob(
        workspace_id=uuid.UUID(payload.workspace_id),
        user_id=user_id,
        type="image",
        status="pending",
        prompt_raw=payload.prompt,
        credits_reserved=cost,
        job_metadata={"aspect_ratio": payload.aspect_ratio, "quality": payload.quality},
    )
    db.add(job)
    org.credit_pool -= cost
    await db.commit()

    enqueue_image_job(
        str(job.id), payload.workspace_id, user_id,
        {
            "prompt": payload.prompt,
            "brand": brand_dict,
            "aspect_ratio": payload.aspect_ratio,
            "quality": payload.quality,
            "credit_cost": cost,
            "org_id": str(org.id),
        },
    )
    return {"job_id": str(job.id), "status": "pending", "credits_reserved": cost}


@router.post("/image/variations")
async def submit_variations(
    payload: ImageJobPayload,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    member, workspace, org = await _resolve_workspace(user_id, payload.workspace_id, db)
    total_cost = VARIATION_COST * 4

    if org.credit_pool < total_cost:
        raise HTTPException(status_code=402, detail="Insufficient credits")

    brand_result = await db.execute(
        select(BrandGuidelines).where(BrandGuidelines.workspace_id == uuid.UUID(payload.workspace_id))
    )
    brand = brand_result.scalar_one_or_none()
    brand_dict = {}
    if brand:
        brand_dict = {
            "colors": brand.colors, "tone": brand.tone,
            "photography_style": brand.photography_style,
            "lighting": brand.lighting, "composition": brand.composition,
            "brand_is_not": brand.brand_is_not,
        }

    job_ids = []
    for _ in range(4):
        job = GenerationJob(
            workspace_id=uuid.UUID(payload.workspace_id),
            user_id=user_id,
            type="image",
            status="pending",
            prompt_raw=payload.prompt,
            credits_reserved=VARIATION_COST,
            job_metadata={"aspect_ratio": payload.aspect_ratio, "quality": "standard", "is_variation": True},
        )
        db.add(job)
        await db.flush()
        job_ids.append(str(job.id))
        enqueue_image_job(
            str(job.id), payload.workspace_id, user_id,
            {
                "prompt": payload.prompt,
                "brand": brand_dict,
                "aspect_ratio": payload.aspect_ratio,
                "quality": "standard",
                "credit_cost": VARIATION_COST,
                "org_id": str(org.id),
            },
        )

    org.credit_pool -= total_cost
    await db.commit()
    return {"job_ids": job_ids, "status": "pending"}
