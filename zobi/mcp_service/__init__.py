# zobi/mcp_service/__init__.py

"""
Zobi MCP Service

This package provides the Model Context Protocol (MCP) service for Zobi,
enabling programmatic access to Zobi's functionality through a standardized API.

The MCP service operates as a standalone FastMCP server.

Quick Start:
-----------
# Run the MCP server
zobi mcp run --port 5009

# The service will be available at:
# http://localhost:5009/mcp/
"""

__version__ = "1.0.0"

# Tools are auto-registered when imported by the MCP service
# Do not import them here to avoid test pollution

__all__ = [
    "__version__",
]
