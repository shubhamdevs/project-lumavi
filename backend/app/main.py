from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.db.connection import init_db, close_db
from app.config import get_settings
from app.api import onboarding, brand, generate, jobs, dashboard, webhooks
from app.workers import image_worker


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    await close_db()


app = FastAPI(title="Lumavi API", version="1.0.0", lifespan=lifespan)

settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000"],
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
