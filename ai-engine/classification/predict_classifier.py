
from pathlib import Path
import argparse
import torch
import torch.nn as nn
from PIL import Image
from torchvision import transforms, models

# ---------------- CONFIGURATION ----------------

MODEL_PATH = Path(__file__).parent / "runs" / "resnet18_v1" / "best_model.pth"

IMAGE_SIZE = 224

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ---------------- IMAGE TRANSFORM ----------------

transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# ---------------- LOAD MODEL ----------------

def load_model():
    if not MODEL_PATH.is_file():
        raise FileNotFoundError(f"Model checkpoint not found: {MODEL_PATH}")

    checkpoint = torch.load(
        MODEL_PATH,
        map_location=DEVICE,
        weights_only=True
    )

    classes = checkpoint["classes"]

    model = models.resnet18(weights=None)
    model.fc = nn.Linear(model.fc.in_features, len(classes))

    model.load_state_dict(checkpoint["model_state_dict"])
    model.to(DEVICE)
    model.eval()

    return model, classes

# ---------------- PREDICTION ----------------

def predict_image(image_path):
    image_path = Path(image_path)

    if not image_path.is_file():
        raise FileNotFoundError(f"Image not found: {image_path}")

    model, classes = load_model()

    image = Image.open(image_path).convert("RGB")
    image_tensor = transform(image).unsqueeze(0).to(DEVICE)

    with torch.inference_mode():
        outputs = model(image_tensor)
        probabilities = torch.softmax(outputs, dim=1)[0]

    ranked = torch.argsort(probabilities, descending=True)

    results = [
        {
            "category": classes[index],
            "confidence": round(probabilities[index].item(), 4)
        }
        for index in ranked.tolist()
    ]

    return {
        "available": True,
        "model_status": "loaded",
        "detected_category": results[0]["category"],
        "confidence": results[0]["confidence"],
        "predictions": results
    }

# ---------------- COMMAND LINE ----------------

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="CivicAI six-category image classifier"
    )

    parser.add_argument(
        "--image",
        required=True,
        help="Path to the input image"
    )

    args = parser.parse_args()

    try:
        result = predict_image(args.image)

        print("\n========== CIVICAI CLASSIFICATION ==========")
        print("Device:", DEVICE)
        print("Detected category:", result["detected_category"])
        print("Confidence:", result["confidence"])

        print("\nTOP PREDICTIONS:")
        for prediction in result["predictions"]:
            print(
                f"{prediction['category']}: "
                f"{prediction['confidence']:.2%}"
            )

    except Exception as error:
        print("PREDICTION ERROR:", error)
        raise
