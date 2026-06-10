import base64
import mimetypes
from google.cloud import storage as gcs
from app.config import get_settings


def _client() -> gcs.Client:
    return gcs.Client(project=get_settings().google_cloud_project_id)


def upload_bytes(bucket_name: str, blob_path: str, data: bytes, content_type: str) -> str:
    client = _client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(blob_path)
    blob.upload_from_string(data, content_type=content_type)
    return f"https://storage.googleapis.com/{bucket_name}/{blob_path}"


def upload_base64(bucket_name: str, blob_path: str, b64: str, content_type: str) -> str:
    data = base64.b64decode(b64)
    return upload_bytes(bucket_name, blob_path, data, content_type)


_EXT_MAP = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
    "image/gif": ".gif",
}


def extension_for(content_type: str) -> str:
    if content_type in _EXT_MAP:
        return _EXT_MAP[content_type]
    ext = mimetypes.guess_extension(content_type)
    if ext == ".jpe":
        return ".jpg"
    return ext or ".bin"
