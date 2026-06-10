# Lumavi — Architecture

## Overview

Lumavi is an AI-powered brand content platform. It lets teams generate on-brand images using their brand guidelines. The system is a **monorepo** with two independently deployable services, both containerized and running on Google Cloud.

```
project-lumavi/
├── frontend/          # Next.js 16 (App Router) — UI layer
├── backend/           # Python FastAPI — all business logic
├── docker-compose.yml # Local full-stack dev
└── deploy.sh          # Cloud Run deployment script
```

---

## Services

### Frontend — Next.js 16

- **Framework**: Next.js 16 with App Router (`output: 'standalone'` for Docker)
- **Auth**: Clerk (hosted UI components — `<SignIn />`, `<SignUp />`)
- **Role**: Pure UI layer. All data operations go through the FastAPI backend via HTTP.
- **API client**: `frontend/src/lib/api.ts` — typed fetch wrapper pointing to `BACKEND_URL`
- **Real-time updates**: `EventSource` (SSE) connecting to `GET /jobs/{job_id}/stream` on the backend
- **Containerized**: Multi-stage Dockerfile (deps → builder → runner with standalone output)

### Backend — Python FastAPI

- **Framework**: FastAPI 0.115 with async/await throughout
- **Auth**: Clerk JWT verification via JWKS (`python-jose`). Every protected route uses `Depends(get_current_user_id)`.
- **Database ORM**: SQLAlchemy 2.0 async + `asyncpg`
- **Config**: Pydantic Settings reading from `.env`
- **Containerized**: Single-stage `python:3.12-slim` Dockerfile, Uvicorn server

---

## Google Cloud Infrastructure

| Service | Purpose | Resource name |
|---|---|---|
| **Cloud SQL** (PostgreSQL 16) | Primary database | `lumavi-db` (instance), `lumavi` (DB) |
| **Cloud Storage** | Asset storage | `lumavi-generated-assets`, `lumavi-brand-assets` |
| **Cloud Tasks** | Async image job queue | `lumavi-jobs` (queue) |
| **Cloud Run** | Container hosting | `lumavi-backend`, `lumavi-frontend` |
| **Artifact Registry** | Docker image registry | `lumavi` repo in `us-central1` |
| **Secret Manager** | Sensitive secrets | `lumavi-db-password` |
| **Vertex AI** | Image & brand AI | Imagen 4, Gemini 2.0 Flash |

- **Project ID**: `lumavi-set1`
- **Region**: `us-central1`
- **Service Account**: `lumavi-app@lumavi-set1.iam.gserviceaccount.com`
  - Roles: `roles/aiplatform.user`, `roles/cloudsql.client`, `roles/storage.objectAdmin`, `roles/cloudtasks.enqueuer`, `roles/secretmanager.secretAccessor`

---

## Database Schema

11 tables on Cloud SQL PostgreSQL 16. Migrations managed by Alembic (`backend/alembic/`).

```
users               — Synced from Clerk via webhook (user_id = Clerk sub)
organizations       — Top-level billing + plan entity
workspaces          — Work environment inside an org
workspace_members   — Many-to-many users ↔ workspaces (with status + role)
invitations         — Pending email invitations to a workspace
brand_guidelines    — All brand config per workspace (colors, tone, typography, etc.)
generation_jobs     — Image generation job lifecycle (pending → processing → completed/failed)
assets              — Generated/uploaded files with GCS URLs
credit_ledger       — Append-only credit transaction log per workspace
workspace_credit_balances — Materialized credit balance view
workspace_api_keys  — Future API key support
```

All primary keys are UUIDs. JSONB columns used for flexible structured fields (`colors`, `typography`, `tone`, `logos`, `brand_keywords`).

---

## Authentication Flow

```
User (browser)
  │
  ├─ Clerk hosted UI → issues JWT (RS256)
  │
  ├─ Frontend: useAuth().getToken() → attaches Bearer token to all API calls
  │
  └─ Backend: get_current_user_id() dependency
       ├─ Fetches JWKS from Clerk (cached in memory)
       ├─ Decodes + verifies JWT signature
       └─ Returns user_id (Clerk `sub` claim)
```

