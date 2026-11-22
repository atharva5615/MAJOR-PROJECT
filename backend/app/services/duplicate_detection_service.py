
from sqlalchemy import func
from sqlalchemy.orm import Session

from models import CivicIssue
from services.image_hash_service import compare_image_hashes


def find_duplicate_candidates(
    db: Session,
    issue: CivicIssue,
    radius_metres: float = 50,
    max_hamming_distance: int = 10
) -> list[dict]:
    """
    Find possible duplicate civic issues.

    Conditions:
    - Exact category match.
    - Within the specified GPS radius.
    - Both issues must have an image hash.
    - Perceptual hash distance must not exceed the threshold.

    This function only identifies candidates.
    It does not merge or modify any issues.
    """

    if not issue.location or not issue.image_hash:
        return []

    if radius_metres <= 0:
        raise ValueError("radius_metres must be greater than zero")

    if not 0 <= max_hamming_distance <= 64:
        raise ValueError(
            "max_hamming_distance must be between 0 and 64"
        )

    distance_expression = func.ST_Distance(
        CivicIssue.location,
        issue.location
    ).label("gps_distance_metres")

    candidates = (
        db.query(CivicIssue, distance_expression)
        .filter(
            CivicIssue.id != issue.id,
            CivicIssue.category == issue.category,
            CivicIssue.image_hash.isnot(None),
            CivicIssue.location.isnot(None),
            func.ST_DWithin(
                CivicIssue.location,
                issue.location,
                radius_metres
            )
        )
        .order_by(distance_expression.asc())
        .all()
    )

    duplicate_candidates = []

    for candidate, gps_distance in candidates:
        try:
            comparison = compare_image_hashes(
                issue.image_hash,
                candidate.image_hash
            )
        except ValueError:
            # Ignore records containing invalid stored hashes.
            continue

        hamming_distance = comparison["hamming_distance"]

        if hamming_distance <= max_hamming_distance:
            duplicate_candidates.append({
                "issue_id": candidate.id,
                "gps_distance_metres": round(
                    float(gps_distance), 2
                ),
                "hamming_distance": hamming_distance,
                "image_similarity_percentage": (
                    comparison["similarity_percentage"]
                )
            })

    return duplicate_candidates
