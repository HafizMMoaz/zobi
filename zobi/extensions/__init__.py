import json
import logging
import os
from typing import Any, Callable, Optional

import celery
from flask import Flask
from flask_appbuilder import AppBuilder

# Temporary fix for missing flask_appbuilder.utils.legacy module
try:
    from flask_appbuilder.utils.legacy import get_sqla_class
except ImportError:
    # Fallback if legacy module doesn't exist
    from flask_sqlalchemy import SQLAlchemy

    def get_sqla_class() -> Any:
        return SQLAlchemy


from flask_caching.backends.base import BaseCache
from flask_migrate import Migrate
from flask_talisman import Talisman
from flask_wtf.csrf import CSRFProtect
from werkzeug.local import LocalProxy

from zobi.async_events.async_query_manager import AsyncQueryManager
from zobi.async_events.async_query_manager_factory import AsyncQueryManagerFactory
from zobi.extensions.ssh import SSHManagerFactory
from zobi.extensions.stats_logger import BaseStatsLoggerManager
from zobi.security.manager import ZobiSecurityManager
from zobi.utils.cache_manager import CacheManager
from zobi.utils.database import apply_mariadb_ddl_fix
from zobi.utils.encrypt import EncryptedFieldFactory
from zobi.utils.feature_flag_manager import FeatureFlagManager
from zobi.utils.machine_auth import MachineAuthProviderFactory
from zobi.utils.profiler import ZobiProfiler

# Apply MariaDB DDL fix early in the import chain
try:
    apply_mariadb_ddl_fix()
except Exception as ex:
    logging.exception(
        "Applying MariaDB DDL fix failed; continuing without patch: %s", ex
    )


class ResultsBackendManager:
    def __init__(self) -> None:
        self._results_backend = None
        self._use_msgpack = False

    def init_app(self, app: Flask) -> None:
        self._results_backend = app.config["RESULTS_BACKEND"]
        self._use_msgpack = app.config["RESULTS_BACKEND_USE_MSGPACK"]

    @property
    def results_backend(self) -> Optional[BaseCache]:
        return self._results_backend

    @property
    def should_use_msgpack(self) -> bool:
        return self._use_msgpack


class UIManifestProcessor:
    def __init__(self, app_dir: str) -> None:
        self.app: Optional[Flask] = None
        self.manifest: dict[str, dict[str, list[str]]] = {}
        self.manifest_file = f"{app_dir}/static/assets/manifest.json"

    def init_app(self, app: Flask) -> None:
        self.app = app
        # Preload the cache
        self.parse_manifest_json()
        self.register_processor(app)

    def register_processor(self, app: Flask) -> None:
        app.template_context_processors[None].append(self.get_manifest)

    def get_manifest(self) -> dict[str, Callable[[str], list[str]]]:
        loaded_chunks = set()

        def get_files(bundle: str, asset_type: str = "js") -> list[str]:
            files = self.get_manifest_files(bundle, asset_type)
            filtered_files = [f for f in files if f not in loaded_chunks]
            for f in filtered_files:
                loaded_chunks.add(f)
            return filtered_files

        return {
            "js_manifest": lambda bundle: get_files(bundle, "js"),
            "css_manifest": lambda bundle: get_files(bundle, "css"),
            "assets_prefix": (  # type: ignore
                self.app.config["STATIC_ASSETS_PREFIX"] if self.app else ""
            ),
        }

    def parse_manifest_json(self) -> None:
        try:
            with open(self.manifest_file) as f:
                # the manifest includes non-entry files we only need entries in
                # templates
                full_manifest = json.load(f)
                self.manifest = full_manifest.get("entrypoints", {})
        except Exception:  # pylint: disable=broad-except  # noqa: S110
            pass

    def get_manifest_files(self, bundle: str, asset_type: str) -> list[str]:
        if self.app and self.app.debug:
            self.parse_manifest_json()
        return self.manifest.get(bundle, {}).get(asset_type, [])


class ProfilingExtension:  # pylint: disable=too-few-public-methods
    def __init__(self, interval: float = 1e-4) -> None:
        self.interval = interval

    def init_app(self, app: Flask) -> None:
        app.wsgi_app = ZobiProfiler(app.wsgi_app, self.interval)


APP_DIR = os.path.join(os.path.dirname(__file__), os.path.pardir)
appbuilder = AppBuilder(update_perms=False)
async_query_manager_factory = AsyncQueryManagerFactory()
async_query_manager: AsyncQueryManager = LocalProxy(
    async_query_manager_factory.instance
)
cache_manager = CacheManager()
celery_app = celery.Celery()
csrf = CSRFProtect()
db = get_sqla_class()()
_event_logger: dict[str, Any] = {}
encrypted_field_factory = EncryptedFieldFactory()
event_logger = LocalProxy(lambda: _event_logger.get("event_logger"))
feature_flag_manager = FeatureFlagManager()
machine_auth_provider_factory = MachineAuthProviderFactory()
manifest_processor = UIManifestProcessor(APP_DIR)
migrate = Migrate()
profiling = ProfilingExtension()
results_backend_manager = ResultsBackendManager()
security_manager: ZobiSecurityManager = LocalProxy(lambda: appbuilder.sm)
ssh_manager_factory = SSHManagerFactory()
stats_logger_manager = BaseStatsLoggerManager()
talisman = Talisman()
