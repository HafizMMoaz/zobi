"""
Constants for extension validation and naming.
"""

# Publisher validation pattern: lowercase letters, numbers, hyphens; must start with
# letter; no consecutive hyphens or trailing hyphens
PUBLISHER_PATTERN = r"^[a-z]([a-z0-9]*(-[a-z0-9]+)*)?$"

# Technical name validation pattern: lowercase letters, numbers, hyphens; must start
# with letter; no consecutive hyphens or trailing hyphens
TECHNICAL_NAME_PATTERN = r"^[a-z]([a-z0-9]*(-[a-z0-9]+)*)?$"

# Display name validation pattern: must start with letter, can contain letters,
# numbers, spaces, hyphens, underscores, dots
DISPLAY_NAME_PATTERN = r"^[a-zA-Z][a-zA-Z0-9\s\-_\.]*$"

# Version pattern for semantic versioning
VERSION_PATTERN = r"^\d+\.\d+\.\d+$"
