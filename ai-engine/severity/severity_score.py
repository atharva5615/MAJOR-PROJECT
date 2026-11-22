
def estimate_severity(detections):
    """
    Estimate preliminary damage-report priority.

    IMPORTANT:
    This is a basic image-based triage heuristic,
    NOT an engineering assessment of road damage.
    """

    if not detections:
        return {
            "severity": None,
            "basis": "No supported damage detected.",
            "warning": "No severity estimate available."
        }

    detection_count = len(detections)

    if detection_count == 1:
        severity = "low"
    elif detection_count <= 3:
        severity = "moderate"
    else:
        severity = "high"

    return {
        "severity": severity,
        "basis": f"{detection_count} damage region(s) detected.",
        "warning": (
            "Preliminary triage only. "
            "Detection count does not measure actual "
            "physical or structural damage severity. "
            "Human inspection is required."
        )
    }
