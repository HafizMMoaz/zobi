from __future__ import annotations

import logging
from datetime import datetime
from typing import Dict, List

from flask_appbuilder.models.sqla.interface import SQLAInterface
from sqlalchemy import or_, select
from sqlalchemy.orm import Query

from zobi.charts.filters import ChartFilter
from zobi.commands.chart.exceptions import ChartNotFoundError
from zobi.daos.base import BaseDAO, ColumnOperator, ColumnOperatorEnum
from zobi.extensions import db
from zobi.models.core import FavStar, FavStarClassName
from zobi.models.slice import id_or_uuid_filter, Slice, slice_user
from zobi.utils.core import get_user_id

logger = logging.getLogger(__name__)

# Custom filterable fields for charts
CHART_CUSTOM_FIELDS = {
    "viz_type": ["eq", "in", "like"],
    "datasource_name": ["eq", "in", "like"],
    "owner": ["eq", "in"],
}


class ChartDAO(BaseDAO[Slice]):
    base_filter = ChartFilter

    @classmethod
    def apply_column_operators(
        cls,
        query: Query,
        column_operators: list[ColumnOperator] | None = None,
    ) -> Query:
        """Override to handle owner filter via the slice_user M2M table."""
        if not column_operators:
            return query

        remaining_operators: list[ColumnOperator] = []
        for c in column_operators:
            if not isinstance(c, ColumnOperator):
                c = ColumnOperator.model_validate(c)
            if c.col == "owner":
                operator_enum = ColumnOperatorEnum(c.opr)
                subq = select(slice_user.c.slice_id).where(
                    operator_enum.apply(slice_user.c.user_id, c.value)
                )
                query = query.filter(
                    Slice.id.in_(subq)  # type: ignore[attr-defined,unused-ignore]
                )
            elif c.col == "created_by_fk_or_owner":
                if c.opr != "eq":
                    raise ValueError(
                        f"created_by_fk_or_owner only supports 'eq'; got '{c.opr}'"
                    )
                owner_subq = select(slice_user.c.slice_id).where(
                    slice_user.c.user_id == c.value
                )
                query = query.filter(
                    or_(
                        Slice.created_by_fk == c.value,  # type: ignore[attr-defined,unused-ignore]
                        Slice.id.in_(owner_subq),  # type: ignore[attr-defined,unused-ignore]
                    )
                )
            else:
                remaining_operators.append(c)

        if remaining_operators:
            query = super().apply_column_operators(query, remaining_operators)
        return query

    @classmethod
    def get_filterable_columns_and_operators(cls) -> Dict[str, List[str]]:
        filterable = super().get_filterable_columns_and_operators()
        # Add custom fields for charts
        filterable.update(CHART_CUSTOM_FIELDS)
        return filterable

    @staticmethod
    def get_by_id_or_uuid(id_or_uuid: str) -> Slice:
        query = db.session.query(Slice).filter(id_or_uuid_filter(id_or_uuid))
        # Apply chart base filters
        query = ChartFilter("id", SQLAInterface(Slice, db.session)).apply(query, None)
        chart = query.one_or_none()
        if not chart:
            raise ChartNotFoundError()
        return chart

    @staticmethod
    def favorited_ids(charts: list[Slice]) -> list[FavStar]:
        ids = [chart.id for chart in charts]
        return [
            star.obj_id
            for star in db.session.query(FavStar.obj_id)
            .filter(
                FavStar.class_name == FavStarClassName.CHART,
                FavStar.obj_id.in_(ids),
                FavStar.user_id == get_user_id(),
            )
            .all()
        ]

    @staticmethod
    def add_favorite(chart: Slice) -> None:
        ids = ChartDAO.favorited_ids([chart])
        if chart.id not in ids:
            db.session.add(
                FavStar(
                    class_name=FavStarClassName.CHART,
                    obj_id=chart.id,
                    user_id=get_user_id(),
                    dttm=datetime.now(),
                )
            )

    @staticmethod
    def remove_favorite(chart: Slice) -> None:
        fav = (
            db.session.query(FavStar)
            .filter(
                FavStar.class_name == FavStarClassName.CHART,
                FavStar.obj_id == chart.id,
                FavStar.user_id == get_user_id(),
            )
            .one_or_none()
        )
        if fav:
            db.session.delete(fav)
