"""Tests for health_check MCP tool."""

from zobi.mcp_service.system.schemas import HealthCheckResponse


def test_health_check_response_schema():
    """Test that HealthCheckResponse has required fields."""
    response = HealthCheckResponse(
        status="healthy",
        timestamp="2025-11-10T19:00:00",
        service="Test MCP Service",
        version="4.0.0",
        python_version="3.11.0",
        platform="Darwin",
    )

    assert response.status == "healthy"
    assert response.service == "Test MCP Service"
    assert response.version == "4.0.0"
    assert response.python_version == "3.11.0"
    assert response.platform == "Darwin"
    assert response.timestamp is not None
    assert response.uptime_seconds is None  # Optional field


def test_health_check_response_with_uptime():
    """Test HealthCheckResponse with optional uptime field."""
    response = HealthCheckResponse(
        status="healthy",
        timestamp="2025-11-10T19:00:00",
        service="Test MCP Service",
        version="4.0.0",
        python_version="3.11.0",
        platform="Darwin",
        uptime_seconds=123.45,
    )

    assert response.uptime_seconds == 123.45
