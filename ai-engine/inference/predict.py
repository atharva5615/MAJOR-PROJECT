
from pathlib import Path
from ultralytics import YOLO


# Resolve paths relative to the ai-engine directory
AI_ENGINE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = (
    AI_ENGINE_DIR
    / "runs"
    / "detect"
    / "road_damage_yolo11n_v1"
    / "weights"
    / "best.pt"
)


def load_model():
    """Load the trained CivicAI road damage detection model."""

    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Trained model not found: {MODEL_PATH}"
        )

    return YOLO(str(MODEL_PATH))


def predict_image(image_path, confidence_threshold=0.25):
    """
    Detect road damage in an image.

    Returns detected categories and confidence scores.
    """

    image_path = Path(image_path)

    if not image_path.is_file():
        raise FileNotFoundError(
            f"Image not found: {image_path}"
        )

    model = load_model()

    results = model.predict(
        source=str(image_path),
        conf=confidence_threshold,
        verbose=False
    )

    detections = []

    for result in results:
        for box in result.boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])

            detections.append({
                "label": result.names[class_id],
                "confidence": round(confidence, 4)
            })

    detected_category = None

    if detections:
        highest_confidence = max(
            detections,
            key=lambda item: item["confidence"]
        )
        detected_category = highest_confidence["label"]

    return {
        "available": True,
        "model_status": "ready",
        "detected_category": detected_category,
        "confidence": (
            max(item["confidence"] for item in detections)
            if detections else None
        ),
        "detections": detections,
        "message": (
            "Road damage detected."
            if detections
            else "No supported road damage detected."
        )
    }
