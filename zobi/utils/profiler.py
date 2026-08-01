
from typing import Any, Callable
from unittest import mock

from werkzeug.wrappers import Request, Response

try:
    from pyinstrument import Profiler
except ModuleNotFoundError:
    Profiler = None


class ZobiProfiler:  # pylint: disable=too-few-public-methods
    """
    WSGI middleware to instrument Zobi.

    To see the instrumentation for a given page, set `PROFILING=True`
    in the config, and append `?_instrument=1` to the page.
    """

    def __init__(
        self,
        app: Callable[[Any, Any], Any],
        interval: float = 0.0001,
    ):
        self.app = app
        self.interval = interval

    @Request.application
    def __call__(self, request: Request) -> Response:
        if request.args.get("_instrument") != "1":
            return Response.from_app(self.app, request.environ)

        if Profiler is None:
            raise Exception(  # pylint: disable=broad-exception-raised
                "The module pyinstrument is not installed."
            )

        profiler = Profiler(interval=self.interval)

        # call original request
        fake_start_response = mock.MagicMock()
        with profiler:
            self.app(request.environ, fake_start_response)

        # return HTML profiling information
        return Response(profiler.output_html(), mimetype="text/html")
