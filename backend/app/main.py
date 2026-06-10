from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.db.connection import init_db, close_db
from app.config import get_settings
from app.api import onboarding, brand, generate, jobs, dashboard, webhooks
from app.workers import image_worker
import traceback


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    await close_db()


app = FastAPI(title="Lumavi API", version="1.0.0", lifespan=lifespan)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    print("=== UNHANDLED EXCEPTION IN BACKEND ===")
    traceback.print_exc()
    print("=======================================")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "error": str(exc)},
    )


settings = get_settings()


allowed_origins = [origin.strip() for origin in settings.frontend_url.split(",") if origin.strip()]
if "http://localhost:3000" not in allowed_origins:
    allowed_origins.append("http://localhost:3000")
if "http://127.0.0.1:3000" not in allowed_origins:
    allowed_origins.append("http://127.0.0.1:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(onboarding.router)
app.include_router(brand.router)
app.include_router(generate.router)
app.include_router(jobs.router)
app.include_router(dashboard.router)
app.include_router(webhooks.router)
app.include_router(image_worker.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
