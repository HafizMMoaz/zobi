
"""Simple health check tool for testing MCP service."""

import datetime
import logging
import platform
import time

from flask import current_app
from zobi_core.mcp.decorators import tool, ToolAnnotations

from zobi.extensions import event_logger
from zobi.mcp_service.system.schemas import HealthCheckResponse
from zobi.utils.version import get_version_metadata

logger = logging.getLogger(__name__)

_start_time = time.monotonic()


@tool(
    tags=["core"],
    annotations=ToolAnnotations(
        title="Health check",
        readOnlyHint=True,
        destructiveHint=False,
    ),
)
async def health_check() -> HealthCheckResponse:
    """
    Simple health check tool for testing the MCP service.

    IMPORTANT: This tool takes NO parameters. Call it without any arguments.

    Returns basic system information and confirms the service is running.
    This is useful for testing connectivity and basic functionality.

    Parameters:
        None - This tool does not accept any parameters

    Returns:
        HealthCheckResponse: Health status and system information including:
            - status: "healthy" or "error"
            - timestamp: ISO format timestamp
            - service: Service name derived from APP_NAME config
            - version: Application version string
            - python_version: Python version
            - platform: Operating system platform

    Example:
        # Correct - no parameters
        health_check()

        # Incorrect - do not pass any arguments
        # health_check(request={})  # This will cause validation errors
    """
    # Get app name from config (safe to do outside try block)
    app_name = current_app.config.get("APP_NAME", "Zobi")
    service_name = f"{app_name} MCP Service"

    try:
        with event_logger.log_context(action="mcp.health_check.status"):
            # Get version from Zobi version metadata
            version_metadata = get_version_metadata()
            version = version_metadata.get("version_string", "unknown")

        response = HealthCheckResponse(
            status="healthy",
            timestamp=datetime.datetime.now().isoformat(),
            service=service_name,
            version=version,
            python_version=platform.python_version(),
            platform=platform.system(),
            uptime_seconds=round(time.monotonic() - _start_time, 1),
        )

        logger.info("Health check completed successfully")
        return response

    except Exception as e:
        logger.error("Health check failed: %s", e)
        # Return error status but don't raise to keep tool working
        response = HealthCheckResponse(
            status="error",
            timestamp=datetime.datetime.now().isoformat(),
            service=service_name,
            version="unknown",
            python_version=platform.python_version(),
            platform=platform.system(),
        )
        return response
