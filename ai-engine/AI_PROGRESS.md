CIVICAI - AI/ML PROGRESS
Date: 20 November 2026

MILESTONE COMPLETED:
Successfully trained first 11-class YOLO11n CivicAI model.

Training:
- Epochs: 10
- Image size: 640
- Batch: 8
- GPU: NVIDIA RTX 4050 Laptop GPU
- Dataset: civicai_baseline_11class
- Training completed successfully.

BEST MODEL:
D:\Major Project\ai-civic-platform\runs\detect\runs\civicai\yolo11n_11class_v1-5\weights\best.pt

NEXT TASKS:
1. Evaluate model on validation and test datasets.
2. Review per-class precision, recall and mAP.
3. Test predictions on real images.
4. Integrate with AI inference module.
5. Coordinate backend integration with Member 2.
6. Document that this is an 11-class baseline, not the full 40-class model.

--------------------------------------------------
UPDATED STATUS - 20 NOVEMBER 2026

COMPLETED MILESTONES:

1. YOLO11n 11-class model trained successfully.
2. Validation evaluation completed.
3. Held-out test evaluation completed.
4. Per-class precision, recall and mAP reviewed.
5. Empty-label and prediction audit performed.
6. ResNet18 six-class image classifier trained and evaluated.
7. Classifier inference module created and tested.
8. Hybrid YOLO + ResNet18 inference prototype created.
9. Preliminary severity estimation module tested.
10. AI module README and requirements updated.

YOLO HELD-OUT TEST RESULTS:
- Precision: 58.55%
- Recall: 55.53%
- mAP50: 57.44%
- mAP50-95: 35.38%

RESNET18 HELD-OUT TEST RESULTS:
- Accuracy: 95.07%
- Macro F1: 0.89
- Weighted F1: 0.94

CURRENT ARCHITECTURE:
- YOLO11n: 11 object detection classes.
- ResNet18: 6 image-level classification categories.
- Hybrid inference: combines separate model outputs.
- Severity: preliminary detection-count-based heuristic.
- Image similarity: existing utility module.

IMPORTANT LIMITATIONS:
- The complete 40-class detection system is not implemented.
- Image classification does not provide bounding boxes.
- Dataset quality and class imbalance affect model performance.
- Severity estimates require human verification.
- Backend integration remains pending coordination with Member 2.

REMAINING TASKS:
1. Review final AI module files and Git changes.
2. Coordinate the inference response format with Member 2.
3. Complete backend integration when the backend is available.
4. Prepare the final team handoff and demonstration.

STATUS: AI/ML PROTOTYPE DEVELOPED; INTEGRATION PENDING.
