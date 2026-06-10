#!/usr/bin/env bash
# deploy.sh — Build, push, and deploy both services to Cloud Run
set -euo pipefail

ENV=${1:-}

if [ "$ENV" != "staging" ] && [ "$ENV" != "prod" ]; then
    echo "Usage: ./deploy.sh [staging|prod]"
    exit 1
fi

# ── Config ────────────────────────────────────────────────────────────────────
PROJECT_ID="lumavi-set1"
REGION="us-central1"
REGISTRY="${REGION}-docker.pkg.dev/${PROJECT_ID}/lumavi"
SA_EMAIL="lumavi-app@${PROJECT_ID}.iam.gserviceaccount.com"
CLOUD_SQL_INSTANCE="${PROJECT_ID}:${REGION}:lumavi-db"

BACKEND_IMAGE="${REGISTRY}/backend-${ENV}"
FRONTEND_IMAGE="${REGISTRY}/frontend-${ENV}"

BACKEND_SERVICE="lumavi-backend-${ENV}"
FRONTEND_SERVICE="lumavi-frontend-${ENV}"

# Clerk keys (set these or export them before running)
CLERK_PUBLISHABLE_KEY="${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:-pk_test_YOUR_KEY}"
CLERK_SECRET_KEY="${CLERK_SECRET_KEY:-sk_test_YOUR_KEY}"
CLERK_JWKS_URL="${CLERK_JWKS_URL:-https://brave-pony-81.clerk.accounts.dev/.well-known/jwks.json}"

echo "==> Authenticating with gcloud..."
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

echo "==> Ensuring Artifact Registry repo exists..."
gcloud artifacts repositories describe lumavi \
  --project="${PROJECT_ID}" \
  --location="${REGION}" 2>/dev/null || \
gcloud artifacts repositories create lumavi \
  --repository-format=docker \
  --location="${REGION}" \
  --project="${PROJECT_ID}" \
  --description="Lumavi container images" || echo "Warning: Could not verify registry creation. Assuming it exists."

# ── Backend ───────────────────────────────────────────────────────────────────
echo "==> Building backend image..."
docker build -t "${BACKEND_IMAGE}:latest" ./backend

echo "==> Pushing backend image..."
docker push "${BACKEND_IMAGE}:latest"

echo "==> Deploying backend to Cloud Run..."
gcloud run deploy "${BACKEND_SERVICE}" \
  --image="${BACKEND_IMAGE}:latest" \
  --platform=managed \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --service-account="${SA_EMAIL}" \
  --add-cloudsql-instances="${CLOUD_SQL_INSTANCE}" \
  --allow-unauthenticated \
  --port=8000 \
  --min-instances=0 \
  --max-instances=5 \
  --memory=512Mi \
  --cpu=1 \
  --set-env-vars="GOOGLE_CLOUD_PROJECT_ID=${PROJECT_ID}" \
  --set-env-vars="GOOGLE_CLOUD_LOCATION=${REGION}" \
  --set-env-vars="DB_INSTANCE_CONNECTION_NAME=${CLOUD_SQL_INSTANCE}" \
  --set-env-vars="DB_NAME=lumavi" \
  --set-env-vars="DB_USER=lumavi_app" \
  --set-env-vars="GCS_GENERATED_ASSETS_BUCKET=lumavi-generated-assets" \
  --set-env-vars="GCS_BRAND_ASSETS_BUCKET=lumavi-brand-assets" \
  --set-env-vars="CLOUD_TASKS_QUEUE=lumavi-jobs" \
  --set-env-vars="CLOUD_TASKS_LOCATION=${REGION}" \
  --set-env-vars="CLERK_JWKS_URL=${CLERK_JWKS_URL}" \
  --set-env-vars="CLERK_SECRET_KEY=${CLERK_SECRET_KEY}" \
  --set-env-vars="MOCK_GENERATION=false" \
  --set-secrets="DB_PASSWORD=lumavi-db-password:latest"

# Capture the backend URL
BACKEND_URL=$(gcloud run services describe "${BACKEND_SERVICE}" \
  --platform=managed \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --format="value(status.url)")

echo "==> Backend deployed at: ${BACKEND_URL}"

# Update backend with its own URL for Cloud Tasks HTTP targets
gcloud run services update "${BACKEND_SERVICE}" \
  --platform=managed \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --set-env-vars="BACKEND_URL=${BACKEND_URL}"

# ── Frontend ──────────────────────────────────────────────────────────────────
echo "==> Building frontend image (with backend URL baked in)..."
docker build \
  --build-arg "NEXT_PUBLIC_BACKEND_URL=${BACKEND_URL}" \
  --build-arg "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${CLERK_PUBLISHABLE_KEY}" \
  --build-arg "NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login" \
  --build-arg "NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register" \
  --build-arg "NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard" \
  --build-arg "NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding" \
  -t "${FRONTEND_IMAGE}:latest" \
  ./frontend

echo "==> Pushing frontend image..."
docker push "${FRONTEND_IMAGE}:latest"

echo "==> Deploying frontend to Cloud Run..."
gcloud run deploy "${FRONTEND_SERVICE}" \
  --image="${FRONTEND_IMAGE}:latest" \
  --platform=managed \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --service-account="${SA_EMAIL}" \
  --allow-unauthenticated \
  --port=3000 \
  --min-instances=0 \
  --max-instances=5 \
  --memory=512Mi \
  --cpu=1 \
  --set-env-vars="NODE_ENV=production" \
  --set-env-vars="BACKEND_URL=${BACKEND_URL}" \
  --set-env-vars="NEXT_PUBLIC_BACKEND_URL=${BACKEND_URL}" \
  --set-env-vars="NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${CLERK_PUBLISHABLE_KEY}" \
  --set-env-vars="CLERK_SECRET_KEY=${CLERK_SECRET_KEY}" \
  --set-env-vars="NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login" \
  --set-env-vars="NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register" \
  --set-env-vars="NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard" \
  --set-env-vars="NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding"

FRONTEND_URL=$(gcloud run services describe "${FRONTEND_SERVICE}" \
  --platform=managed \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --format="value(status.url)")

# Tell backend about its frontend origin (CORS)
if [ "$ENV" == "prod" ]; then
  ALLOWED_ORIGINS="${FRONTEND_URL},https://lumavi.techtovium.ai"
else
  ALLOWED_ORIGINS="${FRONTEND_URL}"
fi

gcloud run services update "${BACKEND_SERVICE}" \
  --platform=managed \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --set-env-vars="FRONTEND_URL=${ALLOWED_ORIGINS}"

echo ""
echo "============================================================"
echo " Deployment complete! [Environment: ${ENV}]"
echo "  Frontend: ${FRONTEND_URL}"
echo "  Backend:  ${BACKEND_URL}"
if [ "$ENV" == "prod" ]; then
  echo "  Custom Domain: https://lumavi.techtovium.ai"
fi
echo "============================================================"
