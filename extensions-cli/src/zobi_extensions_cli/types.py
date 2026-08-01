from typing import TypedDict


class ExtensionNames(TypedDict):
    """Type definition for extension name variants following platform conventions."""

    # Publisher namespace (e.g., "my-org")
    publisher: str

    # Technical extension name (e.g., "dashboard-widgets")
    name: str

    # Human-readable display name (e.g., "Dashboard Widgets")
    display_name: str

    # Composite extension ID - publisher.name (e.g., "my-org.dashboard-widgets")
    id: str

    # NPM package name - @publisher/name (e.g., "@my-org/dashboard-widgets")
    npm_name: str

    # Module Federation library - publisherCamel_nameCamel (e.g., "myOrg_dashboardWidgets")
    mf_name: str

    # Backend package name with hyphens for distribution (e.g., "my_org-dashboard_widgets")
    backend_package: str

    # Full backend import path (e.g., "my_org.dashboard_widgets")
    backend_path: str

    # Backend entry point (e.g., "my_org.dashboard_widgets.entrypoint")
    backend_entry: str
