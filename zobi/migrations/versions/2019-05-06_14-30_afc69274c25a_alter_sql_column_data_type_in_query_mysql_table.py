"""update the sql, select_sql, and executed_sql columns in the
   query table in mysql dbs to be long text columns

Revision ID: afc69274c25a
Revises: e9df189e5c7e
Create Date: 2019-05-06 14:30:26.181449

"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import mysql
from sqlalchemy.dialects.mysql.base import MySQLDialect

# revision identifiers, used by Alembic.
revision = "afc69274c25a"
down_revision = "e9df189e5c7e"


def upgrade():
    bind = op.get_bind()
    if isinstance(bind.dialect, MySQLDialect):
        with op.batch_alter_table("query") as batch_op:
            batch_op.alter_column("sql", existing_type=sa.Text, type_=mysql.LONGTEXT)
            batch_op.alter_column(
                "select_sql", existing_type=sa.Text, type_=mysql.LONGTEXT
            )
            batch_op.alter_column(
                "executed_sql", existing_type=sa.Text, type_=mysql.LONGTEXT
            )


def downgrade():
    bind = op.get_bind()
    if isinstance(bind.dialect, MySQLDialect):
        with op.batch_alter_table("query") as batch_op:
            batch_op.alter_column("sql", existing_type=mysql.LONGTEXT, type_=sa.Text)
            batch_op.alter_column(
                "select_sql", existing_type=mysql.LONGTEXT, type_=sa.Text
            )
            batch_op.alter_column(
                "executed_sql", existing_type=mysql.LONGTEXT, type_=sa.Text
            )
