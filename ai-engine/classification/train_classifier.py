
from pathlib import Path
import json
import random
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models
from sklearn.metrics import classification_report, confusion_matrix

# ---------------- CONFIGURATION ----------------

DATA_DIR = Path(r"D:\CivicAI_Datasets\civicai_classifier_6class")
OUTPUT_DIR = Path("classification/runs/resnet18_v1")

EPOCHS = 15
BATCH_SIZE = 16
LEARNING_RATE = 0.0005
IMAGE_SIZE = 224
SEED = 42

CLASS_NAMES = [
    "broken_edges",
    "construction_zones",
    "cracks",
    "open_manholes",
    "potholes",
    "waterlogged_roads",
]

# ---------------- REPRODUCIBILITY ----------------

random.seed(SEED)
np.random.seed(SEED)
torch.manual_seed(SEED)

if torch.cuda.is_available():
    torch.cuda.manual_seed_all(SEED)

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

print("Device:", DEVICE)
if DEVICE.type == "cuda":
    print("GPU:", torch.cuda.get_device_name(0))

# ---------------- TRANSFORMS ----------------

train_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(10),
    transforms.ColorJitter(
        brightness=0.15,
        contrast=0.15,
        saturation=0.15
    ),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])

eval_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])

# ---------------- DATASETS ----------------

train_data = datasets.ImageFolder(
    DATA_DIR / "train",
    transform=train_transform
)

val_data = datasets.ImageFolder(
    DATA_DIR / "val",
    transform=eval_transform
)

test_data = datasets.ImageFolder(
    DATA_DIR / "test",
    transform=eval_transform
)

if train_data.classes != CLASS_NAMES:
    raise ValueError(
        f"Unexpected class order: {train_data.classes}"
    )

if val_data.classes != CLASS_NAMES or test_data.classes != CLASS_NAMES:
    raise ValueError("Train, validation and test classes do not match.")

print("\nClasses:", train_data.classes)
print("Train:", len(train_data))
print("Validation:", len(val_data))
print("Test:", len(test_data))

train_counts = np.bincount(train_data.targets)
class_weights = len(train_data) / (
    len(CLASS_NAMES) * np.maximum(train_counts, 1)
)

weights = torch.tensor(
    class_weights,
    dtype=torch.float32,
    device=DEVICE
)

print("Class weights:", class_weights)

# ---------------- DATALOADERS ----------------

train_loader = DataLoader(
    train_data,
    batch_size=BATCH_SIZE,
    shuffle=True,
    num_workers=0,
    pin_memory=(DEVICE.type == "cuda")
)

val_loader = DataLoader(
    val_data,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=0,
    pin_memory=(DEVICE.type == "cuda")
)

test_loader = DataLoader(
    test_data,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=0,
    pin_memory=(DEVICE.type == "cuda")
)

# ---------------- MODEL ----------------

model = models.resnet18(
    weights=models.ResNet18_Weights.DEFAULT
)

model.fc = nn.Linear(
    model.fc.in_features,
    len(CLASS_NAMES)
)

model = model.to(DEVICE)

criterion = nn.CrossEntropyLoss(weight=weights)

optimizer = torch.optim.AdamW(
    model.parameters(),
    lr=LEARNING_RATE,
    weight_decay=0.01
)

scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
    optimizer,
    mode="min",
    factor=0.5,
    patience=2
)

# ---------------- EVALUATION FUNCTION ----------------

def evaluate(loader):
    model.eval()

    total_loss = 0.0
    correct = 0
    total = 0
    all_predictions = []
    all_labels = []

    with torch.no_grad():
        for images, labels in loader:
            images = images.to(DEVICE)
            labels = labels.to(DEVICE)

            outputs = model(images)
            loss = criterion(outputs, labels)

            predictions = outputs.argmax(dim=1)

            total_loss += loss.item() * labels.size(0)
            correct += (predictions == labels).sum().item()
            total += labels.size(0)

            all_predictions.extend(predictions.cpu().tolist())
            all_labels.extend(labels.cpu().tolist())

    return (
        total_loss / total,
        correct / total,
        all_labels,
        all_predictions
    )

# ---------------- TRAINING ----------------

best_val_loss = float("inf")
best_model_path = OUTPUT_DIR / "best_model.pth"
history = []

print("\n========== CLASSIFIER TRAINING STARTED ==========")

for epoch in range(EPOCHS):
    model.train()

    running_loss = 0.0
    correct = 0
    total = 0

    for images, labels in train_loader:
        images = images.to(DEVICE)
        labels = labels.to(DEVICE)

        optimizer.zero_grad(set_to_none=True)

        outputs = model(images)
        loss = criterion(outputs, labels)

        loss.backward()
        optimizer.step()

        predictions = outputs.argmax(dim=1)

        running_loss += loss.item() * labels.size(0)
        correct += (predictions == labels).sum().item()
        total += labels.size(0)

    train_loss = running_loss / total
    train_accuracy = correct / total

    val_loss, val_accuracy, _, _ = evaluate(val_loader)

    scheduler.step(val_loss)

    record = {
        "epoch": epoch + 1,
        "train_loss": train_loss,
        "train_accuracy": train_accuracy,
        "val_loss": val_loss,
        "val_accuracy": val_accuracy,
    }

    history.append(record)

    print(
        f"Epoch {epoch + 1}/{EPOCHS} | "
        f"Train Loss: {train_loss:.4f} | "
        f"Train Acc: {train_accuracy:.4f} | "
        f"Val Loss: {val_loss:.4f} | "
        f"Val Acc: {val_accuracy:.4f}"
    )

    if val_loss < best_val_loss:
        best_val_loss = val_loss

        torch.save({
            "model_state_dict": model.state_dict(),
            "classes": CLASS_NAMES,
            "image_size": IMAGE_SIZE,
        }, best_model_path)

        print("  Best model checkpoint saved.")

# ---------------- SAVE TRAINING HISTORY ----------------

with open(OUTPUT_DIR / "training_history.json", "w") as f:
    json.dump(history, f, indent=2)

# ---------------- FINAL TEST EVALUATION ----------------

print("\n========== FINAL TEST EVALUATION ==========")

checkpoint = torch.load(
    best_model_path,
    map_location=DEVICE,
    weights_only=True
)

model.load_state_dict(checkpoint["model_state_dict"])

test_loss, test_accuracy, y_true, y_pred = evaluate(test_loader)

print("Test Loss:", round(test_loss, 4))
print("Test Accuracy:", round(test_accuracy, 4))

print("\nCLASSIFICATION REPORT:")
print(classification_report(
    y_true,
    y_pred,
    labels=list(range(len(CLASS_NAMES))),
    target_names=CLASS_NAMES,
    zero_division=0
))

print("CONFUSION MATRIX:")
print(confusion_matrix(
    y_true,
    y_pred,
    labels=list(range(len(CLASS_NAMES)))
))

print("\nBEST MODEL:", best_model_path.resolve())
print("TRAINING COMPLETE")
