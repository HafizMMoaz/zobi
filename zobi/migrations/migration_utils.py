
from alembic.operations import Operations
from sqlalchemy.engine.reflection import Inspector

naming_convention = {
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
}


def create_unique_constraint(
    op: Operations, index_id: str, table_name: str, uix_columns: list[str]
) -> None:
    # Get the database connection and inspector
    bind = op.get_bind()
    inspector = Inspector.from_engine(bind)

    # Check if the unique constraint already exists
    existing_constraints = inspector.get_unique_constraints(table_name)
    for constraint in existing_constraints:
        if constraint["name"] == index_id:
            # Constraint already exists, no need to create it
            return

    # Create the unique constraint if it doesn't exist
    with op.batch_alter_table(
        table_name, naming_convention=naming_convention
    ) as batch_op:
        batch_op.create_unique_constraint(index_id, uix_columns)


def drop_unique_constraint(op: Operations, index_id: str, table_name: str) -> None:
    dialect = op.get_bind().dialect.name

    with op.batch_alter_table(
        table_name, naming_convention=naming_convention
    ) as batch_op:
        if dialect == "mysql":
            # MySQL requires specifying the type of constraint
            batch_op.drop_constraint(index_id, type_="unique")
        else:
            # For other databases, a standard drop_constraint call is sufficient
            batch_op.drop_constraint(index_id)
