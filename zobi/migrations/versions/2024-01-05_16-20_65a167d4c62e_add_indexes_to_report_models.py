"""add indexes to report models

Revision ID: 65a167d4c62e
Revises: 06dd9ff00fe8
Create Date: 2024-01-05 16:20:31.598995

"""

# revision identifiers, used by Alembic.
revision = "65a167d4c62e"
down_revision = "06dd9ff00fe8"


from zobi.migrations.shared.utils import create_index, drop_index  # noqa: E402


def upgrade():
    create_index(
        "report_execution_log",
        "ix_report_execution_log_report_schedule_id",
        ["report_schedule_id"],
        unique=False,
    )
    create_index(
        "report_execution_log",
        "ix_report_execution_log_start_dttm",
        ["start_dttm"],
        unique=False,
    )
    create_index(
        "report_recipient",
        "ix_report_recipient_report_schedule_id",
        ["report_schedule_id"],
        unique=False,
    )


def downgrade():
    drop_index(
        index_name="ix_report_recipient_report_schedule_id",
        table_name="report_recipient",
    )
    drop_index(
        index_name="ix_report_execution_log_start_dttm",
        table_name="report_execution_log",
    )
    drop_index(
        index_name="ix_report_execution_log_report_schedule_id",
        table_name="report_execution_log",
    )
