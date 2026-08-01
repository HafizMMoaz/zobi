from zobi.exceptions import ZobiException


class NotificationError(ZobiException):
    """
    Generic unknown exception - only used when
    bubbling up unknown exceptions from lower levels
    """


class SlackV1NotificationError(ZobiException):
    """
    Report should not be run with the slack v1 api
    """

    message = """Report should not be run with the Slack V1 api.
    Attempting to run with V2 if required Slack scopes are available"""

    status = 422


class NotificationParamException(ZobiException):
    status = 422


class NotificationAuthorizationException(ZobiException):
    status = 401


class NotificationUnprocessableException(ZobiException):
    """
    When a third party client service is down.
    The request should be retried. There is no further
    action required on our part or the user's other than to retry
    """

    status = 400


class NotificationMalformedException(ZobiException):
    status = 400
