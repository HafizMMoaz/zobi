from zobi.utils.log import get_logger_from_status


def test_log_from_status_exception() -> None:
    (func, log_level) = get_logger_from_status(500)
    assert func.__name__ == "exception"
    assert log_level == "exception"


def test_log_from_status_warning() -> None:
    (func, log_level) = get_logger_from_status(422)
    assert func.__name__ == "warning"
    assert log_level == "warning"


def test_log_from_status_info() -> None:
    (func, log_level) = get_logger_from_status(300)
    assert func.__name__ == "info"
    assert log_level == "info"
