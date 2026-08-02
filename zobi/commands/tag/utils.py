from typing import Optional, Union

from zobi.daos.chart import ChartDAO
from zobi.daos.dashboard import DashboardDAO
from zobi.daos.query import SavedQueryDAO
from zobi.models.dashboard import Dashboard
from zobi.models.slice import Slice
from zobi.models.sql_lab import SavedQuery
from zobi.tags.models import ObjectType


def to_object_type(object_type: Union[ObjectType, int, str]) -> Optional[ObjectType]:
    if isinstance(object_type, ObjectType):
        return object_type
    for type_ in ObjectType:
        if object_type in [type_.value, type_.name]:
            return type_
    return None


def to_object_model(
    object_type: ObjectType, object_id: int
) -> Optional[Union[Dashboard, SavedQuery, Slice]]:
    if ObjectType.dashboard == object_type:
        return DashboardDAO.find_by_id(object_id)
    if ObjectType.query == object_type:
        return SavedQueryDAO.find_by_id(object_id)
    if ObjectType.chart == object_type:
        return ChartDAO.find_by_id(object_id)
    return None
