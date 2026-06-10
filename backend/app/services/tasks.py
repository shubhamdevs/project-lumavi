import json
import threading
import httpx
from google.cloud import tasks_v2
from google.protobuf import duration_pb2
from app.config import get_settings


def run_local_job(url: str, data: dict):
    try:
        response = httpx.post(url, json=data, timeout=1800.0)
        print(f"Local job status: {response.status_code}, response: {response.text}")
    except Exception as e:
        print(f"Local job request failed: {e}")


def enqueue_image_job(job_id: str, workspace_id: str, user_id: str, params: dict):
    settings = get_settings()
    payload_dict = {
        "job_id": job_id,
        "workspace_id": workspace_id,
        "user_id": user_id,
        "params": params,
    }

    # If running locally, execute the worker task in a background thread to simulate Cloud Tasks.
    # This prevents local runs from being blocked by real Cloud Tasks credential/network requirements.
    if "localhost" in settings.backend_url or "127.0.0.1" in settings.backend_url:
        thread = threading.Thread(
            target=run_local_job,
            args=(f"{settings.backend_url}/workers/image-job", payload_dict)
        )
        thread.daemon = True
        thread.start()
        return

    client = tasks_v2.CloudTasksClient()
    parent = client.queue_path(
        settings.google_cloud_project_id,
        settings.cloud_tasks_location,
        settings.cloud_tasks_queue,
    )
    payload = json.dumps(payload_dict).encode()

    task = {
        "http_request": {
            "http_method": tasks_v2.HttpMethod.POST,
            "url": f"{settings.backend_url}/workers/image-job",
            "headers": {"Content-Type": "application/json"},
            "body": payload,
        },
        "dispatch_deadline": duration_pb2.Duration(seconds=1800),
    }
    client.create_task(request={"parent": parent, "task": task})
