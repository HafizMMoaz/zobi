import logging
from typing import Any

from fastmcp import Context
from zobi_core.mcp.decorators import tool, ToolAnnotations

from zobi.extensions import event_logger
from zobi.mcp_service.dataset.schemas import (
    CreateVirtualDatasetRequest,
    CreateVirtualDatasetResponse,
)

logger = logging.getLogger(__name__)


@tool(
    tags=["mutate"],
    class_permission_name="Dataset",
    method_permission_name="write",
    annotations=ToolAnnotations(
        title="Create virtual dataset from SQL",
        readOnlyHint=False,
        destructiveHint=False,
    ),
)
async def create_virtual_dataset(
    request: CreateVirtualDatasetRequest, ctx: Context
) -> CreateVirtualDatasetResponse:
    """Save a SQL query as a virtual dataset so it can be charted.

    Use this tool when a user wants to visualize data from a SQL query
    (e.g., a JOIN or complex aggregation) that doesn't map to a single
    physical table.

    Workflow:
    1. Call this tool with the SQL query and a dataset name
    2. Use the returned ``id`` as the ``dataset_id`` in generate_chart or
       generate_explore_link
    3. Use the returned ``columns`` list to pick columns for the chart config
    """
    await ctx.info(
        "Creating virtual dataset: database_id=%s, dataset_name=%r"
        % (request.database_id, request.dataset_name)
    )

    try:
        from zobi.commands.dataset.create import CreateDatasetCommand
        from zobi.commands.dataset.exceptions import (
            DatasetCreateFailedError,
            DatasetInvalidError,
        )
        from zobi.mcp_service.utils.url_utils import get_zobi_base_url

        # Create the virtual dataset — CreateDatasetCommand enforces access control
        # and validates that the database exists (raises DatasetInvalidError otherwise)
        with event_logger.log_context(action="mcp.create_virtual_dataset.create"):
            properties: dict[str, Any] = {
                "database": request.database_id,
                "table_name": request.dataset_name,
                "sql": request.sql,
            }
            if request.schema_name is not None:
                properties["schema"] = request.schema_name
            if request.catalog is not None:
                properties["catalog"] = request.catalog
            if request.description is not None:
                properties["description"] = request.description

            dataset = CreateDatasetCommand(properties).run()

        # Build response
        columns = [col.column_name for col in dataset.columns]
        dataset_url = (
            f"{get_zobi_base_url()}"
            f"/explore/?datasource_type=table&datasource_id={dataset.id}"
        )

        await ctx.info(
            "Virtual dataset created: id=%s, dataset_name=%r, columns=%s"
            % (dataset.id, dataset.table_name, columns)
        )

        return CreateVirtualDatasetResponse(
            id=dataset.id,
            dataset_name=dataset.table_name,
            sql=request.sql,
            database_id=request.database_id,
            columns=columns,
            url=dataset_url,
        )

    except DatasetInvalidError as exc:
        messages = exc.normalized_messages()
        await ctx.warning("Virtual dataset validation failed: %s" % (messages,))
        return CreateVirtualDatasetResponse(
            id=None,
            dataset_name=request.dataset_name,
            sql=request.sql,
            database_id=request.database_id,
            columns=[],
            url=None,
            error=str(messages),
        )
    except DatasetCreateFailedError as exc:
        await ctx.error("Virtual dataset creation failed: %s" % (str(exc),))
        return CreateVirtualDatasetResponse(
            id=None,
            dataset_name=request.dataset_name,
            sql=request.sql,
            database_id=request.database_id,
            columns=[],
            url=None,
            error=f"Failed to create dataset: {exc}",
        )
    except Exception as exc:
        await ctx.error(
            "Unexpected error creating virtual dataset: %s: %s"
            % (type(exc).__name__, str(exc))
        )
        raise
