# CivicAI – Model Manifest

## 1. YOLO11 – 11-class object detection

- Checkpoint: `../runs/detect/runs/civicai/yolo11n_11class_v1-5/weights/best.pt`
- Architecture: YOLO11n
- Task: Object detection
- Input image size: 640
- Number of classes: 11
- SHA256: `7F6215EFC7BC42054C8D9C1EB1D1AFCFCA265779BFC55A9070CF16BC2BE41736`

### Class mapping

| ID | Class |
|---:|---|
| 0 | Broken Road Sign Issues |
| 1 | Damaged Electric wires and poles |
| 2 | Damaged Road issues |
| 3 | Damaged concrete structures |
| 4 | Dead Animal Pollution |
| 5 | Fallen trees |
| 6 | Littering-Garbage on Public Places |
| 7 | Pothole Issues |
| 8 | Vandalism Issues |
| 9 | Road cracks |
| 10 | Road surface damage |

### Held-out test metrics

- Precision: 0.5855
- Recall: 0.5553
- mAP50: 0.5744
- mAP50-95: 0.3538

## 2. ResNet18 – 6-class image classification

- Checkpoint: `classification/runs/resnet18_v1/best_model.pth`
- Architecture: ResNet18
- Task: Image-level classification
- Input image size: 224
- Test accuracy: 95.07%
- SHA256: `8856BCDF5BAFC53C257C4186A6B57777E764FE29F1E2C4FCF2892CEE42CDA7B0`

### Class mapping

The order below is the exact class order stored in the checkpoint:

1. broken_edges
2. construction_zones
3. cracks
4. open_manholes
5. potholes
6. waterlogged_roads

## Important limitations

- YOLO and ResNet18 perform separate tasks: object detection and image-level classification.
- Their predictions may disagree; do not silently treat them as equivalent.
- YOLO test performance varies substantially by class.
- ResNet18 was trained on a relatively small dataset; the broken_edges class has limited test support.
- Severity is a preliminary detection-count heuristic, not a measurement of actual structural damage.
- Human review is required before treating predictions as confirmed civic-issue assessments.
- Training datasets are not included in this handover package.
