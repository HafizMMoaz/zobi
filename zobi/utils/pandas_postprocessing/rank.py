from __future__ import annotations

import pandas as pd


def rank(
    df: pd.DataFrame,
    metric: str,
    group_by: str | None = None,
) -> pd.DataFrame:
    """
    Calculates the rank of a metric within a group.

    :param df: N-dimensional DataFrame.
    :param metric: The metric to rank.
    :param group_by: The column to group by.
    :return: a flat DataFrame
    """
    if group_by:
        gb = df.groupby(group_by, group_keys=False)
        df["rank"] = gb.apply(lambda x: x[metric].rank(pct=True))
    else:
        df["rank"] = df[metric].rank(pct=True)
    return df
