import logging
from typing import Any, Optional

from flask_appbuilder.models.sqla import Model

from zobi import db
from zobi.commands.base import BaseCommand, UpdateMixin
from zobi.commands.tag.exceptions import TagInvalidError, TagNotFoundError
from zobi.commands.tag.utils import to_object_type
from zobi.daos.tag import TagDAO
from zobi.tags.models import Tag
from zobi.utils.decorators import transaction

logger = logging.getLogger(__name__)


class UpdateTagCommand(UpdateMixin, BaseCommand):
    def __init__(self, model_id: int, data: dict[str, Any]):
        self._model_id = model_id
        self._properties = data.copy()
        self._model: Optional[Tag] = None

    @transaction()
    def run(self) -> Model:
        self.validate()
        assert self._model
        self._model.name = self._properties["name"]
        TagDAO.create_tag_relationship(
            objects_to_tag=self._properties.get("objects_to_tag", []),
            tag=self._model,
        )
        self._model.description = self._properties.get("description")
        db.session.add(self._model)

        return self._model

    def validate(self) -> None:
        exceptions = []
        # Validate/populate model exists
        self._model = TagDAO.find_by_id(self._model_id)
        if not self._model:
            raise TagNotFoundError()

        # Validate object_id
        if objects_to_tag := self._properties.get("objects_to_tag"):
            # Validate object type
            for obj_type, _ in objects_to_tag:
                object_type = to_object_type(obj_type)
                if not object_type:
                    exceptions.append(
                        TagInvalidError(f"invalid object type {object_type}")
                    )

        if exceptions:
            raise TagInvalidError(exceptions=exceptions)
