from __future__ import annotations

import logging
from typing import Any, cast, TypedDict

import pandas as pd
from flask import current_app as app
from flask_babel import gettext as __

from zobi import db, results_backend, results_backend_use_msgpack
from zobi.commands.base import BaseCommand
from zobi.errors import ErrorLevel, ZobiError, ZobiErrorType
from zobi.exceptions import ZobiErrorException, ZobiSecurityException
from zobi.models.sql_lab import Query
from zobi.sql.parse import SQLScript
from zobi.sqllab.limiting_factor import LimitingFactor
from zobi.utils import core as utils, csv
from zobi.views.utils import _deserialize_results_payload

logger = logging.getLogger(__name__)


class SqlExportResult(TypedDict):
    query: Query
    count: int
    data: list[Any]


class SqlResultExportCommand(BaseCommand):
    _client_id: str
    _query: Query

    def __init__(
        self,
        client_id: str,
    ) -> None:
        self._client_id = client_id

    def validate(self) -> None:
        self._query = (
            db.session.query(Query).filter_by(client_id=self._client_id).one_or_none()
        )
        if self._query is None:
            raise ZobiErrorException(
                ZobiError(
                    message=__(
                        "The query associated with these results could not be found. "
                        "You need to re-run the original query."
                    ),
                    error_type=ZobiErrorType.RESULTS_BACKEND_ERROR,
                    level=ErrorLevel.ERROR,
                ),
                status=404,
            )

        try:
            self._query.raise_for_access()
        except ZobiSecurityException as ex:
            raise ZobiErrorException(
                ZobiError(
                    message=__("Cannot access the query"),
                    error_type=ZobiErrorType.QUERY_SECURITY_ACCESS_ERROR,
                    level=ErrorLevel.ERROR,
                ),
                status=403,
            ) from ex

    def run(
        self,
    ) -> SqlExportResult:
        self.validate()
        blob = None
        if results_backend and self._query.results_key:
            logger.info(
                "Fetching CSV from results backend [%s]", self._query.results_key
            )
            blob = results_backend.get(self._query.results_key)
        if blob:
            logger.info("Decompressing")
            payload = utils.zlib_decompress(
                blob, decode=not results_backend_use_msgpack
            )
            obj = _deserialize_results_payload(
                payload, self._query, cast(bool, results_backend_use_msgpack)
            )

            df = pd.DataFrame(
                data=obj["data"],
                dtype=object,
                columns=[c["name"] for c in obj["columns"]],
            )

            logger.info("Using pandas to convert to CSV")
        else:
            logger.info("Running a query to turn into CSV")
            if self._query.select_sql:
                sql = self._query.select_sql
                limit = None
            else:
                sql = self._query.executed_sql
                script = SQLScript(sql, self._query.database.db_engine_spec.engine)
                # when a query has multiple statements only the last one returns data
                limit = script.statements[-1].get_limit_value()
            if limit is not None and self._query.limiting_factor in {
                LimitingFactor.QUERY,
                LimitingFactor.DROPDOWN,
                LimitingFactor.QUERY_AND_DROPDOWN,
            }:
                # remove extra row from `increased_limit`
                limit -= 1
            df = self._query.database.get_df(
                sql,
                self._query.catalog,
                self._query.schema,
            )[:limit]

        # Manual encoding using the specified encoding (default to utf-8 if not set)
        csv_string = csv.df_to_escaped_csv(df, index=False, **app.config["CSV_EXPORT"])
        csv_data = csv_string.encode(app.config["CSV_EXPORT"].get("encoding", "utf-8"))

        return {
            "query": self._query,
            "count": len(df.index),
            "data": csv_data,
        }
