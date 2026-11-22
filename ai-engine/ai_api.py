from pathlib import Path

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from inference.ai_service import DEVICE, load_models, predict_image

app = FastAPI(
    title="CivicAI AI Inference Service",
    version="1.0.0",
    description="YOLO11 and ResNet18 inference service for CivicAI",
)


class PredictionRequest(BaseModel):
    image_path: str
    confidence_threshold: float = Field(default=0.25, ge=0.0, le=1.0)


@app.on_event("startup")
def startup_event():
    print("Loading CivicAI AI models...", flush=True)
    load_models()
    print(f"AI models ready on {DEVICE}", flush=True)


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "civicai-ai",
        "device": str(DEVICE),
    }


@app.post("/predict")
def predict(request: PredictionRequest):
    image_path = Path(request.image_path)

    if not image_path.is_file():
        raise HTTPException(
            status_code=404,
            detail=f"Image not found: {request.image_path}",
        )

    try:
        result = predict_image(
            image_path=str(image_path),
            confidence_threshold=request.confidence_threshold,
        )
        return result

    except Exception as exc:
        print(f"Inference error: {exc}", flush=True)
        raise HTTPException(
            status_code=500,
            detail="AI inference failed.",
        )
