import base64
from google.cloud import aiplatform
from google.cloud.aiplatform.gapic import PredictionServiceClient
from google.protobuf import json_format
from google.protobuf.struct_pb2 import Value
from app.config import get_settings


def _build_prompt(user_prompt: str, brand: dict) -> str:
    parts = [user_prompt]
    colors = brand.get("colors", {})
    if colors.get("primary"):
        parts.append(f"Primary color: {colors['primary']}")
    tone = brand.get("tone", {})
    if tone.get("archetype"):
        parts.append(f"Brand tone: {tone['archetype']}")
    if brand.get("photography_style"):
        parts.append(f"Photography style: {brand['photography_style']}")
    if brand.get("lighting"):
        parts.append(f"Lighting: {brand['lighting']}")
    if brand.get("composition"):
        parts.append(f"Composition: {brand['composition']}")
    if brand.get("brand_is_not"):
        parts.append(f"Avoid: {brand['brand_is_not']}")
    return ". ".join(parts)


async def generate_image(
    user_prompt: str,
    brand: dict,
    aspect_ratio: str,
    quality: str,
) -> dict:
    settings = get_settings()

    if settings.mock_generation:
        import asyncio
        await asyncio.sleep(1)
        svg = f'<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#888">Mock • {aspect_ratio}</text></svg>'
        return {
            "success": True,
            "image_base64": base64.b64encode(svg.encode()).decode(),
            "mime_type": "image/svg+xml",
            "model_used": "mock",
            "constructed_prompt": _build_prompt(user_prompt, brand),
        }

    model_id = (
        "imagen-4.0-ultra-generate-001" if quality == "high"
        else "imagen-4.0-fast-generate-001"
    )
    endpoint = (
        f"projects/{settings.google_cloud_project_id}"
        f"/locations/{settings.google_cloud_location}"
        f"/publishers/google/models/{model_id}"
    )
    constructed_prompt = _build_prompt(user_prompt, brand)

    client = PredictionServiceClient(
        client_options={"api_endpoint": f"{settings.google_cloud_location}-aiplatform.googleapis.com"}
    )
    instance = json_format.ParseDict({"prompt": constructed_prompt}, Value())
    parameters = json_format.ParseDict(
        {"sampleCount": 1, "aspectRatio": aspect_ratio, "safetySetting": "block_some", "addWatermark": False},
        Value(),
    )

    # client.predict is synchronous — run in thread to avoid blocking the event loop
    import asyncio
    response = await asyncio.to_thread(
        client.predict, endpoint=endpoint, instances=[instance], parameters=parameters
    )
    if not response.predictions:
        return {"success": False, "error": "No predictions returned"}

    pred_obj = response.predictions[0]
    if hasattr(pred_obj, "to_dict"):
        prediction = pred_obj.to_dict()
    elif isinstance(pred_obj, dict):
        prediction = pred_obj
    else:
        try:
            prediction = dict(pred_obj)
        except Exception:
            prediction = json_format.MessageToDict(pred_obj)

    return {
        "success": True,
        "image_base64": prediction.get("bytesBase64Encoded", ""),
        "mime_type": "image/png",
        "model_used": model_id,
        "constructed_prompt": constructed_prompt,
    }
