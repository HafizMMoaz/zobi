from importlib import import_module

from zobi.utils import json

better_filters = import_module(
    "zobi.migrations.versions.2018-12-11_22-03_fb13d49b72f9_better_filters",
)
Slice = better_filters.Slice
upgrade_slice = better_filters.upgrade_slice


def test_upgrade_slice():
    slc = Slice(
        slice_name="FOO",
        viz_type="filter_box",
        params=json.dumps(dict(metric="foo", groupby=["bar"])),  # noqa: C408
    )
    upgrade_slice(slc)
    params = json.loads(slc.params)
    assert "metric" not in params
    assert "filter_configs" in params

    cfg = params["filter_configs"][0]
    assert cfg.get("metric") == "foo"
