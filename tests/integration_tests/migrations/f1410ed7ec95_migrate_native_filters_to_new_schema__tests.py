from copy import deepcopy
from importlib import import_module

migrate_native_filters_to_new_schema = import_module(
    "zobi.migrations.versions."
    "2021-04-29_15-32_f1410ed7ec95_migrate_native_filters_to_new_schema",
)
downgrade_dashboard = migrate_native_filters_to_new_schema.downgrade_dashboard
upgrade_dashboard = migrate_native_filters_to_new_schema.upgrade_dashboard

dashboard_v1 = {
    "native_filter_configuration": [
        {
            "filterType": "filter_select",
            "cascadingFilters": True,
            "defaultValue": ["Albania", "Algeria"],
        },
    ],
    "filter_sets_configuration": [
        {
            "nativeFilters": {
                "FILTER": {
                    "filterType": "filter_select",
                    "cascadingFilters": True,
                    "defaultValue": ["Albania", "Algeria"],
                },
            },
        },
    ],
}


dashboard_v2 = {
    "native_filter_configuration": [
        {
            "filterType": "filter_select",
            "cascadingFilters": True,
            "defaultDataMask": {
                "filterState": {
                    "value": ["Albania", "Algeria"],
                },
            },
        }
    ],
    "filter_sets_configuration": [
        {
            "nativeFilters": {
                "FILTER": {
                    "filterType": "filter_select",
                    "cascadingFilters": True,
                    "defaultDataMask": {
                        "filterState": {
                            "value": ["Albania", "Algeria"],
                        },
                    },
                },
            },
        },
    ],
}


def test_upgrade_dashboard():
    """
    ensure that dashboard upgrade operation produces a correct dashboard object
    """
    converted_dashboard = deepcopy(dashboard_v1)
    filters, filter_sets = upgrade_dashboard(converted_dashboard)
    assert filters == 1
    assert filter_sets == 1
    assert dashboard_v2 == converted_dashboard


def test_downgrade_dashboard():
    """
    ensure that dashboard downgrade operation produces a correct dashboard object
    """
    converted_dashboard = deepcopy(dashboard_v2)
    filters, filter_sets = downgrade_dashboard(converted_dashboard)
    assert filters == 1
    assert filter_sets == 1
    assert dashboard_v1 == converted_dashboard
