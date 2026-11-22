import json
import os
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from schemas.ai import AIAnalysisResponse


AI_SERVICE_URL = os.getenv(
    "CIVICAI_AI_SERVICE_URL",
    "http://127.0.0.1:8001"
).rstrip("/")

AI_TIMEOUT_SECONDS = float(
    os.getenv("CIVICAI_AI_TIMEOUT_SECONDS", "120")
)


def analyze_complaint(
    image_path: str,
    description: str
) -> AIAnalysisResponse:
    """
    Send complaint image path to the separate CivicAI AI inference service.
    ML dependencies remain isolated inside ai-engine.
    """

    payload = {
        "image_path": image_path,
        "confidence_threshold": 0.25,
    }

    request = Request(
        url=f"{AI_SERVICE_URL}/predict",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urlopen(request, timeout=AI_TIMEOUT_SECONDS) as response:
            result = json.loads(response.read().decode("utf-8"))

    except HTTPError as exc:
        raise RuntimeError(
            f"AI service returned HTTP {exc.code}"
        ) from exc

    except (URLError, TimeoutError) as exc:
        raise RuntimeError(
            "Could not connect to CivicAI AI inference service"
        ) from exc

    severity_data = result.get("severity") or {}
    severity_value = severity_data.get("severity")

    return AIAnalysisResponse(
        available=result.get("available", False),
        model_status=result.get("model_status", "unknown"),
        detected_category=result.get("detected_category"),
        confidence=(
            result.get("detections", [{}])[0].get("confidence")
            if result.get("detections")
            else None
        ),
        severity=severity_value,
        detections=result.get("detections", []),
        classification=result.get("classification"),
        severity_details=severity_data or None,
        device=result.get("device"),
        message=result.get("message", "AI analysis completed."),
    )
