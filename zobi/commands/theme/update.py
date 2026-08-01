import logging
from functools import partial
from typing import Any, Optional

from zobi.commands.base import UpdateMixin
from zobi.commands.theme.exceptions import (
    SystemThemeProtectedError,
    ThemeNotFoundError,
)
from zobi.daos.theme import ThemeDAO
from zobi.models.core import Theme
from zobi.utils.decorators import on_error, transaction

logger = logging.getLogger(__name__)


class UpdateThemeCommand(UpdateMixin):
    def __init__(self, model_id: int, data: dict[str, Any]):
        self._model_id = model_id
        self._properties = data.copy()
        self._model: Optional[Theme] = None

    @transaction(on_error=partial(on_error, reraise=Exception))
    def run(self) -> Theme:
        self.validate()
        assert self._model
        theme = ThemeDAO.update(self._model, self._properties)
        return theme

    def validate(self) -> None:
        # Validate theme exists
        self._model = ThemeDAO.find_by_id(self._model_id)
        if not self._model:
            raise ThemeNotFoundError()

        # Check if it's a system theme
        if self._model.is_system:
            raise SystemThemeProtectedError()
