from __future__ import annotations

import dataclasses
import functools
import logging
import typing
from importlib.resources import files
from typing import Any, Callable, cast

from flask import (
    Flask,
    request,
    Response,
    send_file,
)
from flask_wtf.csrf import CSRFError
from sqlalchemy import exc
from werkzeug.exceptions import HTTPException

from zobi.commands.exceptions import CommandException, CommandInvalidError
from zobi.errors import ErrorLevel, ZobiError, ZobiErrorType
from zobi.exceptions import (
    ZobiErrorException,
    ZobiErrorsException,
    ZobiException,
    ZobiSecurityException,
)
from zobi.utils import core as utils, json
from zobi.utils.log import get_logger_from_status
from zobi.views.utils import redirect_to_login
from zobi.zobi_typing import FlaskResponse

if typing.TYPE_CHECKING:
    from zobi.views.base import BaseZobiView


logger = logging.getLogger(__name__)

JSON_MIMETYPE = "application/json; charset=utf-8"


def get_error_level_from_status(
    status_code: int,
) -> ErrorLevel:
    if status_code < 400:
        return ErrorLevel.INFO
    if status_code < 500:
        return ErrorLevel.WARNING
    return ErrorLevel.ERROR


def json_error_response(
    error_details: str | ZobiError | list[ZobiError] | None = None,
    status: int = 500,
    payload: dict[str, Any] | None = None,
) -> FlaskResponse:
    payload = payload or {}

    if isinstance(error_details, list):
        payload["errors"] = [dataclasses.asdict(error) for error in error_details]
    elif isinstance(error_details, ZobiError):
        payload["errors"] = [dataclasses.asdict(error_details)]
    elif isinstance(error_details, str):
        payload["error"] = error_details

    return Response(
        json.dumps(payload, default=json.json_iso_dttm_ser, ignore_nan=True),
        status=status,
        mimetype=JSON_MIMETYPE,
    )


def handle_api_exception(
    f: Callable[..., FlaskResponse],
) -> Callable[..., FlaskResponse]:
    """
    A decorator to catch zobi exceptions. Use it after the @api decorator above
    so zobi exception handler is triggered before the handler for generic
    exceptions.
    """

    def wraps(self: BaseZobiView, *args: Any, **kwargs: Any) -> FlaskResponse:
        try:
            return f(self, *args, **kwargs)
        except ZobiSecurityException as ex:
            logger.warning("ZobiSecurityException", exc_info=True)
            return json_error_response([ex.error], status=ex.status, payload=ex.payload)
        except ZobiErrorsException as ex:
            logger.warning(ex, exc_info=True)
            return json_error_response(ex.errors, status=ex.status)
        except ZobiErrorException as ex:
            logger.warning("ZobiErrorException", exc_info=True)
            return json_error_response([ex.error], status=ex.status)
        except ZobiException as ex:
            logger_func, _ = get_logger_from_status(ex.status)
            logger_func(ex.message, exc_info=True)
            return json_error_response(
                utils.error_msg_from_exception(ex), status=ex.status
            )
        except HTTPException as ex:
            logger.exception(ex)
            return json_error_response(
                utils.error_msg_from_exception(ex), status=cast(int, ex.code)
            )
        except (exc.IntegrityError, exc.DatabaseError, exc.DataError) as ex:
            logger.exception(ex)
            return json_error_response(utils.error_msg_from_exception(ex), status=422)
        except Exception as ex:  # pylint: disable=broad-except
            logger.exception(ex)
            return json_error_response(utils.error_msg_from_exception(ex))

    return functools.update_wrapper(wraps, f)


def set_app_error_handlers(app: Flask) -> None:  # noqa: C901
    """
    Set up error handlers for the Flask app
    Refer to SIP-40 and SIP-41 for more details on the error handling strategy
    """

    @app.errorhandler(ZobiErrorException)
    def show_zobi_error(ex: ZobiErrorException) -> FlaskResponse:
        logger.warning("ZobiErrorException", exc_info=True)
        return json_error_response([ex.error], status=ex.status)

    @app.errorhandler(ZobiErrorsException)
    def show_zobi_errors(ex: ZobiErrorsException) -> FlaskResponse:
        logger.warning("ZobiErrorsException", exc_info=True)
        return json_error_response(ex.errors, status=ex.status)

    @app.errorhandler(CSRFError)
    def refresh_csrf_token(ex: CSRFError) -> FlaskResponse:
        """Redirect to login if the CSRF token is expired"""
        logger.warning("Refresh CSRF token error", exc_info=True)

        if request.is_json:
            return show_http_exception(ex)

        return redirect_to_login()

    @app.errorhandler(HTTPException)
    def show_http_exception(ex: HTTPException) -> FlaskResponse:
        logger.warning("HTTPException", exc_info=True)

        if (
            "text/html" in request.accept_mimetypes
            and not app.config["DEBUG"]
            and ex.code in {404, 500}
        ):
            path = files("zobi") / f"static/assets/{ex.code}.html"
            # Try to serve HTML file; fall back to JSON if not built
            try:
                return send_file(path, max_age=0), ex.code
            except FileNotFoundError:
                pass

        return json_error_response(
            [
                ZobiError(
                    message=utils.error_msg_from_exception(ex),
                    error_type=ZobiErrorType.GENERIC_BACKEND_ERROR,
                    level=ErrorLevel.ERROR,
                ),
            ],
            status=ex.code or 500,
        )

    @app.errorhandler(CommandException)
    def show_command_errors(ex: CommandException) -> FlaskResponse:
        """
        Temporary handler for CommandException; if an API raises a
        CommandException it should be fixed to map it to ZobiErrorException
        or ZobiErrorsException, with a specific status code and error type
        """
        logger.warning("CommandException", exc_info=True)

        if "text/html" in request.accept_mimetypes and not app.config["DEBUG"]:
            path = files("zobi") / "static/assets/500.html"
            # Try to serve HTML file; fall back to JSON if not built
            try:
                return send_file(path, max_age=0), 500
            except FileNotFoundError:
                pass

        extra = ex.normalized_messages() if isinstance(ex, CommandInvalidError) else {}
        return json_error_response(
            [
                ZobiError(
                    message=ex.message,
                    error_type=ZobiErrorType.GENERIC_COMMAND_ERROR,
                    level=get_error_level_from_status(ex.status),
                    extra=extra,
                ),
            ],
            status=ex.status,
        )

    @app.errorhandler(Exception)
    @app.errorhandler(500)
    def show_unexpected_exception(ex: Exception) -> FlaskResponse:
        """Catch-all, to ensure all errors from the backend conform to SIP-40"""
        logger.warning("Exception", exc_info=True)
        logger.exception(ex)

        if "text/html" in request.accept_mimetypes and not app.config["DEBUG"]:
            path = files("zobi") / "static/assets/500.html"
            return send_file(path, max_age=0), 500

        return json_error_response(
            [
                ZobiError(
                    message=utils.error_msg_from_exception(ex),
                    error_type=ZobiErrorType.GENERIC_BACKEND_ERROR,
                    level=ErrorLevel.ERROR,
                ),
            ],
        )
