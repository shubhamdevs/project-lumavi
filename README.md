# Lumavi — AI-Powered Brand Content Platform

Lumavi is an AI-powered brand content platform that enables teams to generate on-brand images aligned with their specific brand guidelines. The system is designed as a monorepo containing two independently deployable services, both containerized and hosted on Google Cloud.

## Table of Contents
1. [Project Structure](#project-structure)
2. [Architecture Overview](#architecture-overview)
3. [Local Development](#local-development)
   - [Option A: Run Locally (Recommended)](#option-a-run-locally-recommended)
   - [Option B: Run with Docker Compose](#option-b-run-with-docker-compose)
4. [Database Migrations](#database-migrations)
5. [CI/CD & Deployment](#cicd--deployment)
   - [Branch Management & Environments](#branch-management--environments)
   - [Manual Deployment Script](#manual-deployment-script)
6. [Environment Variables](#environment-variables)
7. [Troubleshooting & Common Issues](#troubleshooting--common-issues)

---

## Project Structure

```text
project-lumavi/
├── frontend/          # Next.js (App Router) — UI layer
├── backend/           # Python FastAPI — Business logic & API
├── .github/           # GitHub Actions workflow configurations
├── docker-compose.yml # Docker compose for local multi-service running
└── deploy.sh          # Manual deployment & initialization script
```

---

## Architecture Overview

### Frontend (Next.js)
*   **Framework**: Next.js (App Router) using standalone output mode (`output: 'standalone'`).
*   **Authentication**: Clerk Hosted UI components (`<SignIn />`, `<SignUp />`).
*   **API Layer**: Typed client wrapper pointing to the backend API (`BACKEND_URL`).
*   **Real-time Progress**: Server-Sent Events (`EventSource`) to receive live image generation status updates.

### Backend (FastAPI)
*   **Framework**: FastAPI with async/await database operations.
*   **Authentication**: Clerk JWT verification via JWKS (`python-jose`).
*   **Database ORM**: SQLAlchemy 2.0 (async) + `asyncpg`.
*   **Background Jobs**: Google Cloud Tasks for queueing async image generation tasks.
*   **AI Integration**: Vertex AI Imagen 4 (image generation) and Gemini 2.0 Flash (brand asset signal extraction).

### Infrastructure (Google Cloud)
*   **Cloud SQL (PostgreSQL 16)**: Primary relational database (`lumavi-db`).
*   **Cloud Storage**: Buckets for brand assets (`lumavi-brand-assets`) and generated files (`lumavi-generated-assets`).
*   **Cloud Tasks**: Task queue (`lumavi-jobs`) for processing generation jobs asynchronously.
*   **Artifact Registry**: Docker registry (`lumavi` repo) for versioned containers.
*   **Secret Manager**: Hosting DB passwords (`lumavi-db-password`).

---

## Local Development

### Option A: Run Locally (Recommended)

Run the backend and frontend in separate terminals. Both connect to live Google Cloud infrastructure using your local GCP credentials.

#### 1. Prerequisites
*   Node.js 22+
*   Python 3.12+
*   GCP service account JSON key file saved as `lumavi-set1-e0b876b2a63c.json` at the root of the project.
*   `gcloud` CLI installed and authenticated (`gcloud auth login`).

#### 2. Start Backend
Ensure your `backend/.env` is populated with correct parameters (refer to the [Environment Variables](#environment-variables) section below for templates).

```bash
cd backend

# Set up virtual environment
python -m venv .venv
source .venv/bin/activate          # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install greenlet                # Required for async SQLAlchemy

# Start dev server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
*   Backend is running at [http://localhost:8000](http://localhost:8000)
*   Interactive API docs are available at [http://localhost:8000/docs](http://localhost:8000/docs)

#### 3. Start Frontend
Ensure your `frontend/.env.local` is populated with Clerk publishable keys and API urls.

```bash
cd frontend

# Install packages
npm install

# Start Next.js development server
npm run dev
```
*   Frontend is running at [http://localhost:3000](http://localhost:3000)

---

### Option B: Run with Docker Compose

Ensure Docker Desktop is running locally.

```bash
# Set Clerk Publishable Key in your terminal shell
export NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# Start containers
docker compose up --build
```
*   Frontend: [http://localhost:3000](http://localhost:3000)
*   Backend: [http://localhost:8000](http://localhost:8000)

---

## Useful Development Commands

### Backend Verification & Dev Tools
*   **Health Check**:
    ```bash
    curl http://localhost:8000/
    ```
*   **Interactive API documentation**: Open [http://localhost:8000/docs](http://localhost:8000/docs) in your browser.
*   **Run with auto-reload (manual)**:
    ```bash
    uvicorn app.main:app --reload --port 8000
    ```

### Frontend Validation & Linting
*   **Build check** (verify production bundle compilation before deploying):
    ```bash
    npm run build
    ```
*   **Code Linting**:
    ```bash
    npm run lint
    ```

### Connecting directly to Cloud SQL Database
To run a temporary local SQL terminal connecting directly to Cloud SQL using the Cloud SQL proxy:
```bash
# Start SQL proxy in background
cloud_sql_proxy lumavi-set1:us-central1:lumavi-db &

# Connect via psql
psql "host=127.0.0.1 user=lumavi_app dbname=lumavi"
```

---

## Database Migrations

Database migrations are managed using Alembic. Run migrations from the `backend/` directory with the virtual environment activated:

```bash
cd backend
source .venv/bin/activate

# Apply all pending migrations to Cloud SQL
alembic upgrade head

# Check current migration revision
alembic current

# Generate a new migration after modifying models in models.py
alembic revision --autogenerate -m "description of change"
```

---

## CI/CD & Deployment

### Branch Management & Environments

The CI/CD pipeline is configured via GitHub Actions under `.github/workflows/deploy.yml` and targets two environments automatically:

1.  **Staging Environment**
    *   **Trigger**: Push or Merge to the `staging` branch.
    *   **Frontend URL**: [https://lumavi-frontend-staging-fbu6rutbja-uc.a.run.app](https://lumavi-frontend-staging-fbu6rutbja-uc.a.run.app)
    *   **Backend URL**: [https://lumavi-backend-staging-fbu6rutbja-uc.a.run.app](https://lumavi-backend-staging-fbu6rutbja-uc.a.run.app)

2.  **Production Environment**
    *   **Trigger**: Push or Merge to the `main` branch.
    *   **Custom Domain**: [https://lumavi.techtovium.ai](https://lumavi.techtovium.ai)
    *   **Frontend (Direct)**: [https://lumavi-frontend-prod-fbu6rutbja-uc.a.run.app](https://lumavi-frontend-prod-fbu6rutbja-uc.a.run.app)
    *   **Backend**: [https://lumavi-backend-prod-fbu6rutbja-uc.a.run.app](https://lumavi-backend-prod-fbu6rutbja-uc.a.run.app)

### Manual Deployment Script

To deploy manually, execute `deploy.sh` passing either `staging` or `prod` as the environment target:

```bash
# Make deploy.sh executable
chmod +x deploy.sh

# Deploy to staging
./deploy.sh staging

# Deploy to production
./deploy.sh prod
```

---

## Environment Variables

### Backend Environment Configuration (`backend/.env`)
*   `GOOGLE_CLOUD_PROJECT_ID`: GCP Project ID (`lumavi-set1`).
*   `GOOGLE_CLOUD_LOCATION`: Region (`us-central1`).
*   `GOOGLE_APPLICATION_CREDENTIALS`: Path to your service account credentials file.
*   `DB_INSTANCE_CONNECTION_NAME`: Cloud SQL Connection Name (`lumavi-set1:us-central1:lumavi-db`).
*   `DB_NAME`: Database Name (`lumavi`).
*   `DB_USER`: Database User (`lumavi_app`).
*   `DB_PASSWORD`: Database Password (retrieved from Secret Manager in deployed environments).
*   `GCS_GENERATED_ASSETS_BUCKET`: Google Cloud Storage Bucket for generated images.
*   `GCS_BRAND_ASSETS_BUCKET`: Google Cloud Storage Bucket for uploaded brand logos.
*   `CLOUD_TASKS_QUEUE`: Task queue name (`lumavi-jobs`).
*   `CLERK_SECRET_KEY`: Clerk secret key (server-side).
*   `CLERK_JWKS_URL`: Clerk JWKS url for JWT authorization.
*   `MOCK_GENERATION`: Set to `true` to skip Vertex AI generation calls and return mock SVG images locally.

### Frontend Environment Configuration (`frontend/.env.local`)
*   `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk publishable key.
*   `CLERK_SECRET_KEY`: Clerk secret key.
*   `BACKEND_URL`: Internal URL for server-side fetches.
*   `NEXT_PUBLIC_BACKEND_URL`: Public URL for client-side API fetches and Server-Sent Events.

---

## Troubleshooting & Common Issues

*   **Database Credentials**: If local DB password is not set or needs rotation, fetch the latest secret version via:
    ```bash
    gcloud secrets versions access latest --secret=lumavi-db-password --project=lumavi-set1
    ```
*   **Port Collision**: If port `8000` or `3000` is already bound:
    ```bash
    lsof -ti:8000 | xargs kill    # Kill backend
    lsof -ti:3000 | xargs kill    # Kill frontend
    ```
*   **Mock Generation**: If image generator produces generic mock graphics instead of Vertex AI generations, verify that `MOCK_GENERATION` is set to `false` in `backend/.env`.
