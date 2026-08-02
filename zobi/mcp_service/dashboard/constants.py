"""
Shared constants for MCP dashboard tools.

Values match frontend defaults from
``frontend/src/dashboard/util/constants.ts``.
"""

import uuid

GRID_DEFAULT_CHART_WIDTH = 4
GRID_COLUMN_COUNT = 12


def generate_id(prefix: str) -> str:
    """
    Generate a component ID matching the frontend's nanoid-style pattern.

    Uses a UUID hex prefix to produce IDs like ``ROW-a1b2c3d4`` which are
    compatible with the frontend's ``nanoid()``-based ID generation.
    """
    return f"{prefix}-{uuid.uuid4().hex[:8]}"
