
from pathlib import Path

import torch
import torch.nn as nn
from PIL import Image
from torchvision import transforms, models
from ultralytics import YOLO


# ---------------- PATHS ----------------

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


# ---------------- CLASSIFIER TRANSFORM ----------------

def get_transform(image_size):
    return transforms.Compose([
        transforms.Resize((image_size, image_size)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])


# ---------------- LOAD MODELS ----------------

def load_yolo_model():
    if not YOLO_MODEL_PATH.is_file():
        raise FileNotFoundError(
            f"YOLO model not found: {YOLO_MODEL_PATH}"
        )

    return YOLO(str(YOLO_MODEL_PATH))


def load_classifier_model():
    if not CLASSIFIER_MODEL_PATH.is_file():
        raise FileNotFoundError(
            f"Classifier model not found: {CLASSIFIER_MODEL_PATH}"
        )

    checkpoint = torch.load(
        CLASSIFIER_MODEL_PATH,
        map_location=DEVICE,
        weights_only=True
    )

    classes = checkpoint["classes"]
    image_size = checkpoint["image_size"]

    model = models.resnet18(weights=None)
    model.fc = nn.Linear(
        model.fc.in_features,
        len(classes)
    )

    model.load_state_dict(checkpoint["model_state_dict"])
    model.to(DEVICE)
    model.eval()

    return model, classes, image_size


# ---------------- HYBRID PREDICTION ----------------

def predict_image(image_path, confidence_threshold=0.25):

    image_path = Path(image_path)

    if not image_path.is_file():
        raise FileNotFoundError(
            f"Image not found: {image_path}"
        )

    # Load both models
    yolo_model = load_yolo_model()

    classifier_model, classifier_classes, image_size = (
        load_classifier_model()
    )

    # ---------------- YOLO DETECTION ----------------

    yolo_results = yolo_model.predict(
        source=str(image_path),
        conf=confidence_threshold,
        verbose=False,
        device=0 if DEVICE.type == "cuda" else "cpu"
    )

    detections = []

    for result in yolo_results:
        for box in result.boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])

            detections.append({
                "label": result.names[class_id],
                "confidence": round(confidence, 4),
                "model": "YOLO11n",
                "result_type": "object_detection"
            })

    # ---------------- RESNET18 CLASSIFICATION ----------------

    image = Image.open(image_path).convert("RGB")

    image_tensor = get_transform(image_size)(image)
    image_tensor = image_tensor.unsqueeze(0).to(DEVICE)

    with torch.inference_mode():
        outputs = classifier_model(image_tensor)
        probabilities = torch.softmax(outputs, dim=1)[0]

    predicted_index = int(torch.argmax(probabilities))
    classifier_confidence = float(
        probabilities[predicted_index]
    )

    classification = {
        "label": classifier_classes[predicted_index],
        "confidence": round(classifier_confidence, 4),
        "model": "ResNet18",
        "result_type": "image_classification"
    }

    # ---------------- RESPONSE ----------------

    highest_detection = (
        max(detections, key=lambda item: item["confidence"])
        if detections else None
    )

    return {
        "available": True,
        "model_status": "ready",
        "device": str(DEVICE),

        "detected_category": (
            highest_detection["label"]
            if highest_detection
            else classification["label"]
        ),

        "detections": detections,

        "classification": classification,

        "message": (
            "Object detections and image classification completed."
        )
    }


# ---------------- COMMAND LINE ----------------

if __name__ == "__main__":

    import argparse
    import json

    parser = argparse.ArgumentParser(
        description="CivicAI Hybrid AI Prediction"
    )

    parser.add_argument(
        "--image",
        required=True,
        help="Path to the input image"
    )

    parser.add_argument(
        "--confidence",
        type=float,
        default=0.25,
        help="YOLO detection confidence threshold"
    )

    args = parser.parse_args()

    try:
        result = predict_image(
            args.image,
            confidence_threshold=args.confidence
        )

        print("\n========== CIVICAI HYBRID AI ==========")
        print(json.dumps(result, indent=4))

    except Exception as error:
        print("\nPREDICTION ERROR:", error)
        raise
