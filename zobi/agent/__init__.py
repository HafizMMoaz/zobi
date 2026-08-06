"""The Zobi agent: conversation runtime over the existing MCP tools.

Layering, outermost first:

- ``api``        HTTP surface, including the SSE stream
- ``runtime``    drives one turn: model, tool calls, events
- ``permissions`` decides whether a tool call may run unattended
- ``tools``      bridges to the in-process MCP server

Tools are never reimplemented here. ``zobi/mcp_service`` already exposes them
with argument schemas and safety annotations, and calling through it means
every action runs under the requesting user's own RBAC.
"""
