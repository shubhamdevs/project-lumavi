# Lumavi — Running the Application

## Prerequisites

- Node.js 22+
- Python 3.12+
- A Google Cloud service account key JSON at the repo root (`lumavi-set1-e0b876b2a63c.json`)
- `gcloud` CLI installed and authenticated (`gcloud auth login`)
- Docker Desktop (for containerized runs and Cloud Run deployment)

---

## Option A — Run Locally (Recommended for Development)

Run the backend and frontend as separate processes. Both connect to live Google Cloud infrastructure.

### 1. Backend

```bash
cd backend

# Create and activate a virtual environment (first time only)
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate

# Install dependencies (first time only)
pip install -r requirements.txt
pip install greenlet                # required by SQLAlchemy async

# Confirm .env is populated (copy from below if missing)
cat .env

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend is now running at **http://localhost:8000**
Interactive API docs at **http://localhost:8000/docs**

> **Mock mode**: `MOCK_GENERATION=true` in `backend/.env` means image generation returns
> placeholder SVGs instead of calling Vertex AI. Set to `false` for real generations.

### 2. Frontend

Open a second terminal:

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Start dev server
npm run dev
```

Frontend is now running at **http://localhost:3000**

---

## Option B — Run with Docker Compose

Requires Docker Desktop to be running.

```bash
# From the repo root
export NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

docker compose up --build
```

- Frontend: **http://localhost:3000**
- Backend: **http://localhost:8000**

To run in background:
```bash
docker compose up --build -d
docker compose logs -f          # stream logs
docker compose down             # stop
```

---

## Running Database Migrations

Migrations only need to be run once (or whenever a new migration is added to `backend/alembic/versions/`).

```bash
cd backend
source .venv/bin/activate

# Run all pending migrations
alembic upgrade head

# Check current revision
alembic current

# Create a new migration after changing models.py
alembic revision --autogenerate -m "describe your change"
```

---

## Deploying to Cloud Run

Requires Docker Desktop running and `gcloud` authenticated.

```bash
# From the repo root — export Clerk keys first
export NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
export CLERK_SECRET_KEY=sk_test_...
export CLERK_JWKS_URL=https://brave-pony-81.clerk.accounts.dev/.well-known/jwks.json

# Run the deploy script
./deploy.sh
```

The script will:
1. Create the Artifact Registry repo (if not exists)
2. Build and push the backend image
3. Deploy `lumavi-backend` to Cloud Run
4. Capture the backend URL
5. Build the frontend image with the backend URL baked in
6. Deploy `lumavi-frontend` to Cloud Run
7. Wire CORS between the two services

At the end you'll see both public URLs printed.

---

## Environment Files

### `backend/.env` (full template)

```env
GOOGLE_CLOUD_PROJECT_ID=lumavi-set1
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=/path/to/lumavi-set1-e0b876b2a63c.json

DB_INSTANCE_CONNECTION_NAME=lumavi-set1:us-central1:lumavi-db
DB_NAME=lumavi
DB_USER=lumavi_app
DB_PASSWORD=<your-db-password>

GCS_GENERATED_ASSETS_BUCKET=lumavi-generated-assets
GCS_BRAND_ASSETS_BUCKET=lumavi-brand-assets

CLOUD_TASKS_QUEUE=lumavi-jobs
CLOUD_TASKS_LOCATION=us-central1

CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=
CLERK_JWKS_URL=https://brave-pony-81.clerk.accounts.dev/.well-known/jwks.json

BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

MOCK_GENERATION=true
```

### `frontend/.env.local` (full template)

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

---

## Useful Commands

### Backend

```bash
# Check API is up
curl http://localhost:8000/

# View interactive docs
open http://localhost:8000/docs

# Run with auto-reload (dev)
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
# Dev server with hot reload
npm run dev

# Production build (verify before deploying)
npm run build

# Lint
npm run lint
```

### Database (via psql or Cloud SQL Studio)

```bash
# Connect via Cloud SQL Proxy (one-time local access)
cloud_sql_proxy lumavi-set1:us-central1:lumavi-db &
psql "host=127.0.0.1 user=lumavi_app dbname=lumavi"
```

### Cloud Run (after deploy)

```bash
# View backend logs
gcloud run services logs read lumavi-backend --region=us-central1 --project=lumavi-set1

# View frontend logs  
gcloud run services logs read lumavi-frontend --region=us-central1 --project=lumavi-set1

# Get service URLs
gcloud run services list --region=us-central1 --project=lumavi-set1
```

---

## Common Issues

**`DB_PASSWORD` not set** — Copy the password from Google Secret Manager:
```bash
gcloud secrets versions access latest --secret=lumavi-db-password --project=lumavi-set1
```

**`GOOGLE_APPLICATION_CREDENTIALS` path wrong** — Use the absolute path to the JSON key file at the repo root.

**Port already in use** — Kill the existing process:
```bash
lsof -ti:8000 | xargs kill    # backend
lsof -ti:3000 | xargs kill    # frontend
```

**`MOCK_GENERATION=true` but want real images** — Set `MOCK_GENERATION=false` in `backend/.env` and restart the backend. Ensure the service account has `roles/aiplatform.user`.

**SSE not receiving events** — The backend must be reachable at `NEXT_PUBLIC_BACKEND_URL`. Check CORS settings and that the backend is running.

---

*Last updated: 2026-06-10*
