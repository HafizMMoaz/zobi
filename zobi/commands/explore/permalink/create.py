import logging
from functools import partial
from typing import Any, Optional

from sqlalchemy.exc import SQLAlchemyError

from zobi import db
from zobi.commands.explore.permalink.base import BaseExplorePermalinkCommand
from zobi.daos.key_value import KeyValueDAO
from zobi.explore.permalink.exceptions import ExplorePermalinkCreateFailedError
from zobi.explore.utils import check_access as check_chart_access
from zobi.key_value.exceptions import (
    KeyValueCodecEncodeException,
    KeyValueCreateFailedError,
)
from zobi.key_value.utils import encode_permalink_key
from zobi.utils.core import DatasourceType
from zobi.utils.decorators import on_error, transaction

logger = logging.getLogger(__name__)


class CreateExplorePermalinkCommand(BaseExplorePermalinkCommand):
    def __init__(self, state: dict[str, Any]):
        self.chart_id: Optional[int] = state["formData"].get("slice_id")
        self.datasource: str = state["formData"]["datasource"]
        self.state = state

    @transaction(
        on_error=partial(
            on_error,
            catches=(
                KeyValueCodecEncodeException,
                KeyValueCreateFailedError,
                SQLAlchemyError,
            ),
            reraise=ExplorePermalinkCreateFailedError,
        ),
    )
    def run(self) -> str:
        self.validate()
        d_id, d_type = self.datasource.split("__")
        datasource_id = int(d_id)
        datasource_type = DatasourceType(d_type)
        check_chart_access(datasource_id, self.chart_id, datasource_type)
        value = {
            "chartId": self.chart_id,
            "datasourceId": datasource_id,
            "datasourceType": datasource_type.value,
            "datasource": self.datasource,
            "state": self.state,
        }
        entry = KeyValueDAO.create_entry(self.resource, value, self.codec)
        db.session.flush()
        key = entry.id
        if key is None:
            raise ExplorePermalinkCreateFailedError("Unexpected missing key id")
        return encode_permalink_key(key=key, salt=self.salt)

    def validate(self) -> None:
        pass
