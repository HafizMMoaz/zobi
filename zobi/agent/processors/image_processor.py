"""Describe an image attachment.

Metadata only: dimensions, format, colour mode. There is deliberately **no**
OCR and no vision inference here. The agent runs vision-capable models, so
describing what an image *shows* is the model's job; this module's job is to
tell the agent that the image exists, that it is decodable, and how big it is.

Pillow is already a Zobi dependency (``Pillow>=11.0.0,<13`` in
``pyproject.toml``) and is used elsewhere for thumbnails, so nothing new is
required.

Bounds:

- ``MAX_IMAGE_BYTES``  : files above 32 MiB are rejected.
- ``MAX_IMAGE_PIXELS`` : declared pixel counts above 64 MP are rejected
  (decompression bomb guard).

Pixel data is never decoded: ``Image.open`` is lazy and only the header is
read, so a bomb is rejected on its declared dimensions before any allocation.
"""

from __future__ import annotations

import io
import logging
from typing import Any

from zobi.agent.processors import ProcessorError

logger = logging.getLogger(__name__)

MAX_IMAGE_BYTES = 32 * 1024 * 1024

#: 64 megapixels. Larger images are treated as hostile rather than resized.
MAX_IMAGE_PIXELS = 64_000_000

#: Rough guidance for the caller: most vision APIs reject very large payloads.
VISION_PAYLOAD_HINT_BYTES = 5 * 1024 * 1024


def process(raw: bytes, filename: str) -> dict[str, Any]:
    """Describe an image attachment.

    :returns: ``kind``, ``summary``, ``width``, ``height``, ``format``,
        ``mode``, ``byte_size``, ``vision_ready``, ``note``.
    :raises ProcessorError: if the file is empty, too large, not a decodable
        image, or declares an implausible pixel count.
    """
    if not raw:
        raise ProcessorError("This image file is empty.")
    if len(raw) > MAX_IMAGE_BYTES:
        raise ProcessorError(
            f"This image is larger than {MAX_IMAGE_BYTES // (1024 * 1024)} MiB "
            "and will not be processed."
        )

    try:
        from PIL import Image, UnidentifiedImageError
    except ImportError as ex:  # pragma: no cover - Pillow is a hard dependency
        raise ProcessorError(
            "Image attachments cannot be read: the 'Pillow' package is not "
            "installed."
        ) from ex

    try:
        # ``open`` parses the header only; pixels are never decoded here.
        with Image.open(io.BytesIO(raw)) as image:
            width, height = image.size
            image_format = image.format or "unknown"
            mode = image.mode
    except UnidentifiedImageError as ex:
        raise ProcessorError("This file is not a readable image.") from ex
    except Image.DecompressionBombError as ex:
        raise ProcessorError(
            "This image declares an implausibly large size and was rejected."
        ) from ex
    except Exception as ex:
        logger.info("Could not read attached image: %s", type(ex).__name__)
        raise ProcessorError("This image file could not be read; it may be corrupt.") from ex

    if width <= 0 or height <= 0:
        raise ProcessorError("This image reports invalid dimensions.")
    if width * height > MAX_IMAGE_PIXELS:
        raise ProcessorError(
            f"This image is larger than {MAX_IMAGE_PIXELS // 1_000_000} megapixels "
            "and was rejected."
        )

    vision_ready = len(raw) <= VISION_PAYLOAD_HINT_BYTES
    note = (
        "Image contents are not described here. Pass the image to a "
        "vision-capable model to interpret it."
    )
    if not vision_ready:
        note += (
            " This file is large and may need to be downscaled before being "
            "sent to a vision model."
        )

    return {
        "kind": "image",
        "summary": (
            f"{image_format} image '{filename}', {width}x{height} pixels, "
            f"mode {mode}, {len(raw):,} bytes. {note}"
        ),
        "width": width,
        "height": height,
        "format": image_format,
        "mode": mode,
        "byte_size": len(raw),
        "vision_ready": vision_ready,
        "note": note,
    }