For SSE endpoints (`EventSource` cannot set headers): token is passed as `?_token=` query param and handled by a separate `get_current_user_id_sse` dependency.

Clerk webhooks (`POST /webhooks/clerk`) create `User` rows in Cloud SQL on `user.created` events, verified via Svix.

---

## Image Generation Flow

```
1. User submits prompt + settings
   └─ POST /generate/image  →  backend

2. Backend reserves credits, creates GenerationJob (status: pending)
   └─ Returns job_id to frontend immediately

3. Backend enqueues Cloud Tasks HTTP task
   └─ Target: POST /workers/image-job  (on the backend itself)

4. Cloud Tasks delivers the task to the worker
   └─ Worker calls Vertex AI Imagen 4
   └─ Uploads result to GCS (lumavi-generated-assets)
   └─ Creates Asset row, updates CreditLedger
   └─ Sets GenerationJob status → completed (or failed)

5. Frontend polls via SSE
   └─ GET /jobs/{job_id}/stream  (EventSource)
   └─ Backend polls DB every 2s and streams status events
   └─ On "completed": frontend renders the GCS image URL
```

**Models used:**
- Standard quality: `imagen-4.0-fast-generate-001`
- High quality: `imagen-4.0-ultra-generate-001`

**Credit costs:** Standard = 3 credits, High = 6 credits. Variations = 4 credits (4 concurrent standard jobs).

---

## Brand Intelligence Flow

```
1. User uploads logo (PNG/SVG/JPEG, max 2MB)
   └─ POST /brand/upload-logo
   └─ Stores in GCS (lumavi-brand-assets)
   └─ Updates brand_guidelines.logos JSONB

2. Backend calls Vertex AI Gemini 2.0 Flash (via REST + service account Bearer token)
   └─ POST /brand/analyze-logo
   └─ Extracts: colorMood, photographyStyle, brandIsNot, brandPersonality, typographyFeel

3. Extracted signals pre-fill the Brand Hub form
   └─ User reviews and saves each section via PATCH /brand/section

4. On image generation, backend constructs an enriched prompt:
   └─ User prompt + brand.photography_style + brand.color_mood + brand.tone + brand.brand_is_not
```

---

## API Routes (Backend)

| Method | Path | Description |
|---|---|---|
| GET | `/onboarding/workspace` | Get user's active workspace_id |
| POST | `/onboarding/complete` | Create org + workspace + brand + send invites |
| GET | `/brand/{workspace_id}` | Get full brand guidelines |
| PATCH | `/brand/section` | Save a brand section |
| POST | `/brand/upload-logo` | Upload logo to GCS, update brand |
| POST | `/brand/analyze-logo` | Extract brand signals via Gemini |
| POST | `/generate/image` | Queue an image generation job |
| POST | `/generate/image/variations` | Queue 4 variation jobs concurrently |
| GET | `/jobs/{job_id}` | Get job status + output URL |
| GET | `/jobs/{job_id}/stream` | SSE stream of job status updates |
| GET | `/dashboard/{workspace_id}/summary` | Credits, stats, recent assets |
| POST | `/dashboard/{workspace_id}/top-up-credits` | Add 100 credits |
| POST | `/webhooks/clerk` | Clerk webhook receiver (Svix verified) |
| POST | `/workers/image-job` | Internal Cloud Tasks worker endpoint |

---

## Frontend Pages

| Route | Description |
|---|---|
| `/` | Landing / redirect to dashboard if signed in |
| `/login`, `/register` | Clerk hosted auth pages |
| `/onboarding` | 5-step wizard (org → workspace → brand → invite → preview) |
| `/dashboard` | Overview: credits, brand completeness, recent assets |
| `/brand` | Brand Intelligence Hub (visual, voice, audience, typography) |
| `/generate/image` | Image generator with live SSE progress |

---

## Local Development

