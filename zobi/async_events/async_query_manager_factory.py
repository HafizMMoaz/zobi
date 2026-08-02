from flask import Flask

from zobi.async_events.async_query_manager import AsyncQueryManager
from zobi.utils.class_utils import load_class_from_name


class AsyncQueryManagerFactory:
    def __init__(self) -> None:
        self._async_query_manager: AsyncQueryManager = None  # type: ignore

    def init_app(self, app: Flask) -> None:
        self._async_query_manager = load_class_from_name(
            app.config["GLOBAL_ASYNC_QUERY_MANAGER_CLASS"]
        )()
        self._async_query_manager.init_app(app)

    def instance(self) -> AsyncQueryManager:
        return self._async_query_manager
