import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.auth import get_current_user_id
from app.db.connection import get_db
from app.db.models import User, Organization, Workspace, WorkspaceMember, BrandGuidelines, Invitation

import httpx
from app.config import get_settings

router = APIRouter(prefix="/onboarding", tags=["onboarding"])


async def sync_clerk_user(user_id: str, db: AsyncSession) -> User:
    user = await db.get(User, user_id)
    if user:
        return user

    settings = get_settings()
    email = f"{user_id}@placeholder.lumavi.dev"
    full_name = "User"
    avatar_url = None

    if settings.clerk_secret_key:
        url = f"https://api.clerk.com/v1/users/{user_id}"
        headers = {"Authorization": f"Bearer {settings.clerk_secret_key}"}
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    email_addresses = data.get("email_addresses", [])
                    if email_addresses:
                        email = email_addresses[0].get("email_address", "")
                    first = data.get("first_name") or ""
                    last = data.get("last_name") or ""
                    full_name = f"{first} {last}".strip() or "User"
                    avatar_url = data.get("image_url") or None
        except Exception as e:
            print(f"Failed to fetch user from Clerk API: {e}")

    new_user = User(
        id=user_id,
        email=email,
        full_name=full_name,
        avatar_url=avatar_url
    )
    db.add(new_user)
    await db.flush()
    return new_user


class OrgData(BaseModel):
    name: str
    industry: str
    useCase: str


class WorkspaceData(BaseModel):
    name: str
    description: str = ""


class BrandData(BaseModel):
    primaryColor: str = ""
    secondaryColor: str = ""
    fontDisplay: str = ""
    fontBody: str = ""
    tone: str = ""
    photographyStyle: str = ""
    brandIsNot: str = ""
    imageryStyle: str = "Photography"
    colorMood: str = ""
    brandKeywords: list[str] = []
    audience: str = ""
    lighting: str = ""
    composition: str = ""


class OnboardingPayload(BaseModel):
    org: OrgData
    workspace: WorkspaceData
    brand: BrandData
    invites: list[str] = []


@router.get("/workspace")
async def get_user_workspace(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WorkspaceMember.workspace_id)
        .where(WorkspaceMember.workspace_id != None, WorkspaceMember.user_id == user_id, WorkspaceMember.status == "active")
        .limit(1)
    )
    row = result.first()
    if not row:
        return {"workspace_id": None}
    return {"workspace_id": str(row.workspace_id)}


@router.post("/complete")
async def complete_onboarding(
    payload: OnboardingPayload,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    # Ensure user exists in the database
    user = await sync_clerk_user(user_id, db)

    org = Organization(
        name=payload.org.name,
        industry=payload.org.industry,
        use_case=payload.org.useCase,
        plan_tier="starter",
        credit_pool=100,
    )
    db.add(org)
    await db.flush()

    ws = Workspace(
        org_id=org.id,
        name=payload.workspace.name,
        description=payload.workspace.description or None,
    )
    db.add(ws)
    await db.flush()

    member = WorkspaceMember(
        workspace_id=ws.id,
        user_id=user_id,
        role="owner",
        status="active",
        joined_at=datetime.now(timezone.utc),
    )
    db.add(member)

    brand = BrandGuidelines(
        workspace_id=ws.id,
        colors={"primary": payload.brand.primaryColor, "secondary": payload.brand.secondaryColor},
        typography={"display": payload.brand.fontDisplay, "body": payload.brand.fontBody},
        tone={"archetype": payload.brand.tone},
        photography_style=payload.brand.photographyStyle or None,
        brand_is_not=payload.brand.brandIsNot or None,
        imagery_style=payload.brand.imageryStyle or None,
        color_mood=payload.brand.colorMood or None,
        brand_keywords=[k for k in payload.brand.brandKeywords if k] or [],
        audience=payload.brand.audience or None,
        lighting=payload.brand.lighting or None,
        composition=payload.brand.composition or None,
    )
    db.add(brand)

    for email in payload.invites:
        if email:
            db.add(Invitation(workspace_id=ws.id, email=email, role="editor", invited_by=user_id))

    await db.commit()
    return {"success": True, "workspace_id": str(ws.id)}
