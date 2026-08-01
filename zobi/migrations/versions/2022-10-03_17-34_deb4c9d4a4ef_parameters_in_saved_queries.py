"""parameters in saved queries

Revision ID: deb4c9d4a4ef
Revises: 291f024254b5
Create Date: 2022-10-03 17:34:00.721559

"""

# revision identifiers, used by Alembic.
revision = "deb4c9d4a4ef"
down_revision = "291f024254b5"

import sqlalchemy as sa  # noqa: E402
from alembic import op  # noqa: E402


def upgrade():
    op.add_column(
        "saved_query",
        sa.Column(
            "template_parameters",
            sa.TEXT(),
            nullable=True,
        ),
    )


def downgrade():
    with op.batch_alter_table("saved_query") as batch_op:
        batch_op.drop_column("template_parameters")
