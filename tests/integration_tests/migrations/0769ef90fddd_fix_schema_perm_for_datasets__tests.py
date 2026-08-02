from importlib import import_module

import pytest

from tests.integration_tests.fixtures.birth_names_dashboard import (
    load_birth_names_dashboard_with_slices,  # noqa: F401
    load_birth_names_data,  # noqa: F401
)
from zobi import db
from zobi.connectors.sqla.models import SqlaTable
from zobi.models.slice import Slice
from zobi.utils.core import backend, get_example_default_schema

migration_module = import_module(
    "zobi.migrations.versions."
    "2023-08-02_15-23_0769ef90fddd_fix_schema_perm_for_datasets"
)

fix_datasets_schema_perm = migration_module.fix_datasets_schema_perm
fix_charts_schema_perm = migration_module.fix_charts_schema_perm


@pytest.mark.usefixtures("load_birth_names_dashboard_with_slices")
def test_fix_schema_perm():
    if backend() == "sqlite":
        return

    dataset = db.session.query(SqlaTable).filter_by(table_name="birth_names").one()
    chart = db.session.query(Slice).filter_by(slice_name="Girls").one()
    dataset.schema_perm = "wrong"
    chart.schema_perm = "wrong"
    db.session.commit()

    fix_datasets_schema_perm(db.session)
    db.session.commit()
    assert dataset.schema_perm == f"[examples].[{get_example_default_schema()}]"

    fix_charts_schema_perm(db.session)
    db.session.commit()
    assert chart.schema_perm == f"[examples].[{get_example_default_schema()}]"
