from flask_appbuilder.api import BaseApi


class RestApi(BaseApi):
    """
    Base REST API class for Zobi with browser login support.

    This class extends Flask-AppBuilder's BaseApi and enables browser-based
    authentication by default.
    """

    allow_browser_login = True


__all__ = ["RestApi"]
