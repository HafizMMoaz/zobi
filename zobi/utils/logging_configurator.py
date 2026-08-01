import abc
import logging
from logging.handlers import TimedRotatingFileHandler

import flask.app
import flask.config

logger = logging.getLogger(__name__)


class LoggingConfigurator(abc.ABC):  # pylint: disable=too-few-public-methods
    @abc.abstractmethod
    def configure_logging(
        self, app_config: flask.config.Config, debug_mode: bool
    ) -> None:
        pass


class DefaultLoggingConfigurator(  # pylint: disable=too-few-public-methods
    LoggingConfigurator
):
    def configure_logging(
        self, app_config: flask.config.Config, debug_mode: bool
    ) -> None:
        if app_config["SILENCE_FAB"]:
            logging.getLogger("flask_appbuilder").setLevel(logging.ERROR)

        # basicConfig() will set up a default StreamHandler on stderr
        logging.basicConfig(format=app_config["LOG_FORMAT"])
        logging.getLogger().setLevel(app_config["LOG_LEVEL"])

        # Route Python warnings through the logging framework so they get
        # proper log-level formatting instead of raw stderr output. Without
        # this, the warnings module writes multi-line text to stderr where
        # the source-code context line has no level prefix, causing log
        # aggregators to misclassify it as an error.
        logging.captureWarnings(True)

        if app_config["ENABLE_TIME_ROTATE"]:
            logging.getLogger().setLevel(app_config["TIME_ROTATE_LOG_LEVEL"])
            handler = TimedRotatingFileHandler(
                app_config["FILENAME"],
                when=app_config["ROLLOVER"],
                interval=app_config["INTERVAL"],
                backupCount=app_config["BACKUP_COUNT"],
            )
            logging.getLogger().addHandler(handler)

        logger.debug("logging was configured successfully")
