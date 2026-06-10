import uuid
from fastapi import APIRouter, Request, HTTPException
from sqlalchemy import select
from app.db import connection
from app.db.models import GenerationJob, Asset, Organization, Workspace, CreditLedger
from app.services.image_generation import generate_image
from app.services.storage import upload_base64, extension_for
from app.config import get_settings

router = APIRouter(prefix="/workers", tags=["workers"])


async def _get_org_for_workspace(db, workspace_id: uuid.UUID):
    result = await db.execute(
        select(Organization)
        .join(Workspace, Organization.id == Workspace.org_id)
        .where(Workspace.id == workspace_id)
    )
    return result.scalar_one_or_none()


@router.post("/image-job")
async def process_image_job(request: Request):
    data = await request.json()
    job_id = data["job_id"]
    workspace_id = data["workspace_id"]
    user_id = data["user_id"]
    params = data["params"]
    cost = params.get("credit_cost", 3)

    async with connection.AsyncSessionLocal() as db:
        job = await db.get(GenerationJob, uuid.UUID(job_id))
        if not job or job.status != "pending":
            return {"ok": True, "skipped": True}

        job.status = "processing"
        await db.commit()

        try:
            result = await generate_image(
                user_prompt=params["prompt"],
                brand=params.get("brand", {}),
                aspect_ratio=params.get("aspect_ratio", "1:1"),
                quality=params.get("quality", "standard"),
            )
            if not result["success"]:
                raise RuntimeError(result.get("error", "Generation failed"))

            settings = get_settings()
            ext = extension_for(result["mime_type"])
            blob_path = f"{workspace_id}/{job_id}/output{ext}"
            output_url = upload_base64(
                settings.gcs_generated_assets_bucket,
                blob_path,
                result["image_base64"],
                result["mime_type"],
            )

            ws_uuid = uuid.UUID(workspace_id)
            db.add(Asset(
                workspace_id=ws_uuid,
                user_id=user_id,
                job_id=uuid.UUID(job_id),
                type="image",
                name="Generated image",
                url=output_url,
            ))

            org = await _get_org_for_workspace(db, ws_uuid)
            if org:
                db.add(CreditLedger(
                    org_id=org.id,
                    workspace_id=ws_uuid,
                    user_id=user_id,
                    action_type="image_generation",
                    credits_amount=-cost,
                    balance_after=org.credit_pool,
                    reference_id=job_id,
                ))

            job.status = "completed"
            job.output_url = output_url
            job.model_used = result.get("model_used")
            job.prompt_constructed = result.get("constructed_prompt")
            job.credits_cost = cost
            await db.commit()

        except Exception as e:
            job.status = "failed"
            job.error_message = str(e)
            org = await _get_org_for_workspace(db, uuid.UUID(workspace_id))
            if org:
                org.credit_pool += job.credits_reserved
            await db.commit()
            raise HTTPException(status_code=500, detail=str(e))

    return {"ok": True}
