"""
MCP-specific form data command that extends the base CreateFormDataCommand
"""

from zobi.commands.explore.form_data.create import CreateFormDataCommand
from zobi.utils.core import get_user_id


class MCPCreateFormDataCommand(CreateFormDataCommand):
    """
    MCP-specific CreateFormDataCommand that uses user_id instead of session._id
    """

    def _get_session_id(self) -> str:
        """Override to use user_id instead of Flask session for MCP context."""
        return str(get_user_id())
