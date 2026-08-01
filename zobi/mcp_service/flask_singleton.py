"""
Simple module-level Flask app instance for MCP service.

Following the Stack Overflow recommendation:
"a simple module with just the instance is enough"
- The module itself acts as the singleton
- No need for complex patterns or metaclasses
- Clean and Pythonic approach
"""

import logging

from flask import current_app, Flask, has_app_context

logger = logging.getLogger(__name__)

logger.info("Creating Flask app instance for MCP service")

try:
    from zobi.extensions import appbuilder

    # Check if appbuilder is already initialized (main Zobi app is running).
    # If so, reuse that app to avoid corrupting the shared appbuilder singleton.
    # Calling create_app() again would re-initialize appbuilder and break views.
    #
    # NOTE: appbuilder.app now returns a LocalProxy to current_app (Flask-AppBuilder
    # deprecation), so we can't use `appbuilder.app is not None` as that always
    # returns True (compares LocalProxy object, not the resolved value).
    # Instead, check if init_app was called by looking at _session.
    appbuilder_initialized = appbuilder._session is not None

    if appbuilder_initialized and has_app_context():
        # We're in an app context (e.g., during main Zobi startup),
        # so we can get the actual Flask app instance from current_app
        logger.info("Reusing existing Flask app from app context for MCP service")
        # Use _get_current_object() to get the actual Flask app, not the LocalProxy
        app = current_app._get_current_object()
    elif appbuilder_initialized:
        # appbuilder is initialized but we have no app context. Calling
        # create_app() here would invoke appbuilder.init_app() a second
        # time with a *different* Flask app, overwriting shared internal
        # state (views, security manager, etc.).  Fail loudly instead of
        # silently corrupting the singleton.
        raise RuntimeError(
            "appbuilder is already initialized but no Flask app context is "
            "available.  Cannot call create_app() as it would re-initialize "
            "appbuilder with a different Flask app instance."
        )
    else:
        # Standalone MCP server — Zobi models are deeply coupled to
        # appbuilder, security_manager, event_logger, encrypted_field_factory,
        # etc. so we use create_app() for full initialization rather than
        # trying to init a minimal subset (which leads to cascading failures).
        #
        # create_app() is safe here because in standalone mode the main
        # Zobi web server is not running in-process.
        from zobi.app import create_app
        from zobi.mcp_service.mcp_config import get_mcp_config

        logger.info("Creating fully initialized Flask app for standalone MCP service")
        _mcp_app = create_app()
        _mcp_app.debug = False

        # Apply MCP-specific configuration on top
        mcp_config = get_mcp_config(_mcp_app.config)
        _mcp_app.config.update(mcp_config)

        with _mcp_app.app_context():
            from zobi.core.mcp.core_mcp_injection import (
                initialize_core_mcp_dependencies,
            )

            initialize_core_mcp_dependencies()

        app = _mcp_app
        logger.info("Flask app fully initialized for standalone MCP service")

except Exception as e:
    logger.error("Failed to create Flask app: %s", e)
    raise


def get_flask_app() -> Flask:
    """
    Get the Flask app instance.

    Returns:
        Flask: The module-level Flask app instance
    """
    return app
