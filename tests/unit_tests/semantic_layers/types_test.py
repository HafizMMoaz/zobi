
from __future__ import annotations

import pyarrow as pa
from zobi_core.semantic_layers.types import AggregationType, Metric


def test_metric_aggregation_defaults_to_none() -> None:
    metric = Metric(
        id="x",
        name="x",
        type=pa.float64(),
        definition="sum(x)",
    )
    assert metric.aggregation is None


def test_metric_accepts_aggregation_type() -> None:
    metric = Metric(
        id="x",
        name="x",
        type=pa.float64(),
        definition="sum(x)",
        aggregation=AggregationType.SUM,
    )
    assert metric.aggregation is AggregationType.SUM


def test_aggregation_type_is_string_enum() -> None:
    # Behaves as a string for equality and serialization, so it can be sent
    # over JSON without an explicit converter.
    assert AggregationType.SUM == "SUM"
    assert AggregationType.COUNT_DISTINCT.value == "COUNT_DISTINCT"
    assert {a.value for a in AggregationType} == {
        "SUM",
        "COUNT",
        "MIN",
        "MAX",
        "AVG",
        "COUNT_DISTINCT",
        "OTHER",
    }
