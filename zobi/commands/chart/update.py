import logging
from datetime import datetime
from functools import partial
from typing import Any, Optional

from flask import g
from flask_appbuilder.models.sqla import Model
from marshmallow import ValidationError

from zobi import security_manager
from zobi.commands.base import BaseCommand, UpdateMixin
from zobi.commands.chart.exceptions import (
    ChartForbiddenError,
    ChartInvalidError,
    ChartNotFoundError,
    ChartUpdateFailedError,
    DashboardsNotFoundValidationError,
    DatasourceTypeUpdateRequiredValidationError,
)
from zobi.commands.utils import get_datasource_by_id, update_tags, validate_tags
from zobi.daos.chart import ChartDAO
from zobi.daos.dashboard import DashboardDAO
from zobi.exceptions import ZobiSecurityException
from zobi.models.dashboard import Dashboard
from zobi.models.slice import Slice
from zobi.tags.models import ObjectType
from zobi.utils.decorators import on_error, transaction

logger = logging.getLogger(__name__)


def is_query_context_update(properties: dict[str, Any]) -> bool:
    return set(properties) == {"query_context", "query_context_generation"} and bool(
        properties.get("query_context_generation")
    )


class UpdateChartCommand(UpdateMixin, BaseCommand):
    def __init__(self, model_id: int, data: dict[str, Any]):
        self._model_id = model_id
        self._properties = data.copy()
        self._model: Optional[Slice] = None

    @transaction(on_error=partial(on_error, reraise=ChartUpdateFailedError))
    def run(self) -> Model:
        self.validate()
        assert self._model

        # Update tags
        if (tags := self._properties.pop("tags", None)) is not None:
            update_tags(ObjectType.chart, self._model.id, self._model.tags, tags)

        if self._properties.get("query_context_generation") is None:
            self._properties["last_saved_at"] = datetime.now()
            self._properties["last_saved_by"] = g.user

        return ChartDAO.update(self._model, self._properties)

    def _validate_new_dashboard_access(
        self, requested_dashboards: list[Dashboard], exceptions: list[Exception]
    ) -> None:
        """
        Validate user has access to any NEW dashboard relationships.
        Existing relationships are preserved to maintain chart ownership rights.
        """
        if not self._model:
            return

        existing_dashboard_ids = {d.id for d in self._model.dashboards}
        requested_dashboard_ids = {d.id for d in requested_dashboards}

        if new_dashboard_ids := requested_dashboard_ids - existing_dashboard_ids:
            # For NEW dashboard relationships, verify user has access
            accessible_dashboards = DashboardDAO.find_by_ids(list(new_dashboard_ids))
            accessible_dashboard_ids = {d.id for d in accessible_dashboards}
            unauthorized_dashboard_ids = new_dashboard_ids - accessible_dashboard_ids

            if unauthorized_dashboard_ids:
                exceptions.append(DashboardsNotFoundValidationError())

    def validate(self) -> None:  # noqa: C901
        exceptions: list[ValidationError] = []
        dashboard_ids = self._properties.get("dashboards")
        owner_ids: Optional[list[int]] = self._properties.get("owners")
        tag_ids: Optional[list[int]] = self._properties.get("tags")

        # Validate if datasource_id is provided datasource_type is required
        datasource_id = self._properties.get("datasource_id")
        if datasource_id is not None:
            datasource_type = self._properties.get("datasource_type", "")
            if not datasource_type:
                exceptions.append(DatasourceTypeUpdateRequiredValidationError())

        # Validate/populate model exists
        self._model = ChartDAO.find_by_id(self._model_id)
        if not self._model:
            raise ChartNotFoundError()

        # Check and update ownership; when only updating query context we ignore
        # ownership so the update can be performed by report workers
        if not is_query_context_update(self._properties):
            try:
                security_manager.raise_for_ownership(self._model)
                owners = self.compute_owners(
                    self._model.owners,
                    owner_ids,
                )
                self._properties["owners"] = owners
            except ZobiSecurityException as ex:
                raise ChartForbiddenError() from ex
            except ValidationError as ex:
                exceptions.append(ex)

        # validate tags
        try:
            validate_tags(ObjectType.chart, self._model.tags, tag_ids)
        except ValidationError as ex:
            exceptions.append(ex)

        # Validate/Populate datasource
        if datasource_id is not None:
            try:
                datasource = get_datasource_by_id(datasource_id, datasource_type)
                self._properties["datasource_name"] = datasource.name
            except ValidationError as ex:
                exceptions.append(ex)

        # Validate/Populate dashboards only if it's a list
        if dashboard_ids is not None:
            # First, verify all requested dashboards exist
            dashboards = DashboardDAO.find_by_ids(
                dashboard_ids,
                skip_base_filter=True,
            )
            if len(dashboards) != len(dashboard_ids):
                exceptions.append(DashboardsNotFoundValidationError())
            else:
                # Then, validate user has access to any NEW dashboard relationships
                self._validate_new_dashboard_access(dashboards, exceptions)
            self._properties["dashboards"] = dashboards

        if exceptions:
            raise ChartInvalidError(exceptions=exceptions)
