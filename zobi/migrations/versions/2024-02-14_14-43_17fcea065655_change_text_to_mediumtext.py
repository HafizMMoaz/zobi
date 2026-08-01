"""change_text_to_mediumtext

Revision ID: 17fcea065655
Revises: 87d38ad83218
Create Date: 2024-02-14 14:43:39.898093

"""

# revision identifiers, used by Alembic.
revision = "17fcea065655"
down_revision = "87d38ad83218"

import sqlalchemy as sa  # noqa: E402
from alembic import op  # noqa: E402
from sqlalchemy.dialects.mysql import MEDIUMTEXT, TEXT  # noqa: E402
from sqlalchemy.dialects.mysql.base import MySQLDialect  # noqa: E402

from zobi.migrations.shared.utils import get_table_column  # noqa: E402
from zobi.utils.core import MediumText  # noqa: E402

TABLE_COLUMNS = [
    "annotation.json_metadata",
    "css_templates.css",
    "dashboards.css",
    "keyvalue.value",
    "query.extra_json",
    "report_execution_log.value_row_json",
    "report_recipient.recipient_config_json",
    "report_schedule.sql",
    "report_schedule.last_value_row_json",
    "report_schedule.validator_config_json",
    "report_schedule.extra_json",
    "row_level_security_filters.clause",
    "saved_query.sql",
    "saved_query.extra_json",
    "sl_columns.extra_json",
    "sl_datasets.extra_json",
    "sl_tables.extra_json",
    "slices.params",
    "slices.query_context",
    "ssh_tunnels.extra_json",
    "tab_state.extra_json",
    "tab_state.sql",
    "table_schema.extra_json",
]

NOT_NULL_COLUMNS = ["keyvalue.value", "row_level_security_filters.clause"]


def upgrade():
    if isinstance(op.get_bind().dialect, MySQLDialect):
        for item in TABLE_COLUMNS:
            table_name, column_name = item.split(".")

            if (column := get_table_column(table_name, column_name)) and isinstance(
                column["type"],
                TEXT,
            ):
                with op.batch_alter_table(table_name) as batch_op:
                    batch_op.alter_column(
                        column_name,
                        existing_type=sa.Text(),
                        type_=MediumText(),
                        existing_nullable=item not in NOT_NULL_COLUMNS,
                    )


def downgrade():
    if isinstance(op.get_bind().dialect, MySQLDialect):
        for item in TABLE_COLUMNS:
            table_name, column_name = item.split(".")

            if (column := get_table_column(table_name, column_name)) and isinstance(
                column["type"],
                MEDIUMTEXT,
            ):
                with op.batch_alter_table(table_name) as batch_op:
                    batch_op.alter_column(
                        column_name,
                        existing_type=MediumText(),
                        type_=sa.Text(),
                        existing_nullable=item not in NOT_NULL_COLUMNS,
                    )
