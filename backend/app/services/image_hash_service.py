
from pathlib import Path
import re

import imagehash
from PIL import Image


HASH_PATTERN = re.compile(r"^[0-9a-fA-F]{16}$")


def generate_image_hash(image_path: str) -> str:
    """
    Generate a 64-bit perceptual hash (pHash)
    represented as a 16-character hexadecimal string.
    """
    path = Path(image_path)

    if not path.is_file():
        raise FileNotFoundError(f"Image file not found: {image_path}")

    try:
        with Image.open(path) as image:
            perceptual_hash = imagehash.phash(image.convert("RGB"))

        return str(perceptual_hash)

    except Exception as exc:
        raise ValueError(
            f"Unable to generate image hash: {exc}"
        ) from exc


def compare_image_hashes(hash_1: str, hash_2: str) -> dict:
    """
    Compare two 64-bit perceptual hashes.

    Returns:
        hamming_distance: Number of differing bits.
        similarity_percentage: Similarity from 0 to 100.
    """
    if not HASH_PATTERN.fullmatch(hash_1 or ""):
        raise ValueError("hash_1 must be a 16-character hexadecimal hash")

    if not HASH_PATTERN.fullmatch(hash_2 or ""):
        raise ValueError("hash_2 must be a 16-character hexadecimal hash")

    first_hash = imagehash.hex_to_hash(hash_1)
    second_hash = imagehash.hex_to_hash(hash_2)

    hamming_distance = first_hash - second_hash

    similarity_percentage = round(
        ((64 - hamming_distance) / 64) * 100,
        2
    )

    return {
        "hamming_distance": int(hamming_distance),
        "similarity_percentage": float(similarity_percentage)
    }
