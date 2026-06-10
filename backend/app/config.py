from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Google Cloud
    google_cloud_project_id: str = "lumavi-set1"
    google_cloud_location: str = "us-central1"
    google_application_credentials: str = ""

    # Cloud SQL
    db_instance_connection_name: str = "lumavi-set1:us-central1:lumavi-db"
    db_name: str = "lumavi"
    db_user: str = "lumavi_app"
    db_password: str = ""

    # Cloud Storage
    gcs_generated_assets_bucket: str = "lumavi-generated-assets"
    gcs_brand_assets_bucket: str = "lumavi-brand-assets"

    # Cloud Tasks
    cloud_tasks_queue: str = "lumavi-jobs"
    cloud_tasks_location: str = "us-central1"

    # Clerk
    clerk_secret_key: str = ""
    clerk_webhook_secret: str = ""
    clerk_jwks_url: str = "https://api.clerk.dev/v1/jwks"

    # App
    backend_url: str = "http://localhost:8000"
    frontend_url: str = "http://localhost:3000"
    mock_generation: bool = False

    def __init__(self, **values):
        super().__init__(**values)
        if self.google_application_credentials:
            import os
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = self.google_application_credentials

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    return Settings()
