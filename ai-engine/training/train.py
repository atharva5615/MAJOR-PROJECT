from ultralytics import YOLO
from pathlib import Path
import torch
from multiprocessing import freeze_support

DATA = r"D:\CivicAI_Datasets\civicai_baseline_11class\data.yaml"
WEIGHTS = Path("yolo11n.pt")

def main():
    print("Checking CUDA...")
    if not torch.cuda.is_available():
        raise RuntimeError("CUDA is unavailable")

    print("GPU:", torch.cuda.get_device_name(0))
    print("Loading YOLO11n...")

    if not Path(DATA).exists():
        raise FileNotFoundError(DATA)

    if not WEIGHTS.exists():
        raise FileNotFoundError(WEIGHTS)

    model = YOLO(str(WEIGHTS))

    print("Starting CivicAI training...")

    model.train(
        data=DATA,
        epochs=10,
        imgsz=640,
        batch=8,
        device=0,
        workers=0,
        patience=5,
        project="runs/civicai",
        name="yolo11n_11class_v1",
        pretrained=True,
        optimizer="auto",
        amp=True,
        cache=False,
        close_mosaic=10,
        seed=42,
        plots=True,
        save=True,
        exist_ok=False
    )

    print("TRAINING FINISHED")
    print("Best model:", Path(
        "runs/civicai/yolo11n_11class_v1/weights/best.pt"
    ).resolve())

if __name__ == "__main__":
    freeze_support()
    main()
