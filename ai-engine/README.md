# CivicAI - AI/ML Engine

## Overview
CivicAI uses computer vision to analyse civic issues through object detection and image classification.

## AI Modules
1. YOLO11n object detection - currently supports 11 classes and generates bounding-box detections.
2. ResNet18 image classification - currently supports 6 image-level categories; it does not generate bounding boxes.
3. Hybrid inference - combines the separate outputs of both models.
4. Severity estimation - preliminary triage based on detection count, not an engineering safety assessment.
5. Image similarity - utilities for identifying similar images.

## Evaluation Results

### YOLO11n - Held-out test set
- Precision: 58.55%
- Recall: 55.53%
- mAP@50: 57.44%
- mAP@50-95: 35.38%

### ResNet18 - Held-out test set
- Accuracy: 95.07%
- Macro F1: 0.89
- Weighted F1: 0.94

These are experimental results. Dataset size, class imbalance and annotation quality limit generalisation.

## Setup
Create and activate a virtual environment:

    python -m venv venv
    .\venv\Scripts\Activate.ps1

Install dependencies:

    pip install -r requirements.txt

Install compatible PyTorch and Torchvision separately from:
https://pytorch.org/get-started/locally/

## Main Files
- training/train.py - YOLO training
- classification/train_classifier.py - ResNet18 training
- classification/predict_classifier.py - image classification
- inference/predict.py - YOLO inference
- inference/hybrid_predict.py - hybrid inference
- severity/severity_score.py - preliminary severity estimation
- duplicate_detection/image_similarity.py - image similarity

## Current Limitations
- This is not yet a complete 40-class detection system.
- YOLO supports 11 detection classes; ResNet18 supports 6 image-level classes.
- Classifier predictions must not be treated as bounding-box detections.
- Severity estimates require human verification.
- Dataset expansion, annotation review and backend integration remain necessary.

Academic project prototype - CivicAI.
