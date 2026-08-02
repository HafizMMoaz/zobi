import random

import pandas as pd
import pytest
from sqlalchemy import column, Float, String

from tests.integration_tests.dashboard_utils import create_slice, create_table_metadata
from tests.integration_tests.test_app import app
from zobi import db
from zobi.connectors.sqla.models import SqlaTable, SqlMetric
from zobi.models.slice import Slice
from zobi.utils.core import get_example_default_schema
from zobi.utils.database import get_example_database

misc_dash_slices: set[str] = set()


ENERGY_USAGE_TBL_NAME = "energy_usage"


@pytest.fixture(scope="session")
def load_energy_table_data():
    with app.app_context():
        database = get_example_database()
        with database.get_sqla_engine() as engine:
            df = _get_dataframe()
            df.to_sql(
                ENERGY_USAGE_TBL_NAME,
                engine,
                if_exists="replace",
                chunksize=500,
                index=False,
                dtype={"source": String(255), "target": String(255), "value": Float()},
                method="multi",
                schema=get_example_default_schema(),
            )
    yield
    with app.app_context():
        with get_example_database().get_sqla_engine() as engine:
            engine.execute("DROP TABLE IF EXISTS energy_usage")


@pytest.fixture
def load_energy_table_with_slice(load_energy_table_data):
    with app.app_context():
        slices = _create_energy_table()
        yield slices
        _cleanup()


def _get_dataframe():
    data = _get_energy_data()
    return pd.DataFrame.from_dict(data)


def _create_energy_table() -> list[Slice]:
    table = create_table_metadata(
        table_name=ENERGY_USAGE_TBL_NAME,
        database=get_example_database(),
        table_description="Energy consumption",
    )
    table.fetch_metadata()

    if not any(col.metric_name == "sum__value" for col in table.metrics):
        col = str(column("value").compile(db.engine))
        table.metrics.append(
            SqlMetric(metric_name="sum__value", expression=f"SUM({col})")
        )
    table.fetch_metadata()

    slices = []
    for slice_data in _get_energy_slices():
        slice = _create_and_commit_energy_slice(
            table,
            slice_data["slice_title"],
            slice_data["viz_type"],
            slice_data["params"],
        )
        slices.append(slice)
    return slices


def _create_and_commit_energy_slice(
    table: SqlaTable, title: str, viz_type: str, param: dict[str, str]
):
    slice = create_slice(title, viz_type, table, param)
    existing_slice = (
        db.session.query(Slice).filter_by(slice_name=slice.slice_name).first()
    )
    if existing_slice:
        db.session.delete(existing_slice)
    db.session.add(slice)
    db.session.commit()
    return slice


def _cleanup() -> None:
    for slice_data in _get_energy_slices():
        slice = (
            db.session.query(Slice)
            .filter_by(slice_name=slice_data["slice_title"])
            .first()
        )
        db.session.delete(slice)

    metric = (
        db.session.query(SqlMetric).filter_by(metric_name="sum__value").one_or_none()
    )
    if metric:
        db.session.delete(metric)

    db.session.commit()


def _get_energy_data():
    data = []
    for i in range(85):
        data.append(
            {
                "source": f"energy_source{i}",
                "target": f"energy_target{i}",
                "value": random.uniform(0.1, 11.0),  # noqa: S311
            }
        )
    return data


def _get_energy_slices():
    return [
        {
            "slice_title": "Energy Sankey",
            "viz_type": "sankey",
            "params": {
                "collapsed_fieldsets": "",
                "groupby": ["source", "target"],
                "metric": "sum__value",
                "row_limit": "5000",
                "slice_name": "Energy Sankey",
                "viz_type": "sankey",
            },
        },
        {
            "slice_title": "Energy Force Layout",
            "viz_type": "graph_chart",
            "params": {
                "source": "source",
                "target": "target",
                "edgeLength": 400,
                "repulsion": 1000,
                "layout": "force",
                "metric": "sum__value",
                "row_limit": "5000",
                "slice_name": "Force",
                "viz_type": "graph_chart",
            },
        },
        {
            "slice_title": "Heatmap",
            "viz_type": "heatmap",
            "params": {
                "all_columns_x": "source",
                "all_columns_y": "target",
                "canvas_image_rendering": "pixelated",
                "collapsed_fieldsets": "",
                "linear_color_scheme": "blue_white_yellow",
                "metric": "sum__value",
                "normalize_across": "heatmap",
                "slice_name": "Heatmap",
                "viz_type": "heatmap",
                "xscale_interval": "1",
                "yscale_interval": "1",
            },
            "query_context": '{"datasource":{"id":12,"type":"table"},"force":false,"queries":[{"time_range":" : ","filters":[],"extras":{"time_grain_sqla":null,"having":"","where":""},"applied_time_extras":{},"columns":[],"metrics":[],"annotation_layers":[],"row_limit":5000,"timeseries_limit":0,"order_desc":true,"url_params":{},"custom_params":{},"custom_form_data":{}}],"result_format":"json","result_type":"full"}',  # noqa: E501
        },
    ]
