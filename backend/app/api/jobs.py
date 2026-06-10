import asyncio
import uuid
import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.auth import get_current_user_id, get_current_user_id_sse
from app.db import connection
from app.db.connection import get_db
from app.db.models import GenerationJob

router = APIRouter(prefix="/jobs", tags=["jobs"])

_SSE_HEADERS = {
    "Cache-Control": "no-cache",
    "X-Accel-Buffering": "no",
    "Connection": "keep-alive",
    "Access-Control-Allow-Origin": "*",
}


@router.get("/{job_id}")
async def get_job(
    job_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    job = await db.get(GenerationJob, uuid.UUID(job_id))
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return {
        "id": str(job.id),
        "status": job.status,
        "output_url": job.output_url,
        "error_message": job.error_message,
        "model_used": job.model_used,
        "prompt_constructed": job.prompt_constructed,
    }


@router.get("/{job_id}/stream")
async def stream_job_status(
    job_id: str,
    user_id: str = Depends(get_current_user_id_sse),
):
    # Validate access with a short-lived session before opening the stream
    job_uuid = uuid.UUID(job_id)
    async with connection.AsyncSessionLocal() as db:
        job = await db.get(GenerationJob, job_uuid)
        if not job or job.user_id != user_id:
            raise HTTPException(status_code=404, detail="Job not found")

    async def event_generator():
        poll_interval = 2
        max_polls = 150  # 5 minutes max
        try:
            for _ in range(max_polls):
                # Fresh session per poll — avoids stale connection after asyncio.sleep
                async with connection.AsyncSessionLocal() as db:
                    result = await db.execute(
                        select(GenerationJob).where(GenerationJob.id == job_uuid)
                    )
                    job = result.scalar_one_or_none()

                if not job:
                    yield f"data: {json.dumps({'status': 'failed', 'error_message': 'Job not found'})}\n\n"
                    return

                yield f"data: {json.dumps({'status': job.status, 'output_url': job.output_url, 'error_message': job.error_message, 'prompt_constructed': job.prompt_constructed})}\n\n"

                if job.status in ("completed", "failed", "cancelled"):
                    return

                # Heartbeat comment keeps the connection alive through proxies
                await asyncio.sleep(poll_interval)
                yield ":keepalive\n\n"

        except asyncio.CancelledError:
            # Client disconnected cleanly
            return

    return StreamingResponse(event_generator(), media_type="text/event-stream", headers=_SSE_HEADERS)
