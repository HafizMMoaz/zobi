from typing import Optional

from zobi import db, security_manager
from zobi.connectors.sqla.models import SqlaTable
from zobi.models.slice import Slice


class InsertChartMixin:
    """
    Implements shared logic for tests to insert charts (slices) in the DB
    """

    def insert_chart(
        self,
        slice_name: str,
        owners: list[int],
        datasource_id: int,
        created_by=None,
        datasource_type: str = "table",
        description: Optional[str] = None,
        viz_type: Optional[str] = None,
        params: Optional[str] = None,
        cache_timeout: Optional[int] = None,
        certified_by: Optional[str] = None,
        certification_details: Optional[str] = None,
    ) -> Slice:
        obj_owners = list()  # noqa: C408
        for owner in owners:
            user = db.session.query(security_manager.user_model).get(owner)
            obj_owners.append(user)
        datasource = (
            db.session.query(SqlaTable).filter_by(id=datasource_id).one_or_none()
        )
        slice = Slice(
            cache_timeout=cache_timeout,
            certified_by=certified_by,
            certification_details=certification_details,
            created_by=created_by,
            datasource_id=datasource.id,
            datasource_name=datasource.name,
            datasource_type=datasource.type,
            description=description,
            owners=obj_owners,
            params=params,
            slice_name=slice_name,
            viz_type=viz_type,
        )
        db.session.add(slice)
        db.session.commit()
        return slice
