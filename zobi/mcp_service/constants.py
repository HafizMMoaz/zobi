"""Constants for the MCP service."""

from typing import Literal

# Supported model types for schema discovery and MCP tools
ModelType = Literal["chart", "dataset", "dashboard", "database"]

# Pagination defaults
DEFAULT_PAGE_SIZE = 10  # Default number of items per page
MAX_PAGE_SIZE = 100  # Maximum allowed page_size to prevent oversized responses

# Response size guard defaults
DEFAULT_TOKEN_LIMIT = 25_000  # ~25k tokens prevents overwhelming LLM context windows
DEFAULT_WARN_THRESHOLD_PCT = 80  # Log warnings above 80% of limit
