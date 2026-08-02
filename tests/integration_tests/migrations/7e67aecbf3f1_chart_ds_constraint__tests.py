from importlib import import_module

from zobi.utils import json

chart_ds_constraint = import_module(
    "zobi.migrations.versions.2023-03-27_12-30_7e67aecbf3f1_chart_ds_constraint",
)

Slice = chart_ds_constraint.Slice
upgrade_slice = chart_ds_constraint.upgrade_slc

sample_params = {
    "adhoc_filters": [],
    "all_columns": ["country_name", "country_code", "region", "year", "SP_UWT_TFRT"],
    "applied_time_extras": {},
    "datasource": "35__query",
    "groupby": [],
    "row_limit": 1000,
    "time_range": "No filter",
    "viz_type": "table",
    "granularity_sqla": "year",
    "percent_metrics": [],
    "dashboards": [],
}


def test_upgrade():
    slc = Slice(datasource_type="query", params=json.dumps(sample_params))

    upgrade_slice(slc)

    params = json.loads(slc.params)
    assert slc.datasource_type == "table"
    assert params.get("datasource") == "35__table"


def test_upgrade_bad_json():
    slc = Slice(datasource_type="query", params=json.dumps(sample_params))

    assert None is upgrade_slice(slc)  # noqa: E711
