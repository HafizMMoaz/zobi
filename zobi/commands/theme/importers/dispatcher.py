import logging
from typing import Any

from marshmallow.exceptions import ValidationError

from zobi.commands.base import BaseCommand
from zobi.commands.exceptions import CommandInvalidError
from zobi.commands.importers.exceptions import IncorrectVersionError
from zobi.commands.theme.import_themes import (
    ImportThemesCommand as ImportThemesCommandV1,
)

logger = logging.getLogger(__name__)

# list of different import formats supported
command_versions = [
    ImportThemesCommandV1,
]


class ImportThemesCommand(BaseCommand):
    """
    Import themes.

    This command dispatches the import to different versions of the command
    until it finds one that matches.
    """

    def __init__(self, contents: dict[str, str], *args: Any, **kwargs: Any):
        self.contents = contents
        self.args = args
        self.kwargs = kwargs

    def run(self) -> None:
        # iterate over all commands until we find a version that can
        # handle the contents
        for version in command_versions:
            command = version(self.contents, *self.args, **self.kwargs)
            try:
                command.run()
                return
            except IncorrectVersionError:
                logger.debug("File not handled by command, skipping")
            except (CommandInvalidError, ValidationError):
                # found right version, but file is invalid
                logger.info("Command failed validation")
                raise
            except Exception:
                # validation succeeded but something went wrong
                logger.exception("Error running import command")
                raise

        raise CommandInvalidError("Could not find a valid command to import file")

    def validate(self) -> None:
        pass
