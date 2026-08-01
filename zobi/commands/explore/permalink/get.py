import logging
from typing import Optional

from sqlalchemy.exc import SQLAlchemyError

from zobi.commands.dataset.exceptions import DatasetNotFoundError
from zobi.commands.explore.permalink.base import BaseExplorePermalinkCommand
from zobi.daos.key_value import KeyValueDAO
from zobi.explore.permalink.exceptions import ExplorePermalinkGetFailedError
from zobi.explore.permalink.types import ExplorePermalinkValue
from zobi.explore.utils import check_access as check_chart_access
from zobi.key_value.exceptions import (
    KeyValueCodecDecodeException,
    KeyValueGetFailedError,
    KeyValueParseKeyError,
)
from zobi.key_value.utils import decode_permalink_id
from zobi.utils.core import DatasourceType

logger = logging.getLogger(__name__)


class GetExplorePermalinkCommand(BaseExplorePermalinkCommand):
    def __init__(self, key: str):
        self.key = key

    def run(self) -> Optional[ExplorePermalinkValue]:
        self.validate()
        try:
            key = decode_permalink_id(self.key, salt=self.salt)
            value = KeyValueDAO.get_value(self.resource, key, self.codec)
            if value:
                chart_id: Optional[int] = value.get("chartId")
                # keep this backward compatible for old permalinks
                datasource_id: int = (
                    value.get("datasourceId") or value.get("datasetId") or 0
                )
                datasource_type = DatasourceType(
                    value.get("datasourceType", DatasourceType.TABLE)
                )
                check_chart_access(datasource_id, chart_id, datasource_type)
                return value
            return None
        except (
            DatasetNotFoundError,
            KeyValueCodecDecodeException,
            KeyValueGetFailedError,
            KeyValueParseKeyError,
        ) as ex:
            raise ExplorePermalinkGetFailedError(message=ex.message) from ex
        except SQLAlchemyError as ex:
            logger.exception("Error running get command")
            raise ExplorePermalinkGetFailedError() from ex

    def validate(self) -> None:
        pass
