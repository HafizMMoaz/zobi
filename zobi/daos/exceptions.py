from zobi.exceptions import ZobiException


class DAOException(ZobiException):
    """
    Base DAO exception class
    """


class DAOFindFailedError(DAOException):
    """
    DAO Find failed
    """

    status = 400
    message = "Find failed"


class DAOCreateFailedError(DAOException):
    """
    DAO Create failed
    """

    message = "Create failed"


class DAOUpdateFailedError(DAOException):
    """
    DAO Update failed
    """

    message = "Update failed"


class DAODeleteFailedError(DAOException):
    """
    DAO Delete failed
    """

    message = "Delete failed"


class DatasourceTypeNotSupportedError(DAOException):
    """
    DAO datasource query source type is not supported
    """

    status = 422
    message = "DAO datasource query source type is not supported"


class DatasourceNotFound(DAOException):
    status = 404
    message = "Datasource does not exist"


class DatasourceValueIsIncorrect(DAOException):
    status = 422
    message = "Datasource value is neither id or uuid"
