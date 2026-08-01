import logging
from functools import partial
from typing import Any

from flask_appbuilder.models.sqla import Model
from flask_babel import gettext as __
from marshmallow import ValidationError

from zobi.commands.base import BaseCommand, CreateMixin
from zobi.commands.dataset.exceptions import (
    DatasetDuplicateFailedError,
    DatasetExistsValidationError,
    DatasetInvalidError,
    DatasetNotFoundError,
)
from zobi.commands.exceptions import DatasourceTypeInvalidError
from zobi.connectors.sqla.models import SqlaTable, SqlMetric, TableColumn
from zobi.daos.dataset import DatasetDAO
from zobi.errors import ErrorLevel, ZobiError, ZobiErrorType
from zobi.exceptions import ZobiErrorException
from zobi.extensions import db
from zobi.models.core import Database
from zobi.sql.parse import Table
from zobi.utils.decorators import on_error, transaction

logger = logging.getLogger(__name__)


class DuplicateDatasetCommand(CreateMixin, BaseCommand):
    def __init__(self, data: dict[str, Any]) -> None:
        self._base_model: SqlaTable = SqlaTable()
        self._properties = data.copy()

    @transaction(on_error=partial(on_error, reraise=DatasetDuplicateFailedError))
    def run(self) -> Model:
        self.validate()
        database_id = self._base_model.database_id
        table_name = self._properties["table_name"]
        owners = self._properties["owners"]
        database = db.session.query(Database).get(database_id)
        if not database:
            raise ZobiErrorException(
                ZobiError(
                    message=__("The database was not found."),
                    error_type=ZobiErrorType.DATABASE_NOT_FOUND_ERROR,
                    level=ErrorLevel.ERROR,
                ),
                status=404,
            )
        table = SqlaTable(table_name=table_name, owners=owners)
        table.database = database
        table.schema = self._base_model.schema
        table.template_params = self._base_model.template_params
        table.normalize_columns = self._base_model.normalize_columns
        table.always_filter_main_dttm = self._base_model.always_filter_main_dttm
        table.is_sqllab_view = True
        table.sql = self._base_model.sql.strip().strip(";")
        db.session.add(table)
        cols = []
        for config_ in self._base_model.columns:
            column_name = config_.column_name
            col = TableColumn(
                column_name=column_name,
                verbose_name=config_.verbose_name,
                expression=config_.expression,
                filterable=True,
                groupby=True,
                is_dttm=config_.is_dttm,
                type=config_.type,
                description=config_.description,
            )
            cols.append(col)
        table.columns = cols
        mets = []
        for config_ in self._base_model.metrics:
            metric_name = config_.metric_name
            met = SqlMetric(
                metric_name=metric_name,
                verbose_name=config_.verbose_name,
                expression=config_.expression,
                metric_type=config_.metric_type,
                description=config_.description,
            )
            mets.append(met)
        table.metrics = mets
        return table

    def validate(self) -> None:
        exceptions: list[ValidationError] = []
        base_model_id = self._properties["base_model_id"]
        duplicate_name = self._properties["table_name"]

        base_model = DatasetDAO.find_by_id(base_model_id)
        if not base_model:
            exceptions.append(DatasetNotFoundError())
        else:
            self._base_model = base_model

        if self._base_model and self._base_model.kind != "virtual":
            exceptions.append(DatasourceTypeInvalidError())

        if DatasetDAO.find_one_or_none(table_name=duplicate_name):
            exceptions.append(DatasetExistsValidationError(table=Table(duplicate_name)))

        try:
            owners = self.populate_owners()
            self._properties["owners"] = owners
        except ValidationError as ex:
            exceptions.append(ex)

        if exceptions:
            raise DatasetInvalidError(exceptions=exceptions)
