from flask_babel import lazy_gettext as _

from zobi.commands.exceptions import CommandException, DeleteFailedError


class ThemeImportError(CommandException):
    message = _("Error importing theme.")


class ThemeDeleteFailedError(DeleteFailedError):
    message = _("Themes could not be deleted.")


class ThemeNotFoundError(CommandException):
    message = _("Theme not found.")


class SystemThemeProtectedError(CommandException):
    message = _("Cannot modify system themes.")


class SystemThemeInUseError(CommandException):
    message = _("Cannot delete theme that is set as system default or dark theme.")


class ThemeAdministrationDisabledError(CommandException):
    message = _("UI theme administration is not enabled.")
