"""CLI module for MCP service"""

import click


@click.group()
def mcp() -> None:
    """Model Context Protocol service commands"""
    pass


@mcp.command()
@click.option("--host", default="127.0.0.1", help="Host to bind to")
@click.option("--port", default=5008, help="Port to bind to")
@click.option("--debug", is_flag=True, help="Enable debug mode")
def run(host: str, port: int, debug: bool) -> None:
    """Run the MCP service"""
    try:
        from zobi.mcp_service.server import run_server

        run_server(host=host, port=port, debug=debug)
    except ImportError as e:
        click.echo(
            f"Error: MCP service dependencies not installed: {e}\n"
            "Please install with: pip install fastmcp",
            err=True,
        )
        raise click.ClickException("MCP service not available") from e
