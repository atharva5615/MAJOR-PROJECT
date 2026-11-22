from pathlib import Path
from threading import RLock

import torch
import torch.nn as nn
from PIL import Image
from torchvision import transforms, models
from ultralytics import YOLO

from severity.severity_score import estimate_severity


AI_ENGINE_DIR = Path(__file__).resolve().parent.parent

YOLO_MODEL_PATH = (
    AI_ENGINE_DIR.parent
    / "runs"
    / "detect"
    / "runs"
    / "civicai"
    / "yolo11n_11class_v1-5"
    / "weights"
    / "best.pt"
)

CLASSIFIER_MODEL_PATH = (
    AI_ENGINE_DIR
    / "classification"
    / "runs"
    / "resnet18_v1"
    / "best_model.pth"
)

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

_yolo_model = None
_classifier_model = None
_classifier_classes = None
_classifier_image_size = None

_MODEL_LOCK = RLock()
_INFERENCE_LOCK = RLock()


def get_transform(image_size):
    return transforms.Compose([
        transforms.Resize((image_size, image_size)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])


def load_models():
    global _yolo_model
    global _classifier_model
    global _classifier_classes
    global _classifier_image_size

    with _MODEL_LOCK:
        if (
            _yolo_model is not None
            and _classifier_model is not None
        ):
            return

        if not YOLO_MODEL_PATH.is_file():
            raise FileNotFoundError(
                f"YOLO checkpoint not found: {YOLO_MODEL_PATH}"
            )

        if not CLASSIFIER_MODEL_PATH.is_file():
            raise FileNotFoundError(
                f"Classifier checkpoint not found: {CLASSIFIER_MODEL_PATH}"
            )

        checkpoint = torch.load(
            CLASSIFIER_MODEL_PATH,
            map_location=DEVICE,
            weights_only=True
        )

        classes = checkpoint["classes"]
        image_size = checkpoint["image_size"]

        classifier = models.resnet18(weights=None)
        classifier.fc = nn.Linear(
            classifier.fc.in_features,
            len(classes)
        )

        classifier.load_state_dict(
            checkpoint["model_state_dict"]
        )

        classifier.to(DEVICE)
        classifier.eval()

        yolo = YOLO(str(YOLO_MODEL_PATH))

        _yolo_model = yolo
        _classifier_model = classifier
        _classifier_classes = classes
        _classifier_image_size = image_size


def predict_image(image_path, confidence_threshold=0.25):
    image_path = Path(image_path)

    if not image_path.is_file():
        raise FileNotFoundError(
            f"Input image not found: {image_path}"
        )

    if not 0.0 <= confidence_threshold <= 1.0:
        raise ValueError(
            "Confidence threshold must be between 0 and 1."
        )

    with Image.open(image_path) as source:
        image = source.convert("RGB")

    with _INFERENCE_LOCK:
        load_models()

        yolo_results = _yolo_model.predict(
            source=image,
            conf=confidence_threshold,
            verbose=False,
            device=0 if DEVICE.type == "cuda" else "cpu"
        )

        detections = []

        for result in yolo_results:
            if result.boxes is None:
                continue

            for box in result.boxes:
                class_id = int(box.cls[0])
                confidence = float(box.conf[0])
                coordinates = box.xyxy[0].tolist()

                detections.append({
                    "label": result.names[class_id],
                    "confidence": round(confidence, 4),
                    "bbox": [
                        round(float(value), 2)
                        for value in coordinates
                    ],
                    "model": "YOLO11n",
                    "result_type": "object_detection"
                })

        image_tensor = get_transform(
            _classifier_image_size
        )(image)

        image_tensor = image_tensor.unsqueeze(0).to(DEVICE)

        with torch.inference_mode():
            outputs = _classifier_model(image_tensor)
            probabilities = torch.softmax(outputs, dim=1)[0]

        predicted_index = int(torch.argmax(probabilities))
        classifier_confidence = float(
            probabilities[predicted_index]
        )

        classification = {
            "label": _classifier_classes[predicted_index],
            "confidence": round(classifier_confidence, 4),
            "model": "ResNet18",
            "result_type": "image_classification"
        }

        highest_detection = (
            max(detections, key=lambda item: item["confidence"])
            if detections else None
        )

        severity = estimate_severity(detections)

    return {
        "available": True,
        "model_status": "ready",
        "device": str(DEVICE),
        "detected_category": (
            highest_detection["label"]
            if highest_detection else None
        ),
        "detections": detections,
        "classification": classification,
        "severity": severity,
        "message": "AI analysis completed successfully."
    }


if __name__ == "__main__":
    import argparse
    import json

    parser = argparse.ArgumentParser(
        description="CivicAI Backend Inference Service"
    )

    parser.add_argument("--image", required=True)
    parser.add_argument(
        "--confidence",
        type=float,
        default=0.25
    )

    args = parser.parse_args()

    result = predict_image(
        args.image,
        confidence_threshold=args.confidence
    )

    print(json.dumps(result, indent=4))
