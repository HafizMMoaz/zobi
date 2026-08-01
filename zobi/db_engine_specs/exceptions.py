from zobi.exceptions import ZobiException


class ZobiDBAPIError(ZobiException):
    pass


class ZobiDBAPIDataError(ZobiDBAPIError):
    pass


class ZobiDBAPIDatabaseError(ZobiDBAPIError):
    pass


class ZobiDBAPIConnectionError(ZobiDBAPIError):
    pass


class ZobiDBAPIOperationalError(ZobiDBAPIError):
    pass


class ZobiDBAPIProgrammingError(ZobiDBAPIError):
    status = 400
