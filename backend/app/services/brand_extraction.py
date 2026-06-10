import json
import httpx
from google.auth import default as google_auth_default
from google.auth.transport.requests import Request
from app.config import get_settings


def _get_access_token() -> str:
    creds, _ = google_auth_default(scopes=["https://www.googleapis.com/auth/cloud-platform"])
    creds.refresh(Request())
    return creds.token


async def extract_brand_from_logo(logo_base64: str, mime_type: str) -> dict:
    settings = get_settings()

    if settings.mock_generation:
        return {
            "colorMood": "clean and professional with neutral tones",
            "styleDescriptors": ["minimal", "modern", "trustworthy"],
            "formality": "semi-formal",
            "brandPersonality": "A confident, approachable brand that values clarity",
            "photographyStyle": "Editorial",
            "brandIsNot": "corporate, cluttered, aggressive",
            "typographyFeel": "clean geometric sans-serif",
        }

    token = _get_access_token()
    location = settings.google_cloud_location
    project = settings.google_cloud_project_id
    endpoint = (
        f"https://{location}-aiplatform.googleapis.com/v1/projects/{project}"
        f"/locations/{location}/publishers/google/models/gemini-2.0-flash:generateContent"
    )
    prompt = """Analyze this brand logo carefully and return ONLY a valid JSON object with no explanation, no markdown, no code blocks.
Return exactly this structure:
{"colorMood":"describe the color palette feeling in 6-10 words","styleDescriptors":["word1","word2","word3"],"formality":"formal OR semi-formal OR casual","brandPersonality":"one sentence describing the brand feel","photographyStyle":"Editorial OR Lifestyle OR Product OR Abstract OR Illustrated OR Mixed","brandIsNot":"3 comma-separated things this brand visually avoids","typographyFeel":"describe implied typography style in 5-8 words"}"""

    payload = {
        "contents": [{
            "role": "user",
            "parts": [
                {"text": prompt},
                {"inlineData": {"mimeType": mime_type, "data": logo_base64}},
            ],
        }]
    }
    async with httpx.AsyncClient() as client:
        r = await client.post(
            endpoint,
            json=payload,
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            timeout=30,
        )
        r.raise_for_status()

    text = r.json()["candidates"][0]["content"]["parts"][0]["text"]
    cleaned = text.replace("```json", "").replace("```", "").strip()
    try:
        return json.loads(cleaned)
    except Exception:
        return {}
