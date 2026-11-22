import torch
import torch.nn as nn
from torchvision import models

print("1. Creating ResNet18...", flush=True)

checkpoint = torch.load(
    r".\classification\runs\resnet18_v1\best_model.pth",
    map_location="cpu",
    weights_only=True
)

model = models.resnet18(weights=None)
model.fc = nn.Linear(model.fc.in_features, len(checkpoint["classes"]))

print("2. Loading weights...", flush=True)
model.load_state_dict(checkpoint["model_state_dict"])

print("3. Model weights loaded successfully", flush=True)
print("4. Moving model to GPU...", flush=True)

model = model.cuda()

print("5. GPU transfer successful:", next(model.parameters()).device, flush=True)
