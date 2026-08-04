"""Guards the storage type of the gateway's encrypted columns.

This exists because of a real production failure. The original migration
created ``llm_providers.encrypted_params`` as ``Text``, while the ORM declares
it through ``encrypted_field_factory``, whose underlying implementation is
``LargeBinary``. On Postgres that produced a ``text`` column holding what the
driver returned as ``str``, and SQLAlchemy's ``LargeBinary`` result processor
then called ``bytes(value)`` on it:

    TypeError: string argument without an encoding

Every read of the table raised, so the second provider anyone created failed
with a 500 (the first succeeded only because an empty table means no row is
ever decoded).

The whole existing test suite missed it because it runs on SQLite, which has
dynamic type affinity and round-trips a str through a TEXT column happily.
These tests therefore assert the *declared* types rather than exercising a
round trip, since a SQLite round trip cannot reproduce the bug.

Zobi already hit this once before, on ``dbs.encrypted_extra``: see the
migration ``c2acd2cf3df2_alter_type_of_dbs_encrypted_extra``, which converts
``Text`` to ``LargeBinary`` with ``postgresql_using="encrypted_extra::bytea"``.
"""

from pathlib import Path

import pytest
from sqlalchemy import LargeBinary

import zobi.migrations.versions as versions_pkg
from zobi.models.llm import LLMProvider

#: Every ORM column on the gateway tables that stores encrypted data.
ENCRYPTED_COLUMNS = [(LLMProvider, "encrypted_params")]

MIGRATION_FILENAME = "2026-08-04_00-00_c7a1f92be3d4_add_llm_gateway_tables.py"


@pytest.mark.parametrize("model,column_name", ENCRYPTED_COLUMNS)
def test_encrypted_columns_are_backed_by_large_binary(
    model: type, column_name: str, app_context: None
) -> None:
    """The ORM stores ciphertext as binary, so the database column must be too."""
    column_type = model.__table__.c[column_name].type

    assert hasattr(column_type, "impl"), (
        f"{model.__name__}.{column_name} is not an encrypted column type"
    )
    assert isinstance(column_type.impl, LargeBinary), (
        f"{model.__name__}.{column_name} is backed by "
        f"{type(column_type.impl).__name__}, not LargeBinary"
    )


def _migration_source() -> str:
    path = Path(versions_pkg.__file__).parent / MIGRATION_FILENAME
    assert path.exists(), f"migration {MIGRATION_FILENAME} not found at {path}"
    return path.read_text(encoding="utf-8")


def test_migration_creates_encrypted_params_as_large_binary() -> None:
    """The migration must declare the same storage type the ORM expects.

    Asserted against the migration source because the column is created inside
    the ``upgrade()`` function body, and because running the migration under
    SQLite would pass either way.
    """
    source = _migration_source()

    assert 'Column("encrypted_params", LargeBinary' in source, (
        "encrypted_params must be created as LargeBinary (bytea on Postgres). "
        "Declaring it as Text makes every read of llm_providers raise "
        "'string argument without an encoding' on Postgres."
    )
    assert 'Column("encrypted_params", Text' not in source, (
        "encrypted_params is declared as Text, which does not match the "
        "EncryptedType/LargeBinary column the ORM declares."
    )


def test_migration_still_uses_text_for_non_secret_columns() -> None:
    """Guards against over-correcting the fix.

    ``params`` and ``last_test_error`` are plain strings and must stay Text;
    only the encrypted column changes.
    """
    source = _migration_source()

    assert 'Column("params", Text' in source
    assert 'Column("last_test_error", Text' in source
