import logging
from datetime import datetime
from functools import partial
from typing import Any, Optional

from flask import g
from flask_appbuilder.models.sqla import Model
from marshmallow import ValidationError

from zobi import security_manager
from zobi.commands.base import BaseCommand, CreateMixin
from zobi.commands.chart.exceptions import (
    ChartCreateFailedError,
    ChartInvalidError,
    DashboardsForbiddenError,
    DashboardsNotFoundValidationError,
)
from zobi.commands.utils import get_datasource_by_id
from zobi.daos.chart import ChartDAO
from zobi.daos.dashboard import DashboardDAO
from zobi.utils.decorators import on_error, transaction

logger = logging.getLogger(__name__)


class CreateChartCommand(CreateMixin, BaseCommand):
    def __init__(self, data: dict[str, Any]):
        self._properties = data.copy()

    @transaction(on_error=partial(on_error, reraise=ChartCreateFailedError))
    def run(self) -> Model:
        self.validate()
        self._properties["last_saved_at"] = datetime.now()
        self._properties["last_saved_by"] = g.user
        return ChartDAO.create(attributes=self._properties)

    def validate(self) -> None:
        exceptions = []
        datasource_type = self._properties["datasource_type"]
        datasource_id = self._properties["datasource_id"]
        dashboard_ids = self._properties.get("dashboards", [])
        owner_ids: Optional[list[int]] = self._properties.get("owners")

        # Validate/Populate datasource
        try:
            datasource = get_datasource_by_id(datasource_id, datasource_type)
            self._properties["datasource_name"] = datasource.name
        except ValidationError as ex:
            exceptions.append(ex)

        # Validate/Populate dashboards
        dashboards = DashboardDAO.find_by_ids(dashboard_ids)
        if len(dashboards) != len(dashboard_ids):
            exceptions.append(DashboardsNotFoundValidationError())
        for dash in dashboards:
            if not security_manager.is_owner(dash):
                raise DashboardsForbiddenError()
        self._properties["dashboards"] = dashboards

        try:
            owners = self.populate_owners(owner_ids)
            self._properties["owners"] = owners
        except ValidationError as ex:
            exceptions.append(ex)
        if exceptions:
            raise ChartInvalidError(exceptions=exceptions)
