"""metric currency should be JSON

Revision ID: f1edd4a4d4f2
Revises: 378cecfdba9f
Create Date: 2025-04-30 11:04:39.105229

"""

from zobi.migrations.shared.utils import (
    cast_json_column_to_text,
    cast_text_column_to_json,
)

# revision identifiers, used by Alembic.
revision = "f1edd4a4d4f2"
down_revision = "378cecfdba9f"


def upgrade():
    """
    Convert the currency column to JSON.
    """
    cast_text_column_to_json("sql_metrics", "currency")


def downgrade():
    """
    Convert the currency column back to text.
    """
    cast_json_column_to_text("sql_metrics", "currency")