Both services connect to live Google Cloud infrastructure (Cloud SQL, GCS, Vertex AI) using the service account key at `lumavi-set1-e0b876b2a63c.json`.

- Backend: reads `backend/.env`, starts Uvicorn on `:8000`
- Frontend: reads `frontend/.env.local`, starts Next.js on `:3000`
- `MOCK_GENERATION=true` in `backend/.env` — skips real Vertex AI calls and returns placeholder images

See `runner.md` for step-by-step commands.

---

## Production & Staging Deployment

The services deploy autonomously to Google Cloud Run via GitHub Actions, or can be triggered manually using `deploy.sh`.

### 1. Environments & Automated CI/CD
Environments are mapped directly to git branches:
*   **Staging Environment** (`staging` branch): Deploys services `lumavi-backend-staging` and `lumavi-frontend-staging`.
*   **Production Environment** (`main` branch): Deploys services `lumavi-backend-prod` and `lumavi-frontend-prod` (connected to custom domain `https://lumavi.techtovium.ai`).

The GitHub Actions pipeline (`.github/workflows/deploy.yml`) is triggered on pushes to either branch and performs the deployment using a service account credentials JSON.

### 2. Deployment Sequence (`deploy.sh`)
When running `deploy.sh [staging|prod]`:
1.  Backend container built and pushed to Artifact Registry (`backend-staging` or `backend-prod`).
2.  Backend service deployed to Cloud Run, automatically capturing the backend service URL.
3.  Frontend container built with the backend URL baked in at build time (`NEXT_PUBLIC_BACKEND_URL`).
4.  Frontend service deployed to Cloud Run, capturing the frontend service URL.
5.  Backend service updated via `gcloud` to inject `FRONTEND_URL` for CORS.

> [!IMPORTANT]
> **CORS Delimiter Handling:** To support multiple allowed origins in production (e.g. both the raw Cloud Run URL and the custom domain `lumavi.techtovium.ai`), `deploy.sh` passes a comma-separated list of origins. Because `gcloud` splits arguments at commas by default, it uses the custom delimiter syntax `^|^FRONTEND_URL=${ALLOWED_ORIGINS}` to avoid syntax errors.

Cloud SQL connection on Cloud Run uses the Cloud SQL Python Connector with `IPTypes.PUBLIC` — the connector handles encrypted IAM-authenticated tunneling automatically without needing `--add-cloudsql-instances`.

---

## Environment Variables

### `backend/.env`

| Variable | Description |
|---|---|
| `GOOGLE_CLOUD_PROJECT_ID` | GCP project (`lumavi-set1`) |
| `GOOGLE_CLOUD_LOCATION` | Region (`us-central1`) |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to service account JSON key |
| `DB_INSTANCE_CONNECTION_NAME` | Cloud SQL connection name |
| `DB_NAME` | Database name (`lumavi`) |
| `DB_USER` | DB user (`lumavi_app`) |
| `DB_PASSWORD` | DB password (from Secret Manager in prod) |
| `GCS_GENERATED_ASSETS_BUCKET` | `lumavi-generated-assets` |
| `GCS_BRAND_ASSETS_BUCKET` | `lumavi-brand-assets` |
| `CLOUD_TASKS_QUEUE` | `lumavi-jobs` |
| `CLOUD_TASKS_LOCATION` | `us-central1` |
| `CLERK_SECRET_KEY` | Clerk backend secret key |
| `CLERK_WEBHOOK_SECRET` | Svix webhook signing secret |
| `CLERK_JWKS_URL` | Clerk JWKS endpoint for JWT verification |
| `BACKEND_URL` | This service's own URL (for Cloud Tasks targets) |
| `FRONTEND_URL` | Frontend URL (for CORS) |
| `MOCK_GENERATION` | `true` = skip Vertex AI, return placeholder |

### `frontend/.env.local`

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key (server-side) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/login` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/register` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/onboarding` |
| `BACKEND_URL` | Backend URL for server-side fetches |
| `NEXT_PUBLIC_BACKEND_URL` | Backend URL for client-side fetches |

---

*Last updated: 2026-06-10*
