from pydantic import BaseModel, Field


class AIDetection(BaseModel):
    label: str
    confidence: float = Field(ge=0.0, le=1.0)
    bbox: list[float] | None = Field(default=None, min_length=4, max_length=4)
    model: str | None = None
    result_type: str | None = None


class AIClassification(BaseModel):
    label: str
    confidence: float = Field(ge=0.0, le=1.0)
    model: str | None = None
    result_type: str | None = None


class AISeverityDetails(BaseModel):
    severity: str | None = None
    basis: str | None = None
    warning: str | None = None


class AIAnalysisResponse(BaseModel):
    available: bool = False
    model_status: str = "not_configured"

    detected_category: str | None = None
    confidence: float | None = Field(default=None, ge=0.0, le=1.0)

    # Keep the existing simple severity field for compatibility.
    severity: str | None = None

    detections: list[AIDetection] = Field(default_factory=list)

    # Additional information from the AI inference service.
    classification: AIClassification | None = None
    severity_details: AISeverityDetails | None = None
    device: str | None = None

    message: str = (
        "AI model is not configured yet. "
        "Complaint can still be submitted."
    )
