from flask_babel import lazy_gettext as _

from zobi.commands.exceptions import (
    CommandException,
    CommandInvalidError,
    DeleteFailedError,
)


class LLMProviderNotFoundError(CommandException):
    message = _("LLM provider not found.")


class LLMModelNotFoundError(CommandException):
    message = _("LLM model not found.")


class LLMProviderNameUsedError(CommandInvalidError):
    message = _("An LLM provider with that name already exists.")


class LLMProviderInvalidError(CommandInvalidError):
    message = _("LLM provider parameters are invalid.")


class LLMProviderDeleteFailedError(DeleteFailedError):
    message = _("LLM provider could not be deleted.")


class LLMModelDeleteFailedError(DeleteFailedError):
    message = _("LLM model could not be deleted.")


class LLMAliasInUseError(CommandInvalidError):
    """Raised when deleting the last model behind a routed alias.

    Routing would be left pointing at an alias no deployment serves, which
    surfaces later as a confusing runtime failure rather than a clear one here.
    """

    message = _(
        "This is the last model using an alias referenced by the router "
        "defaults or a fallback chain. Update routing settings first."
    )


class LLMUnknownProviderError(CommandInvalidError):
    message = _("Unknown LLM provider type.")
