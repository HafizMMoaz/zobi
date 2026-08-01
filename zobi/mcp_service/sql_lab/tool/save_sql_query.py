
"""
Save SQL Query MCP Tool

Tool for saving a SQL query as a named SavedQuery in Zobi,
so it appears in SQL Lab's "Saved Queries" list and can be
reloaded/shared via URL.
"""

import logging

from fastmcp import Context
from sqlalchemy.exc import SQLAlchemyError
from zobi_core.mcp.decorators import tool, ToolAnnotations

from zobi.errors import ErrorLevel, ZobiError, ZobiErrorType
from zobi.exceptions import ZobiErrorException, ZobiSecurityException
from zobi.extensions import event_logger
from zobi.mcp_service.sql_lab.schemas import (
    SaveSqlQueryRequest,
    SaveSqlQueryResponse,
)

logger = logging.getLogger(__name__)


@tool(
    tags=["mutate"],
    class_permission_name="SavedQuery",
    method_permission_name="write",
    annotations=ToolAnnotations(
        title="Save SQL query",
        readOnlyHint=False,
        destructiveHint=False,
    ),
)
async def save_sql_query(
    request: SaveSqlQueryRequest, ctx: Context
) -> SaveSqlQueryResponse:
    """Save a SQL query so it appears in SQL Lab's Saved Queries list.

    Creates a persistent SavedQuery that the user can reload from
    SQL Lab, share via URL, and find in the Saved Queries page.
    Requires a database_id, a label (name), and the SQL text.
    """
    await ctx.info(
        "Saving SQL query: database_id=%s, label=%r"
        % (request.database_id, request.label)
    )

    try:
        from flask import g

        from zobi import db, security_manager
        from zobi.daos.query import SavedQueryDAO
        from zobi.mcp_service.utils.url_utils import get_zobi_base_url
        from zobi.models.core import Database

        # 1. Validate database exists and user has access
        with event_logger.log_context(action="mcp.save_sql_query.db_validation"):
            database = (
                db.session.query(Database).filter_by(id=request.database_id).first()
            )
            if not database:
                raise ZobiErrorException(
                    ZobiError(
                        message=(f"Database with ID {request.database_id} not found"),
                        error_type=ZobiErrorType.DATABASE_NOT_FOUND_ERROR,
                        level=ErrorLevel.ERROR,
                    )
                )

            if not security_manager.can_access_database(database):
                raise ZobiSecurityException(
                    ZobiError(
                        message=(f"Access denied to database {database.database_name}"),
                        error_type=(ZobiErrorType.DATABASE_SECURITY_ACCESS_ERROR),
                        level=ErrorLevel.ERROR,
                    )
                )

        # 2. Create the saved query
        with event_logger.log_context(action="mcp.save_sql_query.create"):
            saved_query = SavedQueryDAO.create(
                attributes={
                    "user_id": g.user.id,
                    "db_id": request.database_id,
                    "label": request.label,
                    "sql": request.sql,
                    "schema": request.schema_name or "",
                    "catalog": request.catalog,
                    "description": request.description or "",
                }
            )
            db.session.commit()  # pylint: disable=consider-using-transaction

        # 3. Build response
        base_url = get_zobi_base_url()
        saved_query_url = f"{base_url}/sqllab?savedQueryId={saved_query.id}"

        await ctx.info(
            "Saved query created: id=%s, url=%s" % (saved_query.id, saved_query_url)
        )

        return SaveSqlQueryResponse(
            id=saved_query.id,
            label=saved_query.label,
            sql=saved_query.sql,
            database_id=saved_query.db_id,
            schema_name=saved_query.schema or None,
            catalog=getattr(saved_query, "catalog", None),
            description=saved_query.description or None,
            url=saved_query_url,
        )

    except (ZobiErrorException, ZobiSecurityException):
        raise
    except SQLAlchemyError as e:
        from zobi import db

        db.session.rollback()  # pylint: disable=consider-using-transaction
        await ctx.error(
            "Failed to save SQL query: error=%s, database_id=%s"
            % (str(e), request.database_id)
        )
        raise
