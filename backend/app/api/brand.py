import uuid
import time
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.auth import get_current_user_id
from app.db.connection import get_db
from app.db.models import WorkspaceMember, BrandGuidelines
from app.services import storage, brand_extraction
from app.config import get_settings
import base64

router = APIRouter(prefix="/brand", tags=["brand"])


async def _get_member_workspace(user_id: str, workspace_id: str, db: AsyncSession):
    result = await db.execute(
        select(WorkspaceMember).where(
            WorkspaceMember.user_id == user_id,
            WorkspaceMember.workspace_id == uuid.UUID(workspace_id),
            WorkspaceMember.status == "active",
        )
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Not a workspace member")


async def _get_or_create_brand(workspace_id: uuid.UUID, db: AsyncSession) -> BrandGuidelines:
    result = await db.execute(
        select(BrandGuidelines).where(BrandGuidelines.workspace_id == workspace_id)
    )
    brand = result.scalar_one_or_none()
    if not brand:
        brand = BrandGuidelines(workspace_id=workspace_id)
        db.add(brand)
        await db.flush()
    return brand


def _compute_completeness(brand: BrandGuidelines) -> int:
    fields = [
        brand.colors, brand.typography, brand.tone,
        brand.photography_style, brand.imagery_style,
        brand.brand_is_not, brand.audience, brand.color_mood,
        brand.brand_keywords, brand.lighting, brand.composition,
    ]
    filled = sum(1 for f in fields if f)
    return round((filled / len(fields)) * 100)


class BrandSectionPayload(BaseModel):
    workspace_id: str
    section: str
    data: dict


@router.get("/{workspace_id}")
async def get_brand(
    workspace_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    await _get_member_workspace(user_id, workspace_id, db)
    brand = await _get_or_create_brand(uuid.UUID(workspace_id), db)
    await db.commit()
    return {
        "id": str(brand.id),
        "workspace_id": workspace_id,
        "colors": brand.colors,
        "typography": brand.typography,
        "tone": brand.tone,
        "logos": brand.logos,
        "photography_style": brand.photography_style,
        "imagery_style": brand.imagery_style,
        "brand_is_not": brand.brand_is_not,
        "audience": brand.audience,
        "color_mood": brand.color_mood,
        "brand_keywords": brand.brand_keywords,
        "brand_personality": brand.brand_personality,
        "lighting": brand.lighting,
        "composition": brand.composition,
        "completeness": brand.completeness,
    }


@router.patch("/section")
async def save_brand_section(
    payload: BrandSectionPayload,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    await _get_member_workspace(user_id, payload.workspace_id, db)
    brand = await _get_or_create_brand(uuid.UUID(payload.workspace_id), db)

    section_map = {
        "colors": "colors", "typography": "typography", "tone": "tone",
        "photography_style": "photography_style", "imagery_style": "imagery_style",
        "brand_is_not": "brand_is_not", "audience": "audience", "color_mood": "color_mood",
        "brand_keywords": "brand_keywords", "brand_personality": "brand_personality",
        "lighting": "lighting", "composition": "composition",
    }
    for key, attr in section_map.items():
        if key in payload.data:
            setattr(brand, attr, payload.data[key])

    brand.updated_by = user_id
    brand.completeness = _compute_completeness(brand)
    await db.commit()
    return {"success": True, "completeness": brand.completeness}


class LogoUploadPayload(BaseModel):
    workspace_id: str
    logo_base64: str
    mime_type: str
    variant: str = "light"


@router.post("/upload-logo")
async def upload_logo(
    payload: LogoUploadPayload,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    await _get_member_workspace(user_id, payload.workspace_id, db)
    settings = get_settings()
    ext = storage.extension_for(payload.mime_type)
    blob_path = f"{payload.workspace_id}/logo-{payload.variant}-{int(time.time())}{ext}"
    url = storage.upload_base64(settings.gcs_brand_assets_bucket, blob_path, payload.logo_base64, payload.mime_type)

    brand = await _get_or_create_brand(uuid.UUID(payload.workspace_id), db)
    logos = brand.logos or {}
    logos[payload.variant] = url
    brand.logos = logos
    brand.completeness = _compute_completeness(brand)
    await db.commit()
    return {"success": True, "url": url, "completeness": brand.completeness}


class AnalyzeLogoPayload(BaseModel):
    logo_base64: str
    mime_type: str


@router.post("/analyze-logo")
async def analyze_logo(
    payload: AnalyzeLogoPayload,
    user_id: str = Depends(get_current_user_id),
):
    result = await brand_extraction.extract_brand_from_logo(payload.logo_base64, payload.mime_type)
    return result
