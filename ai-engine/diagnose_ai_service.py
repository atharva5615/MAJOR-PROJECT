import sys
print("1. Starting diagnostic...", flush=True)

print("2. Importing AI service...", flush=True)
from inference import ai_service

print("3. AI service imported successfully", flush=True)
print("4. Device:", ai_service.DEVICE, flush=True)

print("5. Loading both models...", flush=True)
ai_service.load_models()

print("6. Both models loaded successfully!", flush=True)
print("   YOLO:", ai_service._yolo_model is not None, flush=True)
print("   ResNet:", ai_service._classifier_model is not None, flush=True)

print("7. Running image inference...", flush=True)
result = ai_service.predict_image(
    r"D:\AI Civic\ai-civic-platform\backend\uploads\47a732d46a9449ca8aa7ce1d54c27919.jpg"
)

print("8. Inference completed!", flush=True)
print(result, flush=True)
