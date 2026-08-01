"""drop postgres enum constrains for tags

Revision ID: 07f9a902af1b
Revises: b5ea9d343307
Create Date: 2023-03-29 20:30:10.214951

"""

# revision identifiers, used by Alembic.
revision = "07f9a902af1b"
down_revision = "b5ea9d343307"

from alembic import op  # noqa: E402
from sqlalchemy.dialects import postgresql  # noqa: E402


def upgrade():
    conn = op.get_bind()
    if isinstance(conn.dialect, postgresql.dialect):
        conn.execute(
            'ALTER TABLE "tagged_object" ALTER COLUMN "object_type" TYPE VARCHAR'
        )
        conn.execute('ALTER TABLE "tag" ALTER COLUMN "type" TYPE VARCHAR')
        conn.execute("DROP TYPE IF EXISTS objecttypes")
        conn.execute("DROP TYPE IF EXISTS tagtypes")


def downgrade():
    # Leaving the column type as VARCHAR in case the column contains values that
    # do not comply with the previous enum type
    pass
